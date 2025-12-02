import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AcademicContextService {
  private readonly logger = new Logger(AcademicContextService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getCurrentSessionAndTerm(stateId: string) {
    const [currentSession, currentTerm] = await this.prisma.$transaction([
      this.prisma.session.findFirst({
        where: { stateId, isCurrent: true },
      }),
      this.prisma.term.findFirst({
        where: { stateId, isCurrent: true },
      }),
    ]);

    return { currentSession, currentTerm };
  }

  async getLgasWithSchoolCounts(stateId: string) {
    const lgas = await this.prisma.localGovernmentArea.findMany({
      where: { stateId, isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            schools: true,
          },
        },
      },
    });

    return lgas.map(lga => ({
      id: lga.id,
      name: lga.name,
      code: lga.code,
      state: lga.state,
      totalSchools: lga._count?.schools ?? 0,
    }));
  }

  async getSchoolsWithClassCounts(stateId: string, lgaId: string) {
    const schools = await this.prisma.school.findMany({
      where: {
        stateId,
        lgaId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
        level: true,
        isActive: true,
        _count: {
          select: {
            classes: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return schools.map(school => ({
      id: school.id,
      name: school.name,
      code: school.code,
      level: school.level,
      isActive: school.isActive,
      totalClasses: school._count?.classes ?? 0,
    }));
  }

  async getClassesWithStudentCounts(stateId: string, schoolId: string) {
    const classes = await this.prisma.class.findMany({
      where: {
        schoolId,
        isActive: true,
        school: {
          stateId,
        },
      },
      select: {
        id: true,
        name: true,
        grade: true,
        section: true,
        isActive: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return classes.map(cls => ({
      id: cls.id,
      name: cls.name,
      grade: cls.grade,
      section: cls.section,
      isActive: cls.isActive,
      totalStudents: cls._count?.students ?? 0,
    }));
  }
}


