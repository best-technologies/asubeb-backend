import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ResponseHelper } from '../../../common/helpers/response.helper';
import { TermType } from '@prisma/client';
import { DashboardQueryDto } from './dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getOrderByClause(sortBy: string, sortOrder: 'asc' | 'desc') {
    // Map frontend sort fields to actual database fields
    const fieldMapping: { [key: string]: any } = {
      name: 'firstName', // For students, sort by firstName
      firstName: 'firstName',
      lastName: 'lastName',
      studentId: 'studentId',
      totalStudents: 'totalStudents',
      totalTeachers: 'totalTeachers',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    };

    const actualField = fieldMapping[sortBy] || 'firstName';
    return { [actualField]: sortOrder };
  }

  async getAdminDashboard(query: DashboardQueryDto) {
    const {
      session,
      term,
      page = 1,
      limit = 10,
      search,
      schoolId,
      classId,
      gender,
      schoolLevel,
      lgaId,
      sortBy = 'name',
      sortOrder = 'asc',
      includeStats = false,
      includePerformance = false,
    } = query;

    // Log only the filters that are actually passed from frontend
    const activeFilters = Object.entries(query)
      .filter(([key, value]) => value !== undefined && value !== null && value !== '')
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {} as any);
    
    this.logger.log(`Fetching admin dashboard data with active filters: ${JSON.stringify(activeFilters)}`);

    try {
      const skip = (page - 1) * limit;

      // Get all available sessions
      const availableSessions = await this.prisma.session.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          isCurrent: true,
          isActive: true,
        },
        orderBy: {
          name: 'desc',
        },
      });

      // Get current session if no session specified
      let sessionData;
      if (session) {
        sessionData = await this.prisma.session.findFirst({
          where: { name: session, isActive: true },
        });
        if (!sessionData) {
          throw new Error(`Session '${session}' not found or not active`);
        }
      } else {
        sessionData = await this.prisma.session.findFirst({
          where: { isCurrent: true, isActive: true },
        });
        if (!sessionData) {
          throw new Error('No current session found');
        }
      }

      // Get current term if no term specified
      let termData;
      if (term) {
        termData = await this.prisma.term.findFirst({
          where: { 
            name: term, 
            sessionId: sessionData.id,
            isActive: true 
          },
        });
        if (!termData) {
          throw new Error(`Term '${term}' not found for session '${sessionData.name}'`);
        }
      } else {
        termData = await this.prisma.term.findFirst({
          where: { 
            sessionId: sessionData.id,
            isCurrent: true,
            isActive: true 
          },
        });
        if (!termData) {
          throw new Error(`No current term found for session '${sessionData.name}'`);
        }
      }

      // Get available terms for the selected session
      const availableTerms = await this.prisma.term.findMany({
        where: { 
          sessionId: sessionData.id,
          isActive: true 
        },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          isCurrent: true,
          isActive: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      // Build where conditions for schools
      const schoolWhereConditions: any = { isActive: true };
      if (schoolLevel) {
        schoolWhereConditions.level = schoolLevel;
      }
      if (lgaId) {
        schoolWhereConditions.lgaId = lgaId;
      }
      if (search) {
        schoolWhereConditions.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Build where conditions for students
      const studentWhereConditions: any = { isActive: true };
      if (schoolId) {
        studentWhereConditions.schoolId = schoolId;
      }
      if (classId) {
        studentWhereConditions.classId = classId;
      }
      if (gender) {
        studentWhereConditions.gender = gender;
      }
      if (search) {
        studentWhereConditions.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { studentId: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Build where conditions for classes
      const classWhereConditions: any = { isActive: true };
      if (schoolId) {
        classWhereConditions.schoolId = schoolId;
      }
      if (search) {
        classWhereConditions.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { grade: { contains: search, mode: 'insensitive' } },
          { section: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Get total counts with filters
      const totalStudents = await this.prisma.student.count({
        where: studentWhereConditions,
      });

      const totalLgas = await this.prisma.localGovernmentArea.count({
        where: { isActive: true },
      });

      const totalSchools = await this.prisma.school.count({
        where: schoolWhereConditions,
      });

      const totalClasses = await this.prisma.class.count({
        where: classWhereConditions,
      });

      // Get gender distribution with filters
      const genderDistribution = await this.prisma.student.groupBy({
        by: ['gender'],
        where: studentWhereConditions,
        _count: {
          gender: true,
        },
      });

      const totalMale = genderDistribution.find(g => g.gender === 'MALE')?._count.gender || 0;
      const totalFemale = genderDistribution.find(g => g.gender === 'FEMALE')?._count.gender || 0;

      // Get schools with pagination and filters
      const schools = await this.prisma.school.findMany({
        where: schoolWhereConditions,
        select: {
          id: true,
          name: true,
          code: true,
          level: true,
          address: true,
          lga: {
            select: {
              name: true,
            },
          },
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
        skip,
        take: limit,
        orderBy: {
          name: sortOrder, // Schools have a 'name' field
        },
      });

      const schoolsWithCounts = schools.map(school => ({
        id: school.id,
        name: school.name,
        code: school.code,
        level: school.level,
        address: school.address,
        lga: school.lga?.name || 'N/A',
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
        orderBy: {
          name: 'asc',
        },
      });

      // Get classes with pagination and filters
      const classes = await this.prisma.class.findMany({
        where: classWhereConditions,
        select: {
          id: true,
          name: true,
          grade: true,
          section: true,
          capacity: true,
          school: {
            select: {
              name: true,
              code: true,
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
        skip,
        take: limit,
        orderBy: {
          name: sortOrder, // Classes have a 'name' field
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
          code: cls.school.code,
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
        orderBy: {
          name: 'asc',
        },
      });

      // Get students with pagination and filters
      const students = await this.prisma.student.findMany({
        where: studentWhereConditions,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          studentId: true,
          gender: true,
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
                name: termData.name,
                session: {
                  name: sessionData.name,
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
        orderBy: this.getOrderByClause(sortBy, sortOrder),
      });

      // Process students data and sort by total score
      const studentsWithScores = students.map(student => {
        const totalScore = student.assessments.reduce((sum, assessment) => sum + assessment.score, 0);
        
        const baseData = {
          id: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          examNumber: student.studentId,
          school: student.school?.name || 'N/A',
          schoolCode: student.school?.code || 'N/A',
          class: student.class?.name || 'N/A',
          gender: student.gender,
          totalScore,
        };

        if (includePerformance && student.assessments) {
          const totalMaxScore = student.assessments.reduce((sum, assessment) => sum + assessment.maxScore, 0);
          const average = student.assessments.length > 0 ? totalScore / student.assessments.length : 0;
          const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

          return {
            ...baseData,
            average: Math.round(average * 100) / 100,
            percentage: Math.round(percentage * 100) / 100,
            assessmentCount: student.assessments.length,
          };
        }

        return baseData;
      });

      // Sort students by total score in descending order
      studentsWithScores.sort((a, b) => b.totalScore - a.totalScore);

      // Add position to each student
      const studentsData = studentsWithScores.map((student, index) => ({
        ...student,
        position: skip + index + 1,
      }));

      // Get top students for performance section (if requested)
      let topStudentsWithPositions: Array<{
        position: number;
        id: string;
        studentName: string;
        examNumber: string;
        school: string;
        class: string;
        gender: any;
        totalScore: number;
      }> = [];
      if (includePerformance) {
        const topStudents = await this.prisma.student.findMany({
          where: {
            ...studentWhereConditions,
            assessments: {
              some: {
                term: {
                  name: termData.name,
                  session: {
                    name: sessionData.name,
                  },
                },
              },
            },
          },
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
                  name: termData.name,
                  session: {
                    name: sessionData.name,
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

        studentsWithScores.sort((a, b) => b.totalScore - a.totalScore);
        topStudentsWithPositions = studentsWithScores.map((student, index) => ({
          position: index + 1,
          ...student,
        }));
      }

      // Prepare response data
      const responseData: any = {
        currentSession: {
          id: sessionData.id,
          name: sessionData.name,
          startDate: sessionData.startDate,
          endDate: sessionData.endDate,
          isCurrent: sessionData.isCurrent,
        },
        currentTerm: {
          id: termData.id,
          name: termData.name,
          startDate: termData.startDate,
          endDate: termData.endDate,
          isCurrent: termData.isCurrent,
        },
        availableSessions,
        availableTerms,
        pagination: {
          page,
          limit,
          total: totalStudents,
          totalPages: Math.ceil(totalStudents / limit),
          hasNextPage: page < Math.ceil(totalStudents / limit),
          hasPreviousPage: page > 1,
          nextPage: page < Math.ceil(totalStudents / limit) ? page + 1 : null,
          previousPage: page > 1 ? page - 1 : null,
          startIndex: (page - 1) * limit + 1,
          endIndex: Math.min(page * limit, totalStudents),
        },
        summary: {
          totalStudents,
          totalMale,
          totalFemale,
          totalSchools,
          totalClasses,
          totalLgas,
        },
        filters: {
          search,
          schoolId,
          classId,
          gender,
          schoolLevel,
          lgaId,
        },
        data: {
          schools: schoolsWithCounts,
          lgas,
          classes: classesWithEnrollment,
          students: studentsData,
          subjects,
        },
        lastUpdated: new Date().toISOString(),
      };

      // Add detailed statistics if requested
      if (includeStats) {
        responseData.statistics = {
          genderDistribution,
          schoolLevelDistribution: await this.prisma.school.groupBy({
            by: ['level'],
            where: { isActive: true },
            _count: {
              level: true,
            },
          }),
          classGradeDistribution: await this.prisma.class.groupBy({
            by: ['grade'],
            where: { isActive: true },
            _count: {
              grade: true,
            },
          }),
        };
      }

      // Add performance data if requested
      if (includePerformance) {
        responseData.performance = {
          topStudents: topStudentsWithPositions,
        };
      }

      return ResponseHelper.success('Admin Dashboard Data retrieved successfully', responseData);
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
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        data: performanceTable,
      });
    } catch (error) {
      this.logger.error(`Error fetching performance table: ${error.message}`, error.stack);
      throw error;
    }
  }
} 