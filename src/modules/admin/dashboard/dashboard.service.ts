import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ResponseHelper } from '../../../common/helpers/response.helper';
import { TermType } from '@prisma/client';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAdminDashboard(session: string, term: TermType) {
    this.logger.log(`Fetching admin dashboard data for session: ${session}, term: ${term}`);

    try {
      // Get session and term details
      const sessionData = await this.prisma.session.findFirst({
        where: { name: session },
      });

      if (!sessionData) {
        throw new Error('Session not found');
      }

      // Get total students count
      const totalStudents = await this.prisma.student.count({
        where: { isActive: true },
      });

      // Get gender distribution
      const genderDistribution = await this.prisma.student.groupBy({
        by: ['gender'],
        where: { isActive: true },
        _count: {
          gender: true,
        },
      });

      const totalMale = genderDistribution.find(g => g.gender === 'MALE')?._count.gender || 0;
      const totalFemale = genderDistribution.find(g => g.gender === 'FEMALE')?._count.gender || 0;

      // Get schools with student and teacher counts
      const schools = await this.prisma.school.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          code: true,
          level: true,
          _count: {
            select: {
              students: {
                where: { isActive: true },
              },
              teachers: {
                where: { isActive: true },
              },
            },
          },
        },
      });

      const schoolsWithCounts = schools.map(school => ({
        id: school.id,
        name: school.name,
        code: school.code,
        level: school.level,
        totalStudents: school._count.students,
        totalTeachers: school._count.teachers,
      }));

      // Get LGAs
      const lgas = await this.prisma.localGovernmentArea.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          code: true,
          state: true,
        },
      });

      // Get classes with enrollment counts
      const classes = await this.prisma.class.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          grade: true,
          section: true,
          capacity: true,
          school: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              students: {
                where: { isActive: true },
              },
            },
          },
        },
      });

      const classesWithEnrollment = classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        grade: cls.grade,
        section: cls.section,
        capacity: cls.capacity,
        currentEnrollment: cls._count.students,
        school: {
          name: cls.school.name,
        },
      }));

      // Get subjects
      const subjects = await this.prisma.subject.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          code: true,
          level: true,
        },
      });

      // Get top students with their performance
      const topStudents = await this.prisma.student.findMany({
        where: { isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          studentId: true,
          gender: true,
          school: {
            select: {
              name: true,
            },
          },
          class: {
            select: {
              name: true,
            },
          },
          assessments: {
            where: {
              term: {
                name: term,
                session: {
                  name: session,
                },
              },
            },
            select: {
              score: true,
            },
          },
        },
        take: 10,
      });

      // Calculate total scores and sort by performance
      const studentsWithScores = topStudents.map(student => {
        const totalScore = student.assessments.reduce((sum, assessment) => sum + assessment.score, 0);
        return {
          id: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          examNumber: student.studentId,
          school: student.school?.name || 'N/A',
          class: student.class?.name || 'N/A',
          gender: student.gender,
          totalScore,
        };
      });

      // Sort by total score in descending order and add positions
      studentsWithScores.sort((a, b) => b.totalScore - a.totalScore);
      const topStudentsWithPositions = studentsWithScores.map((student, index) => ({
        position: index + 1,
        ...student,
      }));

      return ResponseHelper.success('Admin Dashboard Data retrieved successfully', {
        session: sessionData.name,
        term,
        totalStudents,
        totalMale,
        totalFemale,
        schools: schoolsWithCounts,
        lgas,
        classes: classesWithEnrollment,
        genders: genderDistribution,
        subjects,
        topStudents: topStudentsWithPositions,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error fetching admin dashboard: ${error.message}`, error.stack);
      throw error;
    }
  }

  async fetchDashboardPerformanceTable(
    session: string,
    term: TermType,
    page: number = 1,
    limit: number = 10,
    search?: string,
    schoolId?: string,
    classId?: string,
    gender?: string,
  ) {
    this.logger.log(`Fetching performance table for session: ${session}, term: ${term}`);

    try {
      const skip = (page - 1) * limit;

      // Build where conditions
      const whereConditions: any = {
        isActive: true,
        assessments: {
          some: {
            term: {
              name: term,
              session: {
                name: session,
              },
            },
          },
        },
      };

      if (schoolId) {
        whereConditions.schoolId = schoolId;
      }

      if (classId) {
        whereConditions.classId = classId;
      }

      if (gender) {
        whereConditions.gender = gender;
      }

      if (search) {
        whereConditions.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { studentId: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Get students with their assessment scores
      const students = await this.prisma.student.findMany({
        where: whereConditions,
        include: {
          school: {
            select: {
              name: true,
              code: true,
            },
          },
          class: {
            select: {
              name: true,
            },
          },
          assessments: {
            where: {
              term: {
                name: term,
                session: {
                  name: session,
                },
              },
            },
            select: {
              score: true,
              maxScore: true,
              subject: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          firstName: 'asc',
        },
      });

      // Calculate performance metrics for each student
      const performanceData = students.map(student => {
        const totalScore = student.assessments.reduce((sum, assessment) => sum + assessment.score, 0);
        const totalMaxScore = student.assessments.reduce((sum, assessment) => sum + assessment.maxScore, 0);
        const average = student.assessments.length > 0 ? totalScore / student.assessments.length : 0;
        const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

        return {
          id: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          examNumber: student.studentId,
          school: student.school?.name || 'N/A',
          class: student.class?.name || 'N/A',
          totalScore,
          average: Math.round(average * 100) / 100,
          percentage: Math.round(percentage * 100) / 100,
          assessmentCount: student.assessments.length,
        };
      });

      // Sort by total score in descending order
      performanceData.sort((a, b) => b.totalScore - a.totalScore);

      // Add position
      const performanceTable = performanceData.map((student, index) => ({
        position: skip + index + 1,
        ...student,
      }));

      // Get total count for pagination
      const total = await this.prisma.student.count({ where: whereConditions });

      return ResponseHelper.success('Performance table retrieved successfully', {
        data: performanceTable,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      this.logger.error(`Error fetching performance table: ${error.message}`, error.stack);
      throw error;
    }
  }
} 