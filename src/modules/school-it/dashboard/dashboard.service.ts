import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SchoolItDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardAnalytics(userId: string) {
    // Get School-IT user and their assigned school
    const schoolIt = await this.prisma.schoolIt.findUnique({
      where: { userId },
      include: { school: true },
    });

    if (!schoolIt) {
      throw new NotFoundException('School-IT profile not found for this user');
    }

    const schoolId = schoolIt.schoolId;

    // Run aggregate queries concurrently
    const [
      totalStudents,
      maleStudents,
      femaleStudents,
      totalTeachers,
      totalClasses,
      recentStudents,
      classes,
      activeSession,
      activeTerm,
    ] = await Promise.all([
      this.prisma.student.count({ where: { schoolId } }),
      this.prisma.student.count({ where: { schoolId, gender: 'MALE' } }),
      this.prisma.student.count({ where: { schoolId, gender: 'FEMALE' } }),
      this.prisma.teacher.count({ where: { schoolId } }),
      this.prisma.class.count({ where: { schoolId } }),
      this.prisma.student.findMany({
        where: { schoolId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          gender: true,
          createdAt: true,
        },
      }),
      this.prisma.class.findMany({
        where: { schoolId },
        select: { id: true, name: true, grade: true },
        orderBy: { grade: 'asc' }
      }),
      this.prisma.session.findFirst({
        where: { isCurrent: true, stateId: schoolIt.stateId },
        select: { id: true, name: true }
      }),
      this.prisma.term.findFirst({
        where: { isCurrent: true, stateId: schoolIt.stateId },
        select: { id: true, name: true }
      })
    ]);

    return {
      school: {
        id: schoolIt.school.id,
        name: schoolIt.school.name,
        code: schoolIt.school.code,
        lgaId: schoolIt.school.lgaId,
      },
      activeSession,
      activeTerm,
      analytics: {
        totalStudents,
        maleStudents,
        femaleStudents,
        totalTeachers,
        totalClasses,
      },
      classes,
      recentStudents,
    };
  }
}
