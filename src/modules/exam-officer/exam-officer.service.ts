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
      include: { stateRef: true, lga: true }
    });
    if (!officer) {
      throw new NotFoundException('Exam Officer profile not found');
    }
    if (!officer.lgaId) {
      throw new ForbiddenException('Exam Officer is not assigned to an LGA');
    }
    return officer;
  }

  private async getActiveTerm() {
    const activeTerm = await this.prisma.term.findFirst({
      where: { isActive: true },
      include: { session: true },
    });
    if (!activeTerm) {
      throw new BadRequestException('No active academic term found');
    }
    return activeTerm;
  }

  async getDashboardAnalytics(userId: string) {
    const officer = await this.getOfficer(userId);
    const activeTerm = await this.getActiveTerm();
    const lgaId = officer.lgaId as string;

    const totalSchools = await this.prisma.school.count({
      where: { lgaId: lgaId, isActive: true }
    });

    const totalStudents = await this.prisma.student.count({
      where: { school: { lgaId: lgaId }, isActive: true }
    });

    const schoolIds = (await this.prisma.school.findMany({ where: { lgaId: lgaId }, select: { id: true } })).map(s => s.id);

    const awaitingApprovalCount = await this.prisma.assessment.count({
      where: {
        class: { schoolId: { in: schoolIds } },
        termId: activeTerm.id,
        status: ApprovalStatus.AWAITING_APPROVAL
      }
    });

    const approvedCount = await this.prisma.assessment.count({
      where: {
        class: { schoolId: { in: schoolIds } },
        termId: activeTerm.id,
        status: ApprovalStatus.APPROVED
      }
    });

    return {
      activeSession: activeTerm.session,
      activeTerm,
      analytics: {
        totalSchools,
        totalStudents,
        awaitingApproval: awaitingApprovalCount,
        approved: approvedCount
      }
    };
  }

  async getSchoolsWithResults(userId: string, statusFilter?: string) {
    const officer = await this.getOfficer(userId);
    const activeTerm = await this.getActiveTerm();
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
    const activeTerm = await this.getActiveTerm();
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
    const activeTerm = await this.getActiveTerm();
    const lgaId = officer.lgaId as string;

    // Verify school is in officer's LGA
    const school = await this.prisma.school.findFirst({
      where: { id: schoolId, lgaId: lgaId }
    });
    if (!school) throw new ForbiddenException('School not found or not in your LGA');

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
      count: result.count
    });

    return { message: `Successfully approved ${result.count} results for ${school.name}` };
  }

  async rejectSchoolResults(userId: string, schoolId: string) {
    const officer = await this.getOfficer(userId);
    const activeTerm = await this.getActiveTerm();
    const lgaId = officer.lgaId as string;

    // Verify school is in officer's LGA
    const school = await this.prisma.school.findFirst({
      where: { id: schoolId, lgaId: lgaId }
    });
    if (!school) throw new ForbiddenException('School not found or not in your LGA');

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
      count: result.count
    });

    return { message: `Successfully rejected ${result.count} results for ${school.name}` };
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

    // Update user profile picture if provided
    if (data.profilePicture) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { profilePicture: data.profilePicture }
      });
    }

    return updated;
  }

  async getAuditLogs(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { userId, action: { in: ['RESULT_APPROVAL', 'RESULT_REJECTION'] } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({
        where: { userId, action: { in: ['RESULT_APPROVAL', 'RESULT_REJECTION'] } }
      }),
    ]);

    return {
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
