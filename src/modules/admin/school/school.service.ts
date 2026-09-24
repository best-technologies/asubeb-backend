import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, TermType } from '@prisma/client';
import {
  CreateSchoolDto,
  UpdateSchoolDto,
  SchoolAnalyticsQueryDto,
  SchoolQueryDto,
  SchoolAnalyticsResponse,
} from './dto';
import { ResponseHelper } from '../../../common/helpers';
import * as colors from 'colors';

const LGA_CODES: Record<string, string> = {
  'Aba North': 'ABA-N',
  'Aba South': 'ABA-S',
  'Arochukwu': 'ARO',
  'Bende': 'BEN',
  'Ikwuano': 'IKW',
  'Isiala Ngwa North': 'ISI-N',
  'Isiala Ngwa South': 'ISI-S',
  'Isuikwuato': 'ISU',
  'Obi Ngwa': 'OBI-N',
  'Ohafia': 'OHA',
  'Osisioma Ngwa': 'OSI',
  'Ugwunagbo': 'UGW',
  'Ukwa East': 'UKW-E',
  'Ukwa West': 'UKW-W',
  'Umuahia North': 'UMU-N',
  'Umuahia South': 'UMU-S',
  'Umunneochi': 'UMN',
};

@Injectable()
export class SchoolService {
  private readonly logger = new Logger(SchoolService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createSchool(createSchoolDto: CreateSchoolDto) {
    this.logger.log(colors.magenta('Creating new school...'));

    const lga = await this.prisma.localGovernmentArea.findUnique({
      where: { id: createSchoolDto.lgaId },
    });

    if (!lga) {
      throw new NotFoundException('Local Government Area not found');
    }

    const existingSchool = await this.prisma.school.findFirst({
      where: {
        name: createSchoolDto.name,
      },
    });

    if (existingSchool) {
      throw new ConflictException('School with this name already exists');
    }

    const abiaState = await this.prisma.state.findFirst({
      where: { stateId: 'ABIA' },
    });
    if (!abiaState) {
      throw new BadRequestException('Abia State not found. Please run the migration first.');
    }

    const code = await this.generateUniqueCode(createSchoolDto.name);

    const school = await this.prisma.school.create({
      data: {
        name: createSchoolDto.name,
        code: code,
        level: createSchoolDto.level,
        address: createSchoolDto.address,
        phone: createSchoolDto.phone,
        email: createSchoolDto.email,
        website: createSchoolDto.website,
        principalName: createSchoolDto.principalName,
        principalPhone: createSchoolDto.principalPhone,
        principalEmail: createSchoolDto.principalEmail,
        establishedYear: createSchoolDto.establishedYear,
        totalStudents: createSchoolDto.totalStudents || 0,
        totalTeachers: createSchoolDto.totalTeachers || 0,
        capacity: createSchoolDto.capacity,
        lgaId: createSchoolDto.lgaId,
        stateId: abiaState.id,
        isActive: true,
      },
      include: {
        lga: true,
      },
    });

    this.logger.log(colors.america('School created successfully'));
    return ResponseHelper.created('School created successfully', school);
  }

  async getSchoolById(id: string) {
    const school = await this.prisma.school.findUnique({
      where: { id },
      include: {
        lga: true,
        _count: {
          select: {
            students: { where: { isActive: true } },
            classes: { where: { isActive: true } },
            teachers: { where: { isActive: true } },
          },
        },
      },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    return ResponseHelper.success('School retrieved successfully', school);
  }

  async updateSchool(id: string, updateSchoolDto: UpdateSchoolDto) {
    this.logger.log(colors.magenta(`Updating school with ID: ${id}`));

    const existingSchool = await this.prisma.school.findUnique({
      where: { id },
    });

    if (!existingSchool) {
      throw new NotFoundException('School not found');
    }

    if (updateSchoolDto.lgaId) {
      const lga = await this.prisma.localGovernmentArea.findUnique({
        where: { id: updateSchoolDto.lgaId },
      });
      if (!lga) {
        throw new NotFoundException('Local Government Area not found');
      }
    }

    if (updateSchoolDto.name && updateSchoolDto.name !== existingSchool.name) {
      const duplicate = await this.prisma.school.findFirst({
        where: {
          name: updateSchoolDto.name,
          id: { not: id },
        },
      });
      if (duplicate) {
        throw new ConflictException('A school with this name already exists');
      }
    }

    const updatedSchool = await this.prisma.school.update({
      where: { id },
      data: {
        ...(updateSchoolDto.name && { name: updateSchoolDto.name }),
        ...(updateSchoolDto.level && { level: updateSchoolDto.level }),
        ...(updateSchoolDto.address !== undefined && { address: updateSchoolDto.address }),
        ...(updateSchoolDto.phone !== undefined && { phone: updateSchoolDto.phone }),
        ...(updateSchoolDto.email !== undefined && { email: updateSchoolDto.email }),
        ...(updateSchoolDto.website !== undefined && { website: updateSchoolDto.website }),
        ...(updateSchoolDto.principalName !== undefined && { principalName: updateSchoolDto.principalName }),
        ...(updateSchoolDto.principalPhone !== undefined && { principalPhone: updateSchoolDto.principalPhone }),
        ...(updateSchoolDto.principalEmail !== undefined && { principalEmail: updateSchoolDto.principalEmail }),
        ...(updateSchoolDto.establishedYear !== undefined && { establishedYear: updateSchoolDto.establishedYear }),
        ...(updateSchoolDto.capacity !== undefined && { capacity: updateSchoolDto.capacity }),
        ...(updateSchoolDto.totalStudents !== undefined && { totalStudents: updateSchoolDto.totalStudents }),
        ...(updateSchoolDto.totalTeachers !== undefined && { totalTeachers: updateSchoolDto.totalTeachers }),
        ...(updateSchoolDto.lgaId && { lgaId: updateSchoolDto.lgaId }),
      },
      include: {
        lga: true,
      },
    });

    return ResponseHelper.success('School updated successfully', updatedSchool);
  }

  async updateSchoolStudentCount(schoolId: string): Promise<void> {
    const studentCount = await this.prisma.student.count({
      where: {
        schoolId,
        isActive: true,
      },
    });

    await this.prisma.school.update({
      where: { id: schoolId },
      data: { totalStudents: studentCount },
    });
  }

  async updateAllSchoolsStudentCounts() {
    const schools = await this.prisma.school.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    const results: Array<{ schoolId: string; schoolName: string }> = [];
    for (const school of schools) {
      await this.updateSchoolStudentCount(school.id);
      results.push({ schoolId: school.id, schoolName: school.name });
    }

    return ResponseHelper.success(
      `Updated student counts for ${results.length} schools`,
      results
    );
  }

  /**
   * Comprehensive School Performance & Demographic Analytics
   */
  async getSchoolAnalytics(query: SchoolAnalyticsQueryDto) {
    const { session, term, lgaId } = query;
    this.logger.log(colors.cyan(`Fetching school analytics: session=${session || 'current'}, term=${term || 'current'}, lgaId=${lgaId || 'all'}`));

    try {
      // 1. Resolve Session
      let sessionData;
      if (session) {
        sessionData = await this.prisma.session.findFirst({
          where: { OR: [{ id: session }, { name: session }], isActive: true },
        });
      }
      if (!sessionData) {
        sessionData = await this.prisma.session.findFirst({
          where: { isCurrent: true, isActive: true },
        }) || await this.prisma.session.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        });
      }

      if (!sessionData) {
        throw new NotFoundException('No active academic session found');
      }

      // 2. Resolve Term
      const isAllTerms = term === 'ALL_TERMS';
      let termData: any = null;
      let sessionTermIds: string[] = [];

      if (!isAllTerms) {
        if (term) {
          const isTermType = Object.values(TermType).includes(term as TermType);
          termData = await this.prisma.term.findFirst({
            where: {
              sessionId: sessionData.id,
              OR: [
                { id: term },
                ...(isTermType ? [{ name: term as TermType }] : []),
              ],
              isActive: true,
            },
          });
          if (!termData) {
            termData = await this.prisma.term.findFirst({
              where: {
                OR: [
                  { id: term },
                  ...(isTermType ? [{ name: term as TermType }] : []),
                ],
                isActive: true,
              },
            });
          }
        }
        if (!termData) {
          termData = await this.prisma.term.findFirst({
            where: { sessionId: sessionData.id, isCurrent: true, isActive: true },
          }) || await this.prisma.term.findFirst({
            where: { sessionId: sessionData.id, isActive: true },
            orderBy: { createdAt: 'desc' },
          });
        }
      } else if (sessionData) {
        const sessionTerms = await this.prisma.term.findMany({
          where: { sessionId: sessionData.id, isActive: true },
        });
        sessionTermIds = sessionTerms.map((t) => t.id);
      }

      // 3. Build SQL conditions
      let termCondition = Prisma.empty;
      if (!isAllTerms && termData) {
        termCondition = Prisma.sql`AND a."termId" = ${termData.id}`;
      } else if (isAllTerms && sessionTermIds.length > 0) {
        termCondition = Prisma.sql`AND a."termId" IN (${Prisma.join(sessionTermIds)})`;
      }

      const lgaCondition = lgaId ? Prisma.sql`AND sch."lgaId" = ${lgaId}` : Prisma.empty;

      // 4. Pre-check if assessments exist for this period
      let hasAssessments = false;
      if (termCondition !== Prisma.empty) {
        const check = await this.prisma.$queryRaw<any[]>`
          SELECT 1 FROM assessments a WHERE 1=1 ${termCondition} LIMIT 1;
        `;
        hasAssessments = Boolean(check && check.length > 0);
      }

      // Get total school & student counts from DB
      const [totalSchools, totalStudents, lgaSchoolsList, primarySchoolsCount, secondarySchoolsCount] = await Promise.all([
        this.prisma.school.count({
          where: { isActive: true, ...(lgaId ? { lgaId } : {}) },
        }),
        this.prisma.student.count({
          where: { isActive: true, ...(lgaId ? { school: { lgaId } } : {}) },
        }),
        this.prisma.localGovernmentArea.findMany({
          orderBy: { name: 'asc' },
          include: { _count: { select: { schools: { where: { isActive: true } } } } },
        }),
        this.prisma.school.count({
          where: { isActive: true, level: 'PRIMARY', ...(lgaId ? { lgaId } : {}) },
        }),
        this.prisma.school.count({
          where: { isActive: true, level: 'SECONDARY', ...(lgaId ? { lgaId } : {}) },
        }),
      ]);

      const averageSchoolSize = totalSchools > 0 ? Math.round(totalStudents / totalSchools) : 0;

      // If no assessments exist for selected period, return zeroed structure in ~5ms
      if (!hasAssessments) {
        const emptyLgas = lgaSchoolsList.map((lga) => ({
          lgaId: lga.id,
          lgaName: lga.name,
          lgaCode: LGA_CODES[lga.name] || lga.code || lga.name.substring(0, 4).toUpperCase(),
          schoolCount: lga._count?.schools || 0,
          studentCount: 0,
          averagePercentage: 0,
          passRate: 0,
          previousAverage: null,
          change: null,
        }));

        return ResponseHelper.success('School analytics retrieved successfully', {
          session: sessionData.name,
          term: isAllTerms ? 'ALL_TERMS' : (termData?.name || 'N/A'),
          summary: {
            totalSchools,
            primarySchoolsCount,
            secondarySchoolsCount,
            statewideSchoolAverage: 0,
            totalStudents,
            totalAssessedStudents: 0,
            averageSchoolSize,
            topPerformingSchool: 'N/A',
            topPerformingLga: 'N/A',
          },
          byLga: emptyLgas,
          topSchools: [],
          performanceBands: [
            { band: 'Distinction (>75%)', key: 'distinction', count: 0, percentage: 0, color: '#059669' },
            { band: 'Good (60-74%)', key: 'good', count: 0, percentage: 0, color: '#10b981' },
            { band: 'Average (50-59%)', key: 'average', count: 0, percentage: 0, color: '#f59e0b' },
            { band: 'Needs Improvement (<50%)', key: 'needsImprovement', count: 0, percentage: 0, color: '#ef4444' },
          ],
          sizeDistribution: [
            { cohort: 'Small (<50)', key: 'small', count: 0, percentage: 0, averagePercentage: 0, color: '#3b82f6' },
            { cohort: 'Medium (50-150)', key: 'medium', count: 0, percentage: 0, averagePercentage: 0, color: '#10b981' },
            { cohort: 'Large (150-300)', key: 'large', count: 0, percentage: 0, averagePercentage: 0, color: '#f59e0b' },
            { cohort: 'Mega (>300)', key: 'mega', count: 0, percentage: 0, averagePercentage: 0, color: '#8b5cf6' },
          ],
        } as SchoolAnalyticsResponse);
      }

      // 5. Determine previous period for rise/fall comparison
      let prevTermCondition = Prisma.empty;
      if (!isAllTerms && termData) {
        const termsInSession = await this.prisma.term.findMany({
          where: { sessionId: sessionData.id, isActive: true },
          orderBy: { startDate: 'asc' },
        });
        const currentIdx = termsInSession.findIndex((t) => t.id === termData.id);
        if (currentIdx > 0) {
          prevTermCondition = Prisma.sql`AND a."termId" = ${termsInSession[currentIdx - 1].id}`;
        }
      } else if (isAllTerms) {
        const prevSession = await this.prisma.session.findFirst({
          where: { startDate: { lt: sessionData.startDate }, isActive: true },
          orderBy: { startDate: 'desc' },
          include: { terms: { where: { isActive: true } } },
        });
        const prevSessionTermIds = prevSession?.terms?.map((t) => t.id) || [];
        if (prevSessionTermIds.length > 0) {
          prevTermCondition = Prisma.sql`AND a."termId" IN (${Prisma.join(prevSessionTermIds)})`;
        }
      }

      // 6. Execute aggregation queries in small, pool-safe sequential batches
      // Batch 1: LGA performance and previous period comparison
      const [lgaResults, prevLgaResults] = await Promise.all([
        this.prisma.$queryRaw<any[]>`
          SELECT 
            l.id as "lgaId",
            l.name as "lgaName",
            l.code as "lgaCode",
            COUNT(DISTINCT sch.id)::int as "schoolCount",
            COUNT(DISTINCT a."studentId")::int as "studentCount",
            COALESCE(ROUND(AVG((a.score::float / NULLIF(a."maxScore", 0)) * 100)::numeric, 1), 0)::float as "averagePercentage",
            COALESCE(ROUND((COUNT(CASE WHEN (a.score::float / NULLIF(a."maxScore", 0)) * 100 >= 50 THEN 1 END)::numeric / NULLIF(COUNT(a.id), 0)) * 100, 1), 0)::float as "passRate"
          FROM local_government_areas l
          LEFT JOIN schools sch ON sch."lgaId" = l.id AND sch."isActive" = true
          LEFT JOIN students s ON s."schoolId" = sch.id AND s."isActive" = true
          LEFT JOIN assessments a ON a."studentId" = s.id ${termCondition}
          GROUP BY l.id, l.name, l.code
          ORDER BY l.name ASC;
        `,
        prevTermCondition !== Prisma.empty
          ? this.prisma.$queryRaw<any[]>`
              SELECT 
                l.id as "lgaId",
                COALESCE(ROUND(AVG((a.score::float / NULLIF(a."maxScore", 0)) * 100)::numeric, 1), 0)::float as "averagePercentage"
              FROM local_government_areas l
              LEFT JOIN schools sch ON sch."lgaId" = l.id AND sch."isActive" = true
              LEFT JOIN students s ON s."schoolId" = sch.id AND s."isActive" = true
              LEFT JOIN assessments a ON a."studentId" = s.id ${prevTermCondition}
              GROUP BY l.id;
            `
          : Promise.resolve([]),
      ]);

      // Batch 2: Top Schools, Performance Tiers, and Size Cohorts
      const [topSchoolsResults, tiersResult, sizeResult] = await Promise.all([
        this.prisma.$queryRaw<any[]>`
          SELECT 
            sch.id as "schoolId",
            sch.name as "schoolName",
            l.name as "lgaName",
            COUNT(DISTINCT a."studentId")::int as "studentCount",
            COALESCE(ROUND(AVG((a.score::float / NULLIF(a."maxScore", 0)) * 100)::numeric, 1), 0)::float as "averagePercentage",
            COALESCE(ROUND((COUNT(CASE WHEN (a.score::float / NULLIF(a."maxScore", 0)) * 100 >= 50 THEN 1 END)::numeric / NULLIF(COUNT(a.id), 0)) * 100, 1), 0)::float as "passRate"
          FROM schools sch
          JOIN local_government_areas l ON l.id = sch."lgaId"
          JOIN students s ON s."schoolId" = sch.id AND s."isActive" = true
          JOIN assessments a ON a."studentId" = s.id ${termCondition}
          WHERE sch."isActive" = true ${lgaCondition}
          GROUP BY sch.id, sch.name, l.name
          HAVING COUNT(a.id) > 0
          ORDER BY "averagePercentage" DESC
          LIMIT 8;
        `,
        this.prisma.$queryRaw<any[]>`
          WITH school_avgs AS (
            SELECT 
              sch.id,
              AVG((a.score::float / NULLIF(a."maxScore", 0)) * 100) as avg_pct
            FROM schools sch
            JOIN students s ON s."schoolId" = sch.id AND s."isActive" = true
            JOIN assessments a ON a."studentId" = s.id ${termCondition}
            WHERE sch."isActive" = true ${lgaCondition}
            GROUP BY sch.id
          )
          SELECT 
            COUNT(CASE WHEN avg_pct >= 75 THEN 1 END)::int as distinction,
            COUNT(CASE WHEN avg_pct >= 60 AND avg_pct < 75 THEN 1 END)::int as good,
            COUNT(CASE WHEN avg_pct >= 50 AND avg_pct < 60 THEN 1 END)::int as average,
            COUNT(CASE WHEN avg_pct < 50 THEN 1 END)::int as "needsImprovement",
            COUNT(*)::int as total
          FROM school_avgs;
        `,
        this.prisma.$queryRaw<any[]>`
          WITH school_sizes AS (
            SELECT 
              sch.id,
              COUNT(DISTINCT s.id)::int as enrollment,
              COALESCE(AVG((a.score::float / NULLIF(a."maxScore", 0)) * 100), 0)::float as avg_pct
            FROM schools sch
            LEFT JOIN students s ON s."schoolId" = sch.id AND s."isActive" = true
            LEFT JOIN assessments a ON a."studentId" = s.id ${termCondition}
            WHERE sch."isActive" = true ${lgaCondition}
            GROUP BY sch.id
          )
          SELECT 
            COUNT(CASE WHEN enrollment < 50 THEN 1 END)::int as small_count,
            COALESCE(ROUND(AVG(CASE WHEN enrollment < 50 AND avg_pct > 0 THEN avg_pct END)::numeric, 1), 0)::float as small_avg,
            COUNT(CASE WHEN enrollment >= 50 AND enrollment <= 150 THEN 1 END)::int as medium_count,
            COALESCE(ROUND(AVG(CASE WHEN enrollment >= 50 AND enrollment <= 150 AND avg_pct > 0 THEN avg_pct END)::numeric, 1), 0)::float as medium_avg,
            COUNT(CASE WHEN enrollment > 150 AND enrollment <= 300 THEN 1 END)::int as large_count,
            COALESCE(ROUND(AVG(CASE WHEN enrollment > 150 AND enrollment <= 300 AND avg_pct > 0 THEN avg_pct END)::numeric, 1), 0)::float as large_avg,
            COUNT(CASE WHEN enrollment > 300 THEN 1 END)::int as mega_count,
            COALESCE(ROUND(AVG(CASE WHEN enrollment > 300 AND avg_pct > 0 THEN avg_pct END)::numeric, 1), 0)::float as mega_avg,
            COUNT(*)::int as total_schools
          FROM school_sizes;
        `,
      ]);

      // Process LGA rise/fall comparison map
      const prevMap = new Map<string, number>();
      if (Array.isArray(prevLgaResults)) {
        prevLgaResults.forEach((p) => {
          prevMap.set(p.lgaId, Number(p.averagePercentage || 0));
        });
      }

      const byLga = (lgaResults || []).map((lga) => {
        const avg = Number(lga.averagePercentage || 0);
        const prevAvg = prevMap.has(lga.lgaId) ? prevMap.get(lga.lgaId)! : null;
        const change = prevAvg !== null && prevAvg > 0 ? Math.round((avg - prevAvg) * 10) / 10 : null;

        return {
          lgaId: lga.lgaId,
          lgaName: lga.lgaName,
          lgaCode: LGA_CODES[lga.lgaName] || lga.lgaCode || lga.lgaName.substring(0, 4).toUpperCase(),
          schoolCount: Number(lga.schoolCount || 0),
          studentCount: Number(lga.studentCount || 0),
          averagePercentage: avg,
          passRate: Number(lga.passRate || 0),
          previousAverage: prevAvg,
          change,
        };
      });

      // Compute total assessed students across LGAs
      const totalAssessedStudents = byLga.reduce((sum, item) => sum + item.studentCount, 0);

      // Compute Statewide School Average
      const activeLgas = byLga.filter((l) => l.studentCount > 0);
      const statewideSchoolAverage =
        activeLgas.length > 0
          ? Math.round(
              (activeLgas.reduce((sum, l) => sum + l.averagePercentage * l.studentCount, 0) /
                totalAssessedStudents) *
                10
            ) / 10
          : 0;

      // Top Performing LGA
      const topLgaItem = [...activeLgas].sort((a, b) => b.averagePercentage - a.averagePercentage)[0];
      const topPerformingLga = topLgaItem ? topLgaItem.lgaName : 'N/A';

      // Top Performing School
      const topSchools = (topSchoolsResults || []).map((s) => ({
        schoolId: s.schoolId,
        schoolName: s.schoolName,
        lgaName: s.lgaName,
        averagePercentage: Number(s.averagePercentage || 0),
        studentCount: Number(s.studentCount || 0),
        passRate: Number(s.passRate || 0),
      }));
      const topPerformingSchool = topSchools.length > 0 ? topSchools[0].schoolName : 'N/A';

      // Process Performance Tiers
      const tierData = tiersResult?.[0] || { distinction: 0, good: 0, average: 0, needsImprovement: 0, total: 0 };
      const tierTotal = Math.max(Number(tierData.total || 0), 1);
      const performanceBands = [
        {
          band: 'Distinction (>75%)',
          key: 'distinction' as const,
          count: Number(tierData.distinction || 0),
          percentage: Math.round((Number(tierData.distinction || 0) / tierTotal) * 100),
          color: '#059669',
        },
        {
          band: 'Good (60-74%)',
          key: 'good' as const,
          count: Number(tierData.good || 0),
          percentage: Math.round((Number(tierData.good || 0) / tierTotal) * 100),
          color: '#10b981',
        },
        {
          band: 'Average (50-59%)',
          key: 'average' as const,
          count: Number(tierData.average || 0),
          percentage: Math.round((Number(tierData.average || 0) / tierTotal) * 100),
          color: '#f59e0b',
        },
        {
          band: 'Needs Improvement (<50%)',
          key: 'needsImprovement' as const,
          count: Number(tierData.needsImprovement || 0),
          percentage: Math.round((Number(tierData.needsImprovement || 0) / tierTotal) * 100),
          color: '#ef4444',
        },
      ];

      // Process Size Distribution
      const szData = sizeResult?.[0] || {
        small_count: 0, small_avg: 0,
        medium_count: 0, medium_avg: 0,
        large_count: 0, large_avg: 0,
        mega_count: 0, mega_avg: 0,
        total_schools: totalSchools,
      };
      const szTotal = Math.max(Number(szData.total_schools || totalSchools), 1);
      const sizeDistribution = [
        {
          cohort: 'Small (<50)',
          key: 'small' as const,
          count: Number(szData.small_count || 0),
          percentage: Math.round((Number(szData.small_count || 0) / szTotal) * 100),
          averagePercentage: Number(szData.small_avg || 0),
          color: '#3b82f6',
        },
        {
          cohort: 'Medium (50-150)',
          key: 'medium' as const,
          count: Number(szData.medium_count || 0),
          percentage: Math.round((Number(szData.medium_count || 0) / szTotal) * 100),
          averagePercentage: Number(szData.medium_avg || 0),
          color: '#10b981',
        },
        {
          cohort: 'Large (150-300)',
          key: 'large' as const,
          count: Number(szData.large_count || 0),
          percentage: Math.round((Number(szData.large_count || 0) / szTotal) * 100),
          averagePercentage: Number(szData.large_avg || 0),
          color: '#f59e0b',
        },
        {
          cohort: 'Mega (>300)',
          key: 'mega' as const,
          count: Number(szData.mega_count || 0),
          percentage: Math.round((Number(szData.mega_count || 0) / szTotal) * 100),
          averagePercentage: Number(szData.mega_avg || 0),
          color: '#8b5cf6',
        },
      ];

      return ResponseHelper.success('School analytics retrieved successfully', {
        session: sessionData.name,
        term: isAllTerms ? 'ALL_TERMS' : (termData?.name || 'N/A'),
        summary: {
          totalSchools,
          primarySchoolsCount,
          secondarySchoolsCount,
          statewideSchoolAverage,
          totalStudents,
          totalAssessedStudents,
          averageSchoolSize,
          topPerformingSchool,
          topPerformingLga,
        },
        byLga,
        topSchools,
        performanceBands,
        sizeDistribution,
      } as SchoolAnalyticsResponse);
    } catch (error) {
      this.logger.error(`Error in getSchoolAnalytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all schools with pagination, filters, and real-time academic score aggregation
   */
  async getAllSchools(query: SchoolQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      session,
      term,
      lgaId,
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;

    this.logger.log(colors.cyan(`Fetching schools: page=${page}, limit=${limit}, search=${search || 'none'}, lgaId=${lgaId || 'all'}`));

    const skip = (page - 1) * limit;

    // Resolve Session & Term for academic score calculation
    let sessionData: any = null;
    if (session) {
      sessionData = await this.prisma.session.findFirst({
        where: { OR: [{ id: session }, { name: session }], isActive: true },
      });
    }

    const isAllTerms = term === 'ALL_TERMS';
    let termData: any = null;
    let sessionTermIds: string[] = [];

    if (!isAllTerms && term && sessionData) {
      const isTermType = Object.values(TermType).includes(term as TermType);
      termData = await this.prisma.term.findFirst({
        where: {
          sessionId: sessionData.id,
          OR: [
            { id: term },
            ...(isTermType ? [{ name: term as TermType }] : []),
          ],
          isActive: true,
        },
      });
      if (!termData) {
        termData = await this.prisma.term.findFirst({
          where: {
            OR: [
              { id: term },
              ...(isTermType ? [{ name: term as TermType }] : []),
            ],
            isActive: true,
          },
        });
      }
    } else if (isAllTerms && sessionData) {
      const sessionTerms = await this.prisma.term.findMany({
        where: { sessionId: sessionData.id, isActive: true },
      });
      sessionTermIds = sessionTerms.map((t) => t.id);
    }

    let termCondition = Prisma.empty;
    if (!isAllTerms && termData) {
      termCondition = Prisma.sql`AND a."termId" = ${termData.id}`;
    } else if (isAllTerms && sessionTermIds.length > 0) {
      termCondition = Prisma.sql`AND a."termId" IN (${Prisma.join(sessionTermIds)})`;
    }

    // Build where clause
    const where: Prisma.SchoolWhereInput = {
      isActive: true,
      ...(lgaId && lgaId !== 'all-lgas' ? { lgaId } : {}),
      ...(search && search.trim()
        ? {
            OR: [
              { name: { contains: search.trim(), mode: 'insensitive' } },
              { code: { contains: search.trim(), mode: 'insensitive' } },
              { principalName: { contains: search.trim(), mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, schools] = await Promise.all([
      this.prisma.school.count({ where }),
      this.prisma.school.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
          level: true,
          address: true,
          phone: true,
          email: true,
          website: true,
          principalName: true,
          principalPhone: true,
          principalEmail: true,
          establishedYear: true,
          capacity: true,
          totalTeachers: true,
          lga: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              students: { where: { isActive: true } },
              classes: { where: { isActive: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: sortBy === 'name' ? { name: sortOrder } : { createdAt: 'desc' },
      }),
    ]);

    // Calculate assessment averages for retrieved schools
    const schoolIds = schools.map((s) => s.id);
    const scoreMap = new Map<string, { averageScore: number; assessedStudents: number }>();

    if (schoolIds.length > 0 && termCondition !== Prisma.empty) {
      try {
        const scores = await this.prisma.$queryRaw<any[]>`
          SELECT 
            s."schoolId",
            COUNT(DISTINCT a."studentId")::int as "assessedStudents",
            COALESCE(ROUND(AVG((a.score::float / NULLIF(a."maxScore", 0)) * 100)::numeric, 1), 0)::float as "averageScore"
          FROM assessments a
          JOIN students s ON s.id = a."studentId" AND s."isActive" = true
          WHERE s."schoolId" IN (${Prisma.join(schoolIds)})
          ${termCondition}
          GROUP BY s."schoolId";
        `;

        scores.forEach((sc) => {
          scoreMap.set(sc.schoolId, {
            averageScore: Number(sc.averageScore || 0),
            assessedStudents: Number(sc.assessedStudents || 0),
          });
        });
      } catch (err) {
        this.logger.warn(`Could not compute scores for schools: ${err.message}`);
      }
    }

    const schoolsWithScores = schools.map((school) => {
      const stats = scoreMap.get(school.id) || { averageScore: 0, assessedStudents: 0 };
      return {
        id: school.id,
        name: school.name,
        code: school.code,
        level: school.level,
        address: school.address,
        phone: school.phone,
        email: school.email,
        website: school.website,
        principalName: school.principalName,
        principalPhone: school.principalPhone,
        principalEmail: school.principalEmail,
        establishedYear: school.establishedYear,
        capacity: school.capacity,
        totalTeachers: school.totalTeachers,
        lga: school.lga,
        totalClasses: school._count.classes,
        totalStudents: school._count.students,
        assessedStudents: stats.assessedStudents,
        averageScore: stats.averageScore,
      };
    });

    return ResponseHelper.success('Schools retrieved successfully', {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
        nextPage: page < Math.ceil(total / limit) ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
        startIndex: (page - 1) * limit + 1,
        endIndex: Math.min(page * limit, total),
      },
      data: schoolsWithScores,
    });
  }

  async getAllClasses(page: number = 1, limit: number = 10) {
    this.logger.log(colors.cyan(`Fetching classes with pagination - page: ${page}, limit: ${limit}`));

    const skip = (page - 1) * limit;

    const total = await this.prisma.class.count({
      where: { isActive: true },
    });

    const classes = await this.prisma.class.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        grade: true,
        section: true,
        capacity: true,
        currentEnrollment: true,
        academicYear: true,
        school: {
          select: {
            id: true,
            name: true,
            code: true,
            level: true,
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
      orderBy: [
        { school: { name: 'asc' } },
        { grade: 'asc' },
        { section: 'asc' },
      ],
    });

    const classesWithDetails = classes.map((cls) => ({
      id: cls.id,
      name: cls.name,
      grade: cls.grade,
      section: cls.section,
      capacity: cls.capacity,
      currentEnrollment: cls.currentEnrollment,
      actualEnrollment: cls._count.students,
      academicYear: cls.academicYear,
      school: cls.school,
      enrollmentPercentage: cls.capacity > 0 ? Math.round((cls._count.students / cls.capacity) * 100) : 0,
    }));

    return ResponseHelper.success('Classes retrieved successfully', {
      data: classesWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
        nextPage: page < Math.ceil(total / limit) ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
        startIndex: (page - 1) * limit + 1,
        endIndex: Math.min(page * limit, total),
      },
    });
  }

  private async generateUniqueCode(name: string): Promise<string> {
    const firstThreeLetters = name.substring(0, 3).toUpperCase();
    let code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const randomDigits = Math.floor(Math.random() * 900) + 100;
      code = `${firstThreeLetters}${randomDigits}`;

      const existingCode = await this.prisma.school.findFirst({
        where: { code },
      });

      if (!existingCode) {
        isUnique = true;
      } else {
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error('Unable to generate unique code after maximum attempts');
    }

    return code!;
  }
}