import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../admin/audit-log/audit-log.service';
import { ApprovalStatus } from '@prisma/client';

@Injectable()
export class ExamOfficerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService
  ) {}

  private async getOfficer(userId: string) {
    const officer = await this.prisma.subebOfficer.findUnique({
      where: { userId },
      include: { stateRef: true, lga: true, user: true }
    });
    if (!officer) {
      throw new NotFoundException('Exam Officer profile not found');
    }
    if (!officer.lgaId) {
      throw new ForbiddenException('Exam Officer is not assigned to an LGA');
    }
    return officer;
  }

  private async getActiveTerm(officer?: any) {
    const stateId = officer?.stateId;

    // 1. Prioritize current term with OPEN status belonging to current OPEN session for this state
    let activeTerm = await this.prisma.term.findFirst({
      where: {
        isCurrent: true,
        status: 'OPEN' as any,
        session: {
          isCurrent: true,
          status: 'OPEN' as any,
          ...(stateId ? { stateId } : {}),
        },
        ...(stateId ? { stateId } : {}),
      },
      include: { session: true },
      orderBy: { updatedAt: 'desc' },
    });

    // 2. Fallback: current term belonging to current session (with stateId)
    if (!activeTerm) {
      activeTerm = await this.prisma.term.findFirst({
        where: {
          isCurrent: true,
          session: {
            isCurrent: true,
            ...(stateId ? { stateId } : {}),
          },
          ...(stateId ? { stateId } : {}),
        },
        include: { session: true },
        orderBy: { updatedAt: 'desc' },
      });
    }

    // 3. Fallback: current term belonging to current session (across states)
    if (!activeTerm) {
      activeTerm = await this.prisma.term.findFirst({
        where: {
          isCurrent: true,
          session: {
            isCurrent: true,
          },
        },
        include: { session: true },
        orderBy: { updatedAt: 'desc' },
      });
    }

    // 4. Fallback: any isCurrent: true term
    if (!activeTerm) {
      activeTerm = await this.prisma.term.findFirst({
        where: { isCurrent: true },
        include: { session: true },
        orderBy: { updatedAt: 'desc' },
      });
    }

    // 5. Fallback: active term
    if (!activeTerm) {
      activeTerm = await this.prisma.term.findFirst({
        where: { isActive: true },
        include: { session: true },
        orderBy: { updatedAt: 'desc' },
      });
    }

    if (!activeTerm) {
      throw new BadRequestException('No active academic term found');
    }
    return activeTerm;
  }

  async getDashboardAnalytics(userId: string) {
    const officer = await this.getOfficer(userId);
    const activeTerm = await this.getActiveTerm(officer);

    // Resolve officer's LGA(s) - handle single or multiple comma-separated LGAs
    const rawLgaId = officer.lgaId as string;
    const lgaIds = rawLgaId.includes(',')
      ? rawLgaId.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [rawLgaId];

    let lgas = await this.prisma.localGovernmentArea.findMany({
      where: { id: { in: lgaIds } },
      select: { id: true, name: true, code: true, state: true }
    });

    if (lgas.length === 0 && officer.lga) {
      lgas = [officer.lga];
    }

    // Fetch all active schools in the officer's LGA(s) with their assigned School IT person and student count
    const schools = await this.prisma.school.findMany({
      where: { lgaId: { in: lgaIds }, isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        level: true,
        lgaId: true,
        lga: {
          select: { id: true, name: true, code: true }
        },
        schoolIts: {
          where: { isActive: true },
          select: {
            id: true,
            schoolItId: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isActive: true,
            createdAt: true,
          }
        },
        _count: {
          select: {
            students: { where: { isActive: true } }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const schoolIds = schools.map(s => s.id);
    const totalSchools = schools.length;
    const totalStudents = schools.reduce((acc, s) => acc + (s._count?.students || 0), 0);

    const allSchoolIts = schools.flatMap(s => s.schoolIts);
    const totalSchoolIt = allSchoolIts.length;
    const schoolsWithItCount = schools.filter(s => s.schoolIts.length > 0).length;
    const schoolsWithoutItCount = Math.max(0, totalSchools - schoolsWithItCount);

    // Fetch all active term assessments for schools in these LGA(s) in a single fast batch query
    const assessments = await this.prisma.assessment.findMany({
      where: {
        class: { schoolId: { in: schoolIds } },
        termId: activeTerm.id,
      },
      select: {
        studentId: true,
        status: true,
        createdAt: true,
        class: { select: { schoolId: true } },
      },
    });

    // Group assessments by schoolId
    const assessmentsBySchool = new Map<string, {
      awaiting: Set<string>;
      approved: Set<string>;
      rejected: Set<string>;
      allAssessed: Set<string>;
      lastSubmission: Date | null;
    }>();

    for (const a of assessments) {
      const sId = a.class.schoolId;
      if (!assessmentsBySchool.has(sId)) {
        assessmentsBySchool.set(sId, {
          awaiting: new Set(),
          approved: new Set(),
          rejected: new Set(),
          allAssessed: new Set(),
          lastSubmission: null,
        });
      }
      const data = assessmentsBySchool.get(sId)!;
      data.allAssessed.add(a.studentId);
      if (a.status === ApprovalStatus.AWAITING_APPROVAL) {
        data.awaiting.add(a.studentId);
      } else if (a.status === ApprovalStatus.APPROVED) {
        data.approved.add(a.studentId);
      } else if (a.status === ApprovalStatus.REJECTED) {
        data.rejected.add(a.studentId);
      }
      if (!data.lastSubmission || (a.createdAt && a.createdAt > data.lastSubmission)) {
        data.lastSubmission = a.createdAt;
      }
    }

    const allAwaitingStudents = new Set<string>();
    const allApprovedStudents = new Set<string>();

    for (const data of assessmentsBySchool.values()) {
      for (const s of data.awaiting) allAwaitingStudents.add(s);
      for (const s of data.approved) allApprovedStudents.add(s);
    }
    const awaitingApprovalCount = allAwaitingStudents.size;
    const approvedCount = allApprovedStudents.size;

    // Build the analytical relation records between School IT persons, their schools, and active exam submissions
    const schoolItRelations = schools.map(school => {
      const itOfficer = school.schoolIts[0] ? {
        id: school.schoolIts[0].id,
        schoolItId: school.schoolIts[0].schoolItId,
        name: `${school.schoolIts[0].firstName} ${school.schoolIts[0].lastName}`.trim(),
        email: school.schoolIts[0].email,
        phone: school.schoolIts[0].phone,
        isActive: school.schoolIts[0].isActive,
        assignedAt: school.schoolIts[0].createdAt,
      } : null;

      const schoolAssessments = assessmentsBySchool.get(school.id);
      const awaiting = schoolAssessments ? schoolAssessments.awaiting.size : 0;
      const approved = schoolAssessments ? schoolAssessments.approved.size : 0;
      const rejected = schoolAssessments ? schoolAssessments.rejected.size : 0;
      const totalAssessed = schoolAssessments ? schoolAssessments.allAssessed.size : 0;

      let overallStatus: 'AWAITING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'NO_RESULTS' = 'NO_RESULTS';
      if (awaiting > 0) {
        overallStatus = 'AWAITING_APPROVAL';
      } else if (approved > 0) {
        overallStatus = 'APPROVED';
      } else if (rejected > 0) {
        overallStatus = 'REJECTED';
      }

      return {
        schoolId: school.id,
        schoolName: school.name,
        schoolCode: school.code,
        schoolLevel: school.level,
        lgaName: school.lga?.name || (officer.lga?.name ?? 'Unknown'),
        totalStudents: school._count?.students || 0,
        itOfficer,
        activeTermStats: {
          termId: activeTerm.id,
          termName: activeTerm.name,
          awaitingApprovalCount: awaiting,
          approvedCount: approved,
          rejectedCount: rejected,
          totalAssessedCount: totalAssessed,
          status: overallStatus,
          lastSubmissionDate: schoolAssessments?.lastSubmission || null,
        }
      };
    });

    return {
      officer: {
        id: officer.id,
        firstName: officer.firstName,
        lastName: officer.lastName,
        email: officer.email,
        state: officer.stateRef?.stateName || 'Abia State',
        currentLga: officer.lga?.name || (lgas[0]?.name ?? 'Unassigned'),
        lgas: lgas.map(l => ({ id: l.id, name: l.name, code: l.code })),
      },
      activeSession: activeTerm.session,
      activeTerm,
      analytics: {
        totalSchools,
        totalStudents,
        totalSchoolIt,
        schoolsWithItCount,
        schoolsWithoutItCount,
        awaitingApproval: awaitingApprovalCount,
        approved: approvedCount
      },
      schoolItRelations,
    };
  }

  async getSchoolsWithResults(userId: string, statusFilter?: string) {
    const officer = await this.getOfficer(userId);
    const activeTerm = await this.getActiveTerm(officer);
    const lgaId = officer.lgaId as string;

    const schools = await this.prisma.school.findMany({
      where: { lgaId: lgaId, isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
      }
    });

    // We will augment each school with how many distinct students have assessments awaiting approval or approved
    const schoolsWithStats = await Promise.all(schools.map(async (school) => {
      const awaitingStudents = await this.prisma.assessment.findMany({
        where: { class: { schoolId: school.id }, termId: activeTerm.id, status: ApprovalStatus.AWAITING_APPROVAL },
        distinct: ['studentId'],
        select: { studentId: true }
      });
      const awaiting = awaitingStudents.length;

      const approvedStudents = await this.prisma.assessment.findMany({
        where: { class: { schoolId: school.id }, termId: activeTerm.id, status: ApprovalStatus.APPROVED },
        distinct: ['studentId'],
        select: { studentId: true }
      });
      const approved = approvedStudents.length;
      
      const totalStudents = await this.prisma.student.count({
        where: { schoolId: school.id, isActive: true }
      });

      let overallStatus = 'NO_RESULTS';
      if (awaiting > 0) overallStatus = 'AWAITING_APPROVAL';
      else if (approved > 0) overallStatus = 'APPROVED';

      return {
        ...school,
        stats: {
          awaitingApproval: awaiting,
          approved: approved,
          total: awaiting + approved,
          totalEnrolled: totalStudents
        },
        overallStatus
      };
    }));

    if (statusFilter && statusFilter !== 'ALL') {
      return schoolsWithStats.filter(s => s.overallStatus === statusFilter);
    }

    return schoolsWithStats;
  }

  async getSchoolResultsDetails(userId: string, schoolId: string) {
    const officer = await this.getOfficer(userId);
    const activeTerm = await this.getActiveTerm(officer);
    const lgaId = officer.lgaId as string;

    const school = await this.prisma.school.findFirst({
      where: { id: schoolId, lgaId: lgaId },
    });
    if (!school) throw new ForbiddenException('School not found or not in your LGA');

    // Get all students in this school who have assessments in the active term
    const assessments = await this.prisma.assessment.findMany({
      where: { class: { schoolId: school.id }, termId: activeTerm.id },
      include: {
        student: true,
        class: true,
      }
    });

    // Group by student
    const studentMap = new Map();
    for (const assessment of assessments) {
      if (!studentMap.has(assessment.studentId)) {
        studentMap.set(assessment.studentId, {
          student: assessment.student,
          class: assessment.class,
          assessments: [],
        });
      }
      studentMap.get(assessment.studentId).assessments.push(assessment);
    }

    const result = Array.from(studentMap.values()).map(data => {
      const awaitingCount = data.assessments.filter((a: any) => a.status === ApprovalStatus.AWAITING_APPROVAL).length;
      const approvedCount = data.assessments.filter((a: any) => a.status === ApprovalStatus.APPROVED).length;
      
      let overallStatus = 'NO_RESULTS';
      if (awaitingCount > 0) overallStatus = 'AWAITING_APPROVAL';
      else if (approvedCount > 0) overallStatus = 'APPROVED';

      return {
        student: data.student,
        class: data.class,
        status: overallStatus,
        assessmentCount: data.assessments.length
      };
    });

    return {
      school,
      term: activeTerm,
      students: result
    };
  }

  async approveSchoolResults(userId: string, schoolId: string) {
    const officer = await this.getOfficer(userId);
    const activeTerm = await this.getActiveTerm(officer);
    const lgaId = officer.lgaId as string;

    // Verify school is in officer's LGA
    const school = await this.prisma.school.findFirst({
      where: { id: schoolId, lgaId: lgaId }
    });
    if (!school) throw new ForbiddenException('School not found or not in your LGA');

    const studentsWithAssessments = await this.prisma.assessment.findMany({
      where: {
        class: { schoolId: school.id },
        termId: activeTerm.id,
        status: ApprovalStatus.AWAITING_APPROVAL
      },
      distinct: ['studentId'],
      select: { studentId: true }
    });
    const studentCount = studentsWithAssessments.length;

    const result = await this.prisma.assessment.updateMany({
      where: {
        class: { schoolId: school.id },
        termId: activeTerm.id,
        status: ApprovalStatus.AWAITING_APPROVAL
      },
      data: {
        status: ApprovalStatus.APPROVED
      }
    });

    await this.auditLogService.createLog(userId, 'RESULT_APPROVAL', {
      schoolId: school.id,
      schoolName: school.name,
      termId: activeTerm.id,
      action: 'APPROVED',
      count: studentCount
    }, 'Results', school.id);

    return { message: `Successfully approved results for ${studentCount} students in ${school.name}` };
  }

  async rejectSchoolResults(userId: string, schoolId: string) {
    const officer = await this.getOfficer(userId);
    const activeTerm = await this.getActiveTerm(officer);
    const lgaId = officer.lgaId as string;

    // Verify school is in officer's LGA
    const school = await this.prisma.school.findFirst({
      where: { id: schoolId, lgaId: lgaId }
    });
    if (!school) throw new ForbiddenException('School not found or not in your LGA');

    const studentsWithAssessments = await this.prisma.assessment.findMany({
      where: {
        class: { schoolId: school.id },
        termId: activeTerm.id,
        status: ApprovalStatus.AWAITING_APPROVAL
      },
      distinct: ['studentId'],
      select: { studentId: true }
    });
    const studentCount = studentsWithAssessments.length;

    const result = await this.prisma.assessment.updateMany({
      where: {
        class: { schoolId: school.id },
        termId: activeTerm.id,
        status: ApprovalStatus.AWAITING_APPROVAL
      },
      data: {
        status: ApprovalStatus.REJECTED
      }
    });

    await this.auditLogService.createLog(userId, 'RESULT_REJECTION', {
      schoolId: school.id,
      schoolName: school.name,
      termId: activeTerm.id,
      action: 'REJECTED',
      count: studentCount
    }, 'Results', school.id);

    return { message: `Successfully rejected results for ${studentCount} students in ${school.name}` };
  }

  async getProfile(userId: string) {
    return this.getOfficer(userId);
  }

  async updateProfile(userId: string, data: any) {
    const officer = await this.getOfficer(userId);
    
    // Allow updating firstName, lastName, phone, address
    const updateData: any = {};
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.phone) updateData.phone = data.phone;
    if (data.address) updateData.address = data.address;

    const updated = await this.prisma.subebOfficer.update({
      where: { id: officer.id },
      data: updateData
    });

    // Update user profile picture and name if provided
    const userUpdateData: any = {};
    if (data.profilePicture !== undefined) userUpdateData.profilePicture = data.profilePicture;
    if (data.firstName) userUpdateData.firstName = data.firstName;
    if (data.lastName) userUpdateData.lastName = data.lastName;

    if (Object.keys(userUpdateData).length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: userUpdateData
      });
    }

    await this.auditLogService.createLog(userId, 'UPDATED_PROFILE', {
      ...updateData,
      ...userUpdateData,
    }, 'User Profile', userId);

    return updated;
  }

  async getAuditLogs(userId: string, page: number = 1, limit: number = 20) {
    return this.auditLogService.getLogs(page, limit, 'SUBEB_OFFICER', userId);
  }
}
