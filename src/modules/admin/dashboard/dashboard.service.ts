import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ResponseHelper } from '../../../common/helpers/response.helper';
import { TermType, Prisma } from '@prisma/client';
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
      includeStats = true,
      includePerformance = true,
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
          where: { 
            OR: [{ id: session }, { name: session }],
            isActive: true 
          },
        });
        if (!sessionData) {
          throw new Error(`Session '${session}' not found or not active`);
        }
      } else {
        sessionData = await this.prisma.session.findFirst({
          where: { isCurrent: true, isActive: true },
          orderBy: [
            { status: 'asc' }, // 'OPEN' comes before 'CLOSED' alphabetically
            { updatedAt: 'desc' },
          ],
        });
        if (!sessionData) {
          sessionData = await this.prisma.session.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
          });
        }
        if (!sessionData) {
          throw new Error('No active session found');
        }
      }

      // Get current term if no term specified
      let termData;
      if (term) {
        const isTermType = Object.values(TermType).includes(term as TermType);
        termData = await this.prisma.term.findFirst({
          where: { 
            OR: [
              { id: term },
              ...(isTermType ? [{ name: term as TermType }] : []),
            ],
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
          orderBy: [
            { status: 'asc' },
            { updatedAt: 'desc' },
          ],
        });
        if (!termData) {
          termData = await this.prisma.term.findFirst({
            where: {
              sessionId: sessionData.id,
              isActive: true,
            },
            orderBy: { createdAt: 'desc' },
          });
        }
        if (!termData) {
          throw new Error(`No active term found for session '${sessionData.name}'`);
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

      // Get schools for dropdown filtering (lightweight)
      const schools = await this.prisma.school.findMany({
        where: schoolWhereConditions,
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      // Get LGAs for dropdown filtering (lightweight)
      const lgas = await this.prisma.localGovernmentArea.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      // Performance section: Top Ranked Students with backend-driven pagination (capped at top 100)
      const maxTopRanked = 100;
      const topPage = Math.max(1, Number(page) || 1);
      const topLimit = Math.max(1, Math.min(100, Number(limit) || 10));
      const topSkip = (topPage - 1) * topLimit;

      let topStudentsWithPositions: Array<{
        position: number;
        id: string;
        studentName: string;
        examNumber: string;
        lga: string;
        school: string;
        class: string;
        gender: any;
        totalScore: number;
      }> = [];

      let topPagination = {
        page: topPage,
        limit: topLimit,
        total: 0,
        totalPages: 1,
      };

      if (includePerformance && sessionData && termData) {
        try {
          // Count total qualifying students with assessments in this session & term
          const countResult: any[] = await this.prisma.$queryRaw`
            SELECT COUNT(DISTINCT s.id)::int AS "count"
            FROM students s
            JOIN schools sch ON s."schoolId" = sch.id
            JOIN assessments a ON a."studentId" = s.id
            JOIN terms t ON a."termId" = t.id AND t.id = ${termData.id}
            JOIN sessions sess ON t."sessionId" = sess.id AND sess.id = ${sessionData.id}
            WHERE s."isActive" = true
            ${schoolId ? Prisma.sql`AND s."schoolId" = ${schoolId}` : Prisma.empty}
            ${classId ? Prisma.sql`AND s."classId" = ${classId}` : Prisma.empty}
            ${gender ? Prisma.sql`AND s.gender = ${gender}::"Gender"` : Prisma.empty}
            ${lgaId ? Prisma.sql`AND sch."lgaId" = ${lgaId}` : Prisma.empty}
            ${search ? Prisma.sql`AND (s."firstName" ILIKE ${`%${search}%`} OR s."lastName" ILIKE ${`%${search}%`} OR s."studentId" ILIKE ${`%${search}%`})` : Prisma.empty};
          `;

          const rawTotal = countResult[0]?.count || 0;
          const totalRanked = Math.min(maxTopRanked, rawTotal);
          topPagination = {
            page: topPage,
            limit: topLimit,
            total: totalRanked,
            totalPages: Math.max(1, Math.ceil(totalRanked / topLimit)),
          };

          // Fetch only the requested page of top scorers (e.g. 10 students)
          const topScorers: any[] = await this.prisma.$queryRaw`
            SELECT 
              s.id,
              s."firstName",
              s."lastName",
              s."studentId" AS "examNumber",
              s.gender,
              COALESCE(lga.name, 'N/A') AS "lga",
              sch.name AS "school",
              c.name AS "class",
              COALESCE(SUM(a.score), 0)::int AS "totalScore"
            FROM students s
            JOIN schools sch ON s."schoolId" = sch.id
            LEFT JOIN local_government_areas lga ON sch."lgaId" = lga.id
            LEFT JOIN classes c ON s."classId" = c.id
            JOIN assessments a ON a."studentId" = s.id
            JOIN terms t ON a."termId" = t.id AND t.id = ${termData.id}
            JOIN sessions sess ON t."sessionId" = sess.id AND sess.id = ${sessionData.id}
            WHERE s."isActive" = true
            ${schoolId ? Prisma.sql`AND s."schoolId" = ${schoolId}` : Prisma.empty}
            ${classId ? Prisma.sql`AND s."classId" = ${classId}` : Prisma.empty}
            ${gender ? Prisma.sql`AND s.gender = ${gender}::"Gender"` : Prisma.empty}
            ${lgaId ? Prisma.sql`AND sch."lgaId" = ${lgaId}` : Prisma.empty}
            ${search ? Prisma.sql`AND (s."firstName" ILIKE ${`%${search}%`} OR s."lastName" ILIKE ${`%${search}%`} OR s."studentId" ILIKE ${`%${search}%`})` : Prisma.empty}
            GROUP BY s.id, s."firstName", s."lastName", s."studentId", s.gender, lga.name, sch.name, c.name
            ORDER BY "totalScore" DESC
            OFFSET ${topSkip}
            LIMIT ${topLimit};
          `;

          topStudentsWithPositions = topScorers.map((student, index) => ({
            position: topSkip + index + 1,
            id: student.id,
            studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
            examNumber: student.examNumber || 'N/A',
            lga: student.lga || 'N/A',
            school: student.school || 'N/A',
            class: student.class || 'N/A',
            gender: student.gender || 'N/A',
            totalScore: student.totalScore || 0,
          }));
        } catch (err) {
          this.logger.error(`Error calculating top scorers: ${err.message}`, err.stack);
          topStudentsWithPositions = [];
        }
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
        pagination: topPagination,
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
          schools: schools.map((s) => ({ id: s.id, name: s.name })),
          lgas: lgas.map((l) => ({ id: l.id, name: l.name })),
        },
        lastUpdated: new Date().toISOString(),
      };

      // Add detailed statistics if requested
      if (includeStats) {
        responseData.statistics = {
          genderDistribution,
        };
      }

      // Add performance data if requested
      if (includePerformance) {
        responseData.performance = {
          topStudents: topStudentsWithPositions,
          pagination: topPagination,
        };
      }

      return ResponseHelper.success('Admin Dashboard Data retrieved successfully', responseData);
    } catch (error) {
      this.logger.error(`Error fetching admin dashboard: ${error.message}`, error.stack);
      throw error;
    }
  }

  async fetchDashboardPerformanceTable(
    session?: string,
    term?: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    schoolId?: string,
    classId?: string,
    gender?: string,
    lgaId?: string,
  ) {
    this.logger.log(`Fetching performance table for session: ${session || 'current'}, term: ${term || 'current'}`);

    try {
      // Get session
      let sessionData;
      if (session) {
        sessionData = await this.prisma.session.findFirst({
          where: {
            OR: [{ id: session }, { name: session }],
            isActive: true,
          },
        });
      } else {
        sessionData = await this.prisma.session.findFirst({
          where: { isCurrent: true, isActive: true },
          orderBy: [
            { status: 'asc' },
            { updatedAt: 'desc' },
          ],
        });
        if (!sessionData) {
          sessionData = await this.prisma.session.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
          });
        }
      }

      if (!sessionData) {
        return ResponseHelper.success('No active session found', {
          topStudents: [],
          pagination: { page, limit, total: 0, totalPages: 1 },
        });
      }

      // Get term
      let termData;
      if (term) {
        const isTermType = Object.values(TermType).includes(term as TermType);
        termData = await this.prisma.term.findFirst({
          where: {
            OR: [
              { id: term },
              ...(isTermType ? [{ name: term as TermType }] : []),
            ],
            sessionId: sessionData.id,
            isActive: true,
          },
        });
      } else {
        termData = await this.prisma.term.findFirst({
          where: {
            sessionId: sessionData.id,
            isCurrent: true,
            isActive: true,
          },
          orderBy: [
            { status: 'asc' },
            { updatedAt: 'desc' },
          ],
        });
        if (!termData) {
          termData = await this.prisma.term.findFirst({
            where: {
              sessionId: sessionData.id,
              isActive: true,
            },
            orderBy: { createdAt: 'desc' },
          });
        }
      }

      if (!termData) {
        return ResponseHelper.success('No active term found', {
          topStudents: [],
          pagination: { page, limit, total: 0, totalPages: 1 },
        });
      }

      const maxTopRanked = 100;
      const topPage = Math.max(1, Number(page) || 1);
      const topLimit = Math.max(1, Math.min(100, Number(limit) || 10));
      const topSkip = (topPage - 1) * topLimit;

      const countResult: any[] = await this.prisma.$queryRaw`
        SELECT COUNT(DISTINCT s.id)::int AS "count"
        FROM students s
        JOIN schools sch ON s."schoolId" = sch.id
        JOIN assessments a ON a."studentId" = s.id
        JOIN terms t ON a."termId" = t.id AND t.id = ${termData.id}
        JOIN sessions sess ON t."sessionId" = sess.id AND sess.id = ${sessionData.id}
        WHERE s."isActive" = true
        ${schoolId ? Prisma.sql`AND s."schoolId" = ${schoolId}` : Prisma.empty}
        ${classId ? Prisma.sql`AND s."classId" = ${classId}` : Prisma.empty}
        ${gender ? Prisma.sql`AND s.gender = ${gender}::"Gender"` : Prisma.empty}
        ${lgaId ? Prisma.sql`AND sch."lgaId" = ${lgaId}` : Prisma.empty}
        ${search ? Prisma.sql`AND (s."firstName" ILIKE ${`%${search}%`} OR s."lastName" ILIKE ${`%${search}%`} OR s."studentId" ILIKE ${`%${search}%`})` : Prisma.empty};
      `;

      const rawTotal = countResult[0]?.count || 0;
      const totalRanked = Math.min(maxTopRanked, rawTotal);
      const totalPages = Math.max(1, Math.ceil(totalRanked / topLimit));

      const topScorers: any[] = await this.prisma.$queryRaw`
        SELECT 
          s.id,
          s."firstName",
          s."lastName",
          s."studentId" AS "examNumber",
          s.gender,
          COALESCE(lga.name, 'N/A') AS "lga",
          sch.name AS "school",
          c.name AS "class",
          COALESCE(SUM(a.score), 0)::int AS "totalScore"
        FROM students s
        JOIN schools sch ON s."schoolId" = sch.id
        LEFT JOIN local_government_areas lga ON sch."lgaId" = lga.id
        LEFT JOIN classes c ON s."classId" = c.id
        JOIN assessments a ON a."studentId" = s.id
        JOIN terms t ON a."termId" = t.id AND t.id = ${termData.id}
        JOIN sessions sess ON t."sessionId" = sess.id AND sess.id = ${sessionData.id}
        WHERE s."isActive" = true
        ${schoolId ? Prisma.sql`AND s."schoolId" = ${schoolId}` : Prisma.empty}
        ${classId ? Prisma.sql`AND s."classId" = ${classId}` : Prisma.empty}
        ${gender ? Prisma.sql`AND s.gender = ${gender}::"Gender"` : Prisma.empty}
        ${lgaId ? Prisma.sql`AND sch."lgaId" = ${lgaId}` : Prisma.empty}
        ${search ? Prisma.sql`AND (s."firstName" ILIKE ${`%${search}%`} OR s."lastName" ILIKE ${`%${search}%`} OR s."studentId" ILIKE ${`%${search}%`})` : Prisma.empty}
        GROUP BY s.id, s."firstName", s."lastName", s."studentId", s.gender, lga.name, sch.name, c.name
        ORDER BY "totalScore" DESC
        OFFSET ${topSkip}
        LIMIT ${topLimit};
      `;

      const topStudentsWithPositions = topScorers.map((student, index) => ({
        position: topSkip + index + 1,
        id: student.id,
        studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        examNumber: student.examNumber || 'N/A',
        lga: student.lga || 'N/A',
        school: student.school || 'N/A',
        class: student.class || 'N/A',
        gender: student.gender || 'N/A',
        totalScore: student.totalScore || 0,
      }));

      return ResponseHelper.success('Performance table retrieved successfully', {
        topStudents: topStudentsWithPositions,
        pagination: {
          page: topPage,
          limit: topLimit,
          total: totalRanked,
          totalPages,
        },
      });
    } catch (error) {
      this.logger.error(`Error fetching performance table: ${error.message}`, error.stack);
      throw error;
    }
  }
} 