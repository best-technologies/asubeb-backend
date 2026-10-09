import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../admin/audit-log/audit-log.service';
import { MailService } from '../../common/mailer/mail.service';
import { DataCacheService } from '../../common/cache/data-cache.service';
import { ApprovalStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { CreateSchoolItDto, UpdateSchoolItDto } from './dto/school-it.dto';

@Injectable()
export class ExamOfficerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly mailService: MailService,
    private readonly dataCacheService: DataCacheService,
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
        student: { isActive: true },
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
        where: { class: { schoolId: school.id }, termId: activeTerm.id, status: ApprovalStatus.AWAITING_APPROVAL, student: { isActive: true } },
        distinct: ['studentId'],
        select: { studentId: true }
      });
      const awaiting = awaitingStudents.length;

      const approvedStudents = await this.prisma.assessment.findMany({
        where: { class: { schoolId: school.id }, termId: activeTerm.id, status: ApprovalStatus.APPROVED, student: { isActive: true } },
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
      where: { class: { schoolId: school.id }, termId: activeTerm.id, student: { isActive: true } },
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
      const rejectedCount = data.assessments.filter((a: any) => a.status === ApprovalStatus.REJECTED).length;
      
      let overallStatus = 'NO_RESULTS';
      if (awaitingCount > 0) overallStatus = 'AWAITING_APPROVAL';
      else if (approvedCount > 0) overallStatus = 'APPROVED';
      else if (rejectedCount > 0) overallStatus = 'REJECTED';

      return {
        student: data.student,
        class: data.class,
        status: overallStatus,
        assessmentCount: data.assessments.length
      };
    });

    // Group classes summary
    const classMap = new Map();
    for (const item of result) {
      const clsId = item.class?.id;
      if (!clsId) continue;
      if (!classMap.has(clsId)) {
        classMap.set(clsId, {
          id: clsId,
          name: item.class.name,
          totalStudents: 0,
          awaitingCount: 0,
          approvedCount: 0,
          rejectedCount: 0,
        });
      }
      const clsData = classMap.get(clsId);
      clsData.totalStudents++;
      if (item.status === 'AWAITING_APPROVAL') clsData.awaitingCount++;
      else if (item.status === 'APPROVED') clsData.approvedCount++;
      else if (item.status === 'REJECTED') clsData.rejectedCount++;
    }

    const classesSummary = Array.from(classMap.values()).sort((a: any, b: any) =>
      a.name.localeCompare(b.name)
    );

    return {
      school,
      term: activeTerm,
      students: result,
      classes: classesSummary,
    };
  }

  async approveSchoolResults(
    userId: string,
    schoolId: string,
    payload?: { studentIds?: string[]; classIds?: string[] } | string[],
  ) {
    const officer = await this.getOfficer(userId);
    const activeTerm = await this.getActiveTerm(officer);
    const lgaId = officer.lgaId as string;

    // Verify school is in officer's LGA
    const school = await this.prisma.school.findFirst({
      where: { id: schoolId, lgaId: lgaId }
    });
    if (!school) throw new ForbiddenException('School not found or not in your LGA');

    const studentIds = Array.isArray(payload) ? payload : payload?.studentIds;
    const classIds = Array.isArray(payload) ? undefined : payload?.classIds;

    const whereClause: any = {
      class: { schoolId: school.id },
      termId: activeTerm.id,
      status: ApprovalStatus.AWAITING_APPROVAL,
      student: { isActive: true },
    };

    if (studentIds && studentIds.length > 0) {
      whereClause.studentId = { in: studentIds };
    }
    if (classIds && classIds.length > 0) {
      whereClause.classId = { in: classIds };
    }

    const studentsWithAssessments = await this.prisma.assessment.findMany({
      where: whereClause,
      distinct: ['studentId'],
      select: { studentId: true }
    });
    const studentCount = studentsWithAssessments.length;

    await this.prisma.assessment.updateMany({
      where: whereClause,
      data: {
        status: ApprovalStatus.APPROVED
      }
    });

    await this.auditLogService.createLog(userId, 'RESULT_APPROVAL', {
      schoolId: school.id,
      schoolName: school.name,
      termId: activeTerm.id,
      action: 'APPROVED',
      count: studentCount,
      studentIds: studentIds && studentIds.length > 0 ? studentIds : undefined,
      classIds: classIds && classIds.length > 0 ? classIds : undefined,
    }, 'Results', school.id);

    this.dataCacheService.invalidatePrefix('students-dashboard:');
    this.dataCacheService.invalidatePrefix('students-analytics:');
    this.dataCacheService.invalidatePrefix('admin-dashboard:');

    return { message: `Successfully approved results for ${studentCount} students in ${school.name}` };
  }

  async rejectSchoolResults(
    userId: string,
    schoolId: string,
    payload?: { studentIds?: string[]; classIds?: string[] } | string[],
  ) {
    const officer = await this.getOfficer(userId);
    const activeTerm = await this.getActiveTerm(officer);
    const lgaId = officer.lgaId as string;

    // Verify school is in officer's LGA
    const school = await this.prisma.school.findFirst({
      where: { id: schoolId, lgaId: lgaId }
    });
    if (!school) throw new ForbiddenException('School not found or not in your LGA');

    const studentIds = Array.isArray(payload) ? payload : payload?.studentIds;
    const classIds = Array.isArray(payload) ? undefined : payload?.classIds;

    const whereClause: any = {
      class: { schoolId: school.id },
      termId: activeTerm.id,
      status: ApprovalStatus.AWAITING_APPROVAL,
      student: { isActive: true },
    };

    if (studentIds && studentIds.length > 0) {
      whereClause.studentId = { in: studentIds };
    }
    if (classIds && classIds.length > 0) {
      whereClause.classId = { in: classIds };
    }

    const studentsWithAssessments = await this.prisma.assessment.findMany({
      where: whereClause,
      distinct: ['studentId'],
      select: { studentId: true }
    });
    const studentCount = studentsWithAssessments.length;

    await this.prisma.assessment.updateMany({
      where: whereClause,
      data: {
        status: ApprovalStatus.REJECTED
      }
    });

    await this.auditLogService.createLog(userId, 'RESULT_REJECTION', {
      schoolId: school.id,
      schoolName: school.name,
      termId: activeTerm.id,
      action: 'REJECTED',
      count: studentCount,
      studentIds: studentIds && studentIds.length > 0 ? studentIds : undefined,
      classIds: classIds && classIds.length > 0 ? classIds : undefined,
    }, 'Results', school.id);

    this.dataCacheService.invalidatePrefix('students-dashboard:');
    this.dataCacheService.invalidatePrefix('students-analytics:');
    this.dataCacheService.invalidatePrefix('admin-dashboard:');

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

  /**
   * Get current assigned LGA(s) and any past activity LGAs where the officer created School IT personnel or operated.
   */
  async getOfficerLgas(userId: string) {
    const officer = await this.getOfficer(userId);
    const rawLgaId = officer.lgaId as string;
    const currentLgaIds = rawLgaId.includes(',')
      ? rawLgaId.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [rawLgaId];

    // 1. Current LGAs
    const currentLgas = await this.prisma.localGovernmentArea.findMany({
      where: { id: { in: currentLgaIds } },
      select: { id: true, name: true, code: true }
    });

    // 2. Discover past LGAs where this officer created School IT personnel
    const createdSchoolIts = await this.prisma.schoolIt.findMany({
      where: {
        OR: [
          { officerId: officer.id },
          { createdById: officer.userId }
        ]
      },
      select: {
        id: true,
        createdAt: true,
        school: {
          select: {
            id: true,
            lgaId: true,
            lga: { select: { id: true, name: true, code: true } }
          }
        }
      }
    });

    const pastLgaMap = new Map<string, { id: string; name: string; code: string; itCount: number }>();
    for (const it of createdSchoolIts) {
      const lga = it.school?.lga;
      if (lga && !currentLgaIds.includes(lga.id)) {
        if (!pastLgaMap.has(lga.id)) {
          pastLgaMap.set(lga.id, {
            id: lga.id,
            name: lga.name,
            code: lga.code,
            itCount: 0
          });
        }
        pastLgaMap.get(lga.id)!.itCount += 1;
      }
    }

    // 3. Discover past LGAs from audit logs
    const auditLogs = await this.prisma.auditLog.findMany({
      where: { userId: officer.userId },
      select: { details: true },
      take: 200,
    });

    const auditSchoolIds = new Set<string>();
    for (const log of auditLogs) {
      const details = log.details as any;
      if (details?.schoolId) auditSchoolIds.add(details.schoolId);
    }

    if (auditSchoolIds.size > 0) {
      const schoolsInAudit = await this.prisma.school.findMany({
        where: { id: { in: Array.from(auditSchoolIds) } },
        select: {
          lga: { select: { id: true, name: true, code: true } }
        }
      });
      for (const s of schoolsInAudit) {
        if (s.lga && !currentLgaIds.includes(s.lga.id) && !pastLgaMap.has(s.lga.id)) {
          pastLgaMap.set(s.lga.id, {
            id: s.lga.id,
            name: s.lga.name,
            code: s.lga.code,
            itCount: 0,
          });
        }
      }
    }

    // 4. Fetch all LGAs in state for full flexibility
    const allStateLgas = await this.prisma.localGovernmentArea.findMany({
      where: { stateId: officer.stateId },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' }
    });

    return {
      currentLga: currentLgas[0] || { id: rawLgaId, name: officer.lga?.name || 'Assigned LGA', code: '' },
      currentLgas,
      pastLgas: Array.from(pastLgaMap.values()),
      allStateLgas,
    };
  }

  /**
   * Get all active schools in the Exam Officer's LGA jurisdiction for selection and assignment
   */
  async getSchoolsInLga(userId: string, lgaId?: string) {
    const officer = await this.getOfficer(userId);
    const rawLgaId = lgaId || (officer.lgaId as string);
    const lgaIds = rawLgaId.includes(',')
      ? rawLgaId.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [rawLgaId];

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
          select: { id: true, firstName: true, lastName: true, schoolItId: true, email: true }
        },
        _count: {
          select: { students: { where: { isActive: true } } }
        }
      },
      orderBy: { name: 'asc' }
    });

    return schools.map(s => ({
      id: s.id,
      name: s.name,
      code: s.code,
      level: s.level,
      lgaId: s.lgaId,
      lgaName: s.lga?.name || 'Unknown',
      studentCount: s._count?.students || 0,
      assignedIt: s.schoolIts[0] ? {
        id: s.schoolIts[0].id,
        name: `${s.schoolIts[0].firstName} ${s.schoolIts[0].lastName}`,
        schoolItId: s.schoolIts[0].schoolItId,
        email: s.schoolIts[0].email,
      } : null,
      hasAssignedIt: s.schoolIts.length > 0,
    }));
  }

  /**
   * Get list of School IT personnel associated with the specified or current LGA
   */
  async getSchoolItList(
    userId: string,
    search?: string,
    schoolId?: string,
    status?: string,
    lgaId?: string
  ) {
    const officer = await this.getOfficer(userId);
    const rawLgaId = officer.lgaId as string;
    const effectiveLgaId = lgaId || rawLgaId;
    const lgaIds = effectiveLgaId.includes(',')
      ? effectiveLgaId.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [effectiveLgaId];

    const targetSchools = await this.prisma.school.findMany({
      where: { lgaId: { in: lgaIds } },
      select: { id: true }
    });
    const targetSchoolIds = targetSchools.map(s => s.id);

    const whereClause: any = {
      schoolId: { in: targetSchoolIds }
    };

    if (schoolId && schoolId !== 'ALL') {
      whereClause.schoolId = schoolId;
    }

    if (status && status !== 'ALL') {
      if (status === 'ACTIVE') {
        whereClause.isActive = true;
      } else if (status === 'INACTIVE') {
        whereClause.isActive = false;
      }
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      whereClause.AND = [
        {
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
            { schoolItId: { contains: q, mode: 'insensitive' } },
            { school: { name: { contains: q, mode: 'insensitive' } } },
            { school: { code: { contains: q, mode: 'insensitive' } } },
          ]
        }
      ];
    }

    const schoolIts = await this.prisma.schoolIt.findMany({
      where: whereClause,
      include: {
        school: {
          select: {
            id: true,
            name: true,
            code: true,
            level: true,
            lga: { select: { id: true, name: true, code: true } }
          }
        },
        officer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            officerId: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        user: {
          select: {
            id: true,
            profilePicture: true,
            isActive: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate uploaded results count strictly for each school IT personnel from their own audit logs
    const itUserIds = schoolIts.map(it => it.userId).filter(Boolean);

    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        userId: { in: itUserIds },
        action: { in: ['UPLOADED_RESULTS', 'SUBMITTED_RESULTS'] },
      },
      select: { userId: true, action: true, details: true },
      orderBy: { createdAt: 'desc' },
    });

    const uploadedCountsByUser = new Map<string, number>();
    const submittedCountsByUser = new Map<string, number>();

    for (const log of auditLogs) {
      const details = log.details as any;
      const count = Number(
        details?.totalResults ?? details?.count ?? details?.totalStudents ?? 0
      );
      if (log.action === 'UPLOADED_RESULTS') {
        uploadedCountsByUser.set(log.userId, (uploadedCountsByUser.get(log.userId) || 0) + count);
      } else if (log.action === 'SUBMITTED_RESULTS') {
        submittedCountsByUser.set(log.userId, (submittedCountsByUser.get(log.userId) || 0) + count);
      }
    }

    return schoolIts.map(it => {
      // Attribute only results actually uploaded by this IT personnel (never school-wide or other individuals' uploads)
      const resultsUploadedCount =
        uploadedCountsByUser.get(it.userId) ??
        submittedCountsByUser.get(it.userId) ??
        0;

      return {
        id: it.id,
        schoolItId: it.schoolItId,
        userId: it.userId,
        firstName: it.firstName,
        lastName: it.lastName,
        fullName: `${it.firstName} ${it.lastName}`.trim(),
        email: it.email,
        phone: it.phone,
        isActive: it.isActive,
        profilePicture: it.user?.profilePicture || null,
        createdAt: it.createdAt,
        resultsUploadedCount,
        school: it.school ? {
          id: it.school.id,
          name: it.school.name,
          code: it.school.code,
          level: it.school.level,
          lgaName: it.school.lga?.name || 'Unknown'
        } : null,
        creatorOfficer: it.officer ? {
          id: it.officer.id,
          name: `${it.officer.firstName} ${it.officer.lastName}`.trim(),
          officerId: it.officer.officerId,
        } : it.createdByUser ? {
          id: it.createdByUser.id,
          name: `${it.createdByUser.firstName || ''} ${it.createdByUser.lastName || ''}`.trim() || it.createdByUser.email,
          officerId: 'N/A'
        } : null,
        isCreatedByCurrentOfficer: (it.officerId === officer.id || it.createdById === officer.userId),
      };
    });
  }

  /**
   * Create a new School IT personnel for any school in the officer's LGA jurisdiction,
   * permanently attaching the creating Exam Officer so ownership is never lost upon reassignment.
   */
  async createSchoolItPerson(userId: string, dto: CreateSchoolItDto) {
    const officer = await this.getOfficer(userId);
    const rawLgaId = officer.lgaId as string;
    const lgaIds = rawLgaId.includes(',')
      ? rawLgaId.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [rawLgaId];

    // 1. Check if user with this email already exists
    const normalizedEmail = dto.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    if (existingUser) {
      throw new BadRequestException('A user with this email already exists.');
    }

    // 2. Validate that school belongs to one of officer's assigned LGA(s)
    const targetSchool = await this.prisma.school.findFirst({
      where: {
        id: dto.schoolId,
        lgaId: { in: lgaIds },
        isActive: true
      },
      include: { lga: true }
    });
    if (!targetSchool) {
      throw new BadRequestException('Selected school not found or does not belong to your assigned LGA jurisdiction.');
    }

    // 3. Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 4. Generate unique SchoolIt ID
    let schoolItId = '';
    let isUnique = false;
    while (!isUnique) {
      const randomDigits = Math.floor(Math.random() * 90000) + 10000;
      const candidateId = `SIT${randomDigits}`;
      const exists = await this.prisma.schoolIt.findUnique({ where: { schoolItId: candidateId } });
      if (!exists) {
        schoolItId = candidateId;
        isUnique = true;
      }
    }

    // 5. Create user and SchoolIt inside transaction, attaching officerId and createdById
    const stateId = officer.stateId;
    const result = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          username: normalizedEmail,
          password: hashedPassword,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          role: 'SCHOOL_IT' as any,
          stateId,
          profilePicture: dto.profilePicture || null,
        }
      });

      const newSchoolIt = await tx.schoolIt.create({
        data: {
          userId: newUser.id,
          schoolItId,
          schoolId: targetSchool.id,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          email: normalizedEmail,
          phone: dto.phone.trim(),
          stateId,
          officerId: officer.id,
          createdById: officer.userId,
        },
        include: {
          school: {
            select: { id: true, name: true, code: true, level: true, lga: true }
          }
        }
      });

      // 6. Record Audit Log for the creation action
      await tx.auditLog.create({
        data: {
          action: 'CREATE_SCHOOL_IT',
          entity: 'SchoolIt',
          entityId: newSchoolIt.id,
          userId: officer.userId,
          details: {
            officerId: officer.id,
            officerName: `${officer.firstName} ${officer.lastName}`,
            schoolItId: newSchoolIt.schoolItId,
            personnelName: `${newSchoolIt.firstName} ${newSchoolIt.lastName}`,
            email: newSchoolIt.email,
            schoolId: targetSchool.id,
            schoolName: targetSchool.name,
            lgaName: targetSchool.lga?.name,
          }
        }
      });

      return newSchoolIt;
    });

    // 7. Send welcome email with login credentials and school assignment details
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      await this.mailService.sendSchoolItWelcomeEmail(normalizedEmail, {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: normalizedEmail,
        password: tempPassword,
        schoolItId: result.schoolItId,
        schoolName: targetSchool.name,
        schoolCode: targetSchool.code,
        schoolLevel: targetSchool.level,
        lgaName: targetSchool.lga?.name,
        officerName: `${officer.firstName} ${officer.lastName}`.trim(),
        loginUrl: `${frontendUrl.replace(/\/$/, '')}/login`,
      });
    } catch (mailError: any) {
      console.warn(`[ExamOfficerService] Welcome email failed for ${normalizedEmail}:`, mailError?.message || mailError);
    }

    return {
      id: result.id,
      schoolItId: result.schoolItId,
      firstName: result.firstName,
      lastName: result.lastName,
      fullName: `${result.firstName} ${result.lastName}`.trim(),
      email: result.email,
      phone: result.phone,
      school: result.school,
      officerId: officer.id,
      createdById: officer.userId,
      createdAt: result.createdAt,
      tempPassword,
    };
  }

  /**
   * Update an existing School IT personnel
   */
  async updateSchoolItPerson(userId: string, id: string, dto: UpdateSchoolItDto) {
    const officer = await this.getOfficer(userId);
    const rawLgaId = officer.lgaId as string;
    const lgaIds = rawLgaId.includes(',')
      ? rawLgaId.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [rawLgaId];

    const schoolIt = await this.prisma.schoolIt.findUnique({
      where: { id },
      include: { school: true }
    });

    if (!schoolIt) {
      throw new NotFoundException('School IT personnel not found.');
    }

    // Verify permission: school is in officer's LGA or was created by this officer
    const isLgaSchool = schoolIt.school && lgaIds.includes(schoolIt.school.lgaId);
    const isCreator = (schoolIt.officerId === officer.id || schoolIt.createdById === officer.userId);

    if (!isLgaSchool && !isCreator) {
      throw new ForbiddenException('You do not have permission to manage this School IT personnel.');
    }

    // If reassigning school, ensure new school is in officer's LGA
    if (dto.schoolId && dto.schoolId !== schoolIt.schoolId) {
      const newSchool = await this.prisma.school.findFirst({
        where: { id: dto.schoolId, lgaId: { in: lgaIds } }
      });
      if (!newSchool) {
        throw new BadRequestException('Selected school is not within your assigned LGA jurisdiction.');
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedSchoolIt = await tx.schoolIt.update({
        where: { id },
        data: {
          ...(dto.firstName !== undefined && { firstName: dto.firstName.trim() }),
          ...(dto.lastName !== undefined && { lastName: dto.lastName.trim() }),
          ...(dto.phone !== undefined && { phone: dto.phone.trim() }),
          ...(dto.schoolId !== undefined && { schoolId: dto.schoolId }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
        include: {
          school: {
            select: { id: true, name: true, code: true, level: true, lga: true }
          }
        }
      });

      // Sync with user record
      await tx.user.update({
        where: { id: schoolIt.userId },
        data: {
          ...(dto.firstName !== undefined && { firstName: dto.firstName.trim() }),
          ...(dto.lastName !== undefined && { lastName: dto.lastName.trim() }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        }
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          action: 'UPDATE_SCHOOL_IT',
          entity: 'SchoolIt',
          entityId: schoolIt.id,
          userId: officer.userId,
          details: {
            officerId: officer.id,
            schoolItId: schoolIt.schoolItId,
            changes: dto as any,
          }
        }
      });

      return updatedSchoolIt;
    });

    return updated;
  }

  /**
   * Toggle active/inactive status of School IT personnel
   */
  async toggleSchoolItStatus(userId: string, id: string) {
    const schoolIt = await this.prisma.schoolIt.findUnique({ where: { id } });
    if (!schoolIt) throw new NotFoundException('School IT personnel not found.');
    return this.updateSchoolItPerson(userId, id, { isActive: !schoolIt.isActive });
  }
}
