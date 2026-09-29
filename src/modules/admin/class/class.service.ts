import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateClassDto,
  UpdateClassDto,
  ClassQueryDto,
  ClassAnalyticsQueryDto,
} from './dto';
import { ResponseHelper } from '../../../common/helpers';
import * as colors from 'colors';
import { DataCacheService } from '../../../common/cache/data-cache.service';

export function normalizeGrade(rawGrade: string): string {
  if (!rawGrade) return 'Unassigned';
  const clean = rawGrade.trim().toLowerCase().replace(/\s+/g, ' ');

  if (/^primar\s*y?\s*1$/i.test(clean) || /^basic\s*1$/i.test(clean) || clean === 'p1' || clean === 'pri 1') return 'Primary 1';
  if (/^primar\s*y?\s*2$/i.test(clean) || /^basic\s*2$/i.test(clean) || clean === 'p2' || clean === 'pri 2') return 'Primary 2';
  if (/^primar\s*y?\s*3$/i.test(clean) || /^basic\s*3$/i.test(clean) || clean === 'p3' || clean === 'pri 3') return 'Primary 3';
  if (/^primar\s*y?\s*4$/i.test(clean) || /^(baisc|basic)\s*4$/i.test(clean) || clean === 'p4' || clean === 'pri 4') return 'Primary 4';
  if (/^primar(yn|y)?\s*5$/i.test(clean) || /^(baisc|basic)\s*5$/i.test(clean) || clean === 'p5' || clean === 'pri 5') return 'Primary 5';
  if (/^primar\s*y?\s*6$/i.test(clean) || /^(baisc|basic)\s*6$/i.test(clean) || clean === 'p6' || clean === 'pri 6') return 'Primary 6';

  if (/^eccde\s*1$/i.test(clean) || clean === 'eccde1') return 'ECCDE 1';
  if (/^eccde\s*2$/i.test(clean) || clean === 'eccde2') return 'ECCDE 2';
  if (/^eccde\s*3$/i.test(clean) || clean === 'eccde3') return 'ECCDE 3';

  if (/^(nur|nursery)\s*1$/i.test(clean)) return 'Nursery 1';
  if (/^(nur|nursery)\s*2$/i.test(clean)) return 'Nursery 2';
  if (/^(nur|nursery)\s*3$/i.test(clean)) return 'Nursery 3';

  if (/^jss\s*1$/i.test(clean) || clean === 'jss1') return 'JSS 1';
  if (/^jss\s*2$/i.test(clean) || clean === 'jss2') return 'JSS 2';
  if (/^jss\s*3$/i.test(clean) || clean === 'jss3') return 'JSS 3';

  if (/^sss\s*1$/i.test(clean) || clean === 'sss1') return 'SSS 1';
  if (/^sss\s*2$/i.test(clean) || clean === 'sss2') return 'SSS 2';
  if (/^sss\s*3$/i.test(clean) || clean === 'sss3') return 'SSS 3';

  return clean.replace(/\b\w/g, (c) => c.toUpperCase());
}

export const GRADE_ORDER: Record<string, number> = {
  'ECCDE 1': 1,
  'ECCDE 2': 2,
  'ECCDE 3': 3,
  'Nursery 1': 4,
  'Nursery 2': 5,
  'Nursery 3': 6,
  'Primary 1': 7,
  'Primary 2': 8,
  'Primary 3': 9,
  'Primary 4': 10,
  'Primary 5': 11,
  'Primary 6': 12,
  'JSS 1': 13,
  'JSS 2': 14,
  'JSS 3': 15,
  'SSS 1': 16,
  'SSS 2': 17,
  'SSS 3': 18,
};

@Injectable()
export class ClassService {
  private readonly logger = new Logger(ClassService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dataCacheService: DataCacheService,
  ) {}

  /**
   * Get all classes with pagination, multi-field filtering, and search
   */
  async getAllClasses(query: ClassQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      schoolId,
      lgaId,
      grade,
      academicYear,
    } = query;

    this.logger.log(
      colors.cyan(
        `Fetching classes - page: ${page}, limit: ${limit}, search: ${search || 'none'}, schoolId: ${schoolId || 'none'}, lgaId: ${lgaId || 'none'}`,
      ),
    );

    const isSearching = Boolean(search && search.trim().length > 0);
    const cacheKey = `admin:classes:list:${JSON.stringify(query)}`;

    if (!isSearching) {
      const cached = this.dataCacheService.get<any>(cacheKey);
      if (cached) {
        this.logger.log(colors.green(`[DataCache] HIT for ${cacheKey}`));
        return cached;
      }
    }

    const skip = (page - 1) * limit;

    const isStatewide =
      query.statewide === true ||
      query.statewide === 'true' ||
      String(query.statewide) === 'true';

    if (isStatewide) {
      const allClasses = await this.prisma.class.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          grade: true,
          academicYear: true,
          school: {
            select: {
              id: true,
              name: true,
              code: true,
              level: true,
              lga: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              students: { where: { isActive: true } },
            },
          },
        },
      });

      const gradeSchoolMap = new Map<
        string,
        {
          grade: string;
          schoolsMap: Map<string, { id: string; name: string; lgaName: string; studentCount: number }>;
          totalStudents: number;
          academicYear: string;
        }
      >();

      for (const cls of allClasses) {
        const norm = normalizeGrade(cls.grade || cls.name);
        const existing = gradeSchoolMap.get(norm) || {
          grade: norm,
          schoolsMap: new Map(),
          totalStudents: 0,
          academicYear: cls.academicYear || '2024-2025',
        };

        const count = cls._count?.students || 0;
        existing.totalStudents += count;

        if (cls.school) {
          const prev = existing.schoolsMap.get(cls.school.id) || {
            id: cls.school.id,
            name: cls.school.name,
            lgaName: cls.school.lga?.name || 'N/A',
            studentCount: 0,
          };
          prev.studentCount += count;
          existing.schoolsMap.set(cls.school.id, prev);
        }

        gradeSchoolMap.set(norm, existing);
      }

      const standardList = [
        'ECCDE 1',
        'ECCDE 2',
        'ECCDE 3',
        'Primary 1',
        'Primary 2',
        'Primary 3',
        'Primary 4',
        'Primary 5',
        'Primary 6',
        'JSS 1',
        'JSS 2',
        'JSS 3',
        'SSS 1',
        'SSS 2',
        'SSS 3',
      ];

      const allGradeNames = Array.from(
        new Set([...standardList, ...Array.from(gradeSchoolMap.keys())]),
      );

      let statewideClasses = allGradeNames.map((gradeName) => {
        const data = gradeSchoolMap.get(gradeName);
        const schoolsList = data ? Array.from(data.schoolsMap.values()) : [];
        return {
          id: `class-level-${gradeName.toLowerCase().replace(/\s+/g, '-')}`,
          name: gradeName,
          grade: gradeName,
          schoolsCount: schoolsList.length,
          studentCount: data ? data.totalStudents : 0,
          currentEnrollment: data ? data.totalStudents : 0,
          capacity: schoolsList.length * 35,
          utilization: 0,
          academicYear: data?.academicYear || '2024-2025',
          schools: schoolsList,
          school: {
            id: 'statewide',
            name: `${schoolsList.length} Registered Schools`,
            level: gradeName.startsWith('JSS') || gradeName.startsWith('SSS') ? 'SECONDARY' : 'PRIMARY',
            lga: null,
          },
        };
      });

      if (search && search.trim()) {
        const s = search.trim().toLowerCase();
        statewideClasses = statewideClasses.filter(
          (c) => c.name.toLowerCase().includes(s) || c.grade.toLowerCase().includes(s),
        );
      }

      statewideClasses.sort(
        (a, b) => (GRADE_ORDER[a.grade] || 99) - (GRADE_ORDER[b.grade] || 99),
      );

      const total = statewideClasses.length;
      const paginated = statewideClasses.slice(skip, skip + limit);

      const response = ResponseHelper.success('State-wide classes retrieved successfully', {
        classes: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });

      return response;
    }

    // Build where conditions
    const whereConditions: Prisma.ClassWhereInput = {
      isActive: true,
    };

    if (schoolId) {
      whereConditions.schoolId = schoolId;
    }

    if (lgaId) {
      whereConditions.school = {
        lgaId,
      };
    }

    if (grade) {
      whereConditions.grade = {
        equals: grade,
        mode: 'insensitive',
      };
    }

    if (academicYear) {
      const hyphenYear = academicYear.replace('/', '-');
      const slashYear = academicYear.replace('-', '/');
      whereConditions.academicYear = { in: [academicYear, hyphenYear, slashYear] };
    }

    if (search && search.trim().length > 0) {
      const term = search.trim();
      whereConditions.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { grade: { contains: term, mode: 'insensitive' } },
        { section: { contains: term, mode: 'insensitive' } },
        { school: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [total, classes] = await Promise.all([
      this.prisma.class.count({ where: whereConditions }),
      this.prisma.class.findMany({
        where: whereConditions,
        select: {
          id: true,
          name: true,
          grade: true,
          section: true,
          capacity: true,
          currentEnrollment: true,
          academicYear: true,
          createdAt: true,
          updatedAt: true,
          school: {
            select: {
              id: true,
              name: true,
              code: true,
              level: true,
              lga: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
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
      }),
    ]);

    const formattedClasses = classes.map((cls) => {
      const studentCount = cls._count?.students ?? cls.currentEnrollment ?? 0;
      const capacity = cls.capacity || 35;
      const utilization = Math.min(
        Math.round((studentCount / capacity) * 100),
        200,
      );

      return {
        id: cls.id,
        name: cls.name,
        grade: cls.grade,
        section: cls.section,
        capacity,
        currentEnrollment: studentCount,
        studentCount,
        utilization,
        academicYear: cls.academicYear,
        createdAt: cls.createdAt,
        updatedAt: cls.updatedAt,
        school: {
          id: cls.school?.id,
          name: cls.school?.name,
          code: cls.school?.code,
          level: cls.school?.level,
          lga: cls.school?.lga
            ? {
                id: cls.school.lga.id,
                name: cls.school.lga.name,
              }
            : null,
        },
        teacher: cls.teacher
          ? {
              id: cls.teacher.id,
              name: `${cls.teacher.firstName} ${cls.teacher.lastName}`.trim(),
              email: cls.teacher.email,
            }
          : null,
      };
    });

    const response = ResponseHelper.success(
      'Classes retrieved successfully',
      {
        classes: formattedClasses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    );

    if (!isSearching) {
      this.dataCacheService.set(cacheKey, response);
    }

    return response;
  }

  /**
   * Get comprehensive class analytics & demographic metrics
   */
  async getClassAnalytics(query: ClassAnalyticsQueryDto) {
    const { session, lgaId, schoolId } = query;

    this.logger.log(
      colors.cyan(
        `Fetching class analytics - session: ${session || 'all'}, lgaId: ${lgaId || 'all'}, schoolId: ${schoolId || 'all'}`,
      ),
    );

    const cacheKey = `admin:classes:analytics:${JSON.stringify(query)}`;
    const cached = this.dataCacheService.get<any>(cacheKey);
    if (cached) {
      this.logger.log(colors.green(`[DataCache] HIT for ${cacheKey}`));
      return cached;
    }

    // Build Prisma filter
    const whereConditions: Prisma.ClassWhereInput = {
      isActive: true,
    };

    if (schoolId) {
      whereConditions.schoolId = schoolId;
    }

    if (lgaId) {
      whereConditions.school = { lgaId };
    }

    if (session) {
      const hyphenSession = session.replace('/', '-');
      const slashSession = session.replace('-', '/');
      whereConditions.academicYear = { in: [session, hyphenSession, slashSession] };
    }

    // Raw query for fast, accurate aggregations across classes
    const classes = await this.prisma.class.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        grade: true,
        section: true,
        teacherId: true,
        academicYear: true,
        school: {
          select: {
            id: true,
            name: true,
            lgaId: true,
            lga: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            students: { where: { isActive: true } },
          },
        },
      },
    });

    const totalClasses = classes.length;
    let totalEnrolled = 0;
    let classesWithTeacherCount = 0;

    // Grade map
    const gradeMap = new Map<
      string,
      { grade: string; classCount: number; studentCount: number }
    >();

    // LGA map
    const lgaMap = new Map<
      string,
      { lgaId: string; lgaName: string; classCount: number; studentCount: number }
    >();

    // School map
    const schoolMap = new Map<
      string,
      { schoolId: string; schoolName: string; lgaName: string; classCount: number; studentCount: number }
    >();

    for (const cls of classes) {
      const studentCount = cls._count?.students || 0;
      totalEnrolled += studentCount;

      if (cls.teacherId) {
        classesWithTeacherCount += 1;
      }

      // Grade breakdown with normalization to deduplicate typos (e.g., 'primar y 6', 'primaryn 5', 'baisc 4')
      const rawGrade = cls.grade || 'Unassigned';
      const grade = normalizeGrade(rawGrade);
      const existingGrade = gradeMap.get(grade) || {
        grade,
        classCount: 0,
        studentCount: 0,
      };
      existingGrade.classCount += 1;
      existingGrade.studentCount += studentCount;
      gradeMap.set(grade, existingGrade);

      // LGA breakdown
      if (cls.school?.lga) {
        const lgaIdVal = cls.school.lgaId;
        const lgaNameVal = cls.school.lga.name;
        const existingLga = lgaMap.get(lgaIdVal) || {
          lgaId: lgaIdVal,
          lgaName: lgaNameVal,
          classCount: 0,
          studentCount: 0,
        };
        existingLga.classCount += 1;
        existingLga.studentCount += studentCount;
        lgaMap.set(lgaIdVal, existingLga);
      }

      // School breakdown
      if (cls.school) {
        const schId = cls.school.id;
        const schName = cls.school.name;
        const lgaNameVal = cls.school.lga?.name || 'Unknown LGA';
        const existingSch = schoolMap.get(schId) || {
          schoolId: schId,
          schoolName: schName,
          lgaName: lgaNameVal,
          classCount: 0,
          studentCount: 0,
        };
        existingSch.classCount += 1;
        existingSch.studentCount += studentCount;
        schoolMap.set(schId, existingSch);
      }
    }

    const averageClassSize =
      totalClasses > 0 ? Math.round((totalEnrolled / totalClasses) * 10) / 10 : 0;

    // Format clean grade array, sorted chronologically (ECCDE -> Nursery -> Primary 1-6 -> JSS -> SSS)
    const byGrade = Array.from(gradeMap.values())
      .map((g) => ({
        grade: g.grade,
        classCount: g.classCount,
        studentCount: g.studentCount,
        averageSize:
          g.classCount > 0 ? Math.round((g.studentCount / g.classCount) * 10) / 10 : 0,
      }))
      .sort((a, b) => (GRADE_ORDER[a.grade] || 99) - (GRADE_ORDER[b.grade] || 99));

    // Format LGA array
    const byLga = Array.from(lgaMap.values())
      .map((l) => ({
        lgaId: l.lgaId,
        lgaName: l.lgaName,
        classCount: l.classCount,
        studentCount: l.studentCount,
        averageSize:
          l.classCount > 0 ? Math.round((l.studentCount / l.classCount) * 10) / 10 : 0,
      }))
      .sort((a, b) => b.classCount - a.classCount);

    // Format Top Schools array
    const topSchools = Array.from(schoolMap.values())
      .sort((a, b) => b.classCount - a.classCount)
      .slice(0, 10);

    // Query assessments grouped by class for performance across class levels
    let classPerformanceData: any[] = [];
    try {
      const termCondition = query.term && query.term !== 'ALL_TERMS' && query.term !== 'all'
        ? Prisma.sql`AND t.name = ${query.term}::"TermType"`
        : Prisma.empty;

      const hyphenSession = session ? session.replace('/', '-') : '';
      const slashSession = session ? session.replace('-', '/') : '';
      const sessionCondition = session
        ? Prisma.sql`AND (sess.name = ${session} OR sess.name = ${hyphenSession} OR sess.name = ${slashSession} OR sess.id = ${session})`
        : Prisma.empty;

      const lgaPerfCondition = lgaId
        ? Prisma.sql`AND sch."lgaId" = ${lgaId}`
        : Prisma.empty;

      const schoolPerfCondition = schoolId
        ? Prisma.sql`AND s."schoolId" = ${schoolId}`
        : Prisma.empty;

      classPerformanceData = await this.prisma.$queryRaw<any[]>`
        SELECT 
          c.id AS "classId",
          c.name AS "className",
          c.grade AS "rawGrade",
          sch.id AS "schoolId",
          sch.name AS "schoolName",
          sch.level::text AS "schoolLevel",
          COALESCE(lga.name, 'N/A') AS "lgaName",
          COUNT(DISTINCT s.id)::int AS "studentCount",
          ROUND(AVG((a.score::float / NULLIF(a."maxScore", 0)) * 100)::numeric, 1)::float AS "averageScore",
          ROUND((COUNT(DISTINCT CASE WHEN (a.score::float / NULLIF(a."maxScore", 0)) >= 0.5 THEN s.id END)::float / NULLIF(COUNT(DISTINCT s.id), 0) * 100)::numeric, 1)::float AS "passRate"
        FROM assessments a
        JOIN students s ON a."studentId" = s.id
        JOIN classes c ON s."classId" = c.id
        JOIN schools sch ON s."schoolId" = sch.id
        LEFT JOIN local_government_areas lga ON sch."lgaId" = lga.id
        LEFT JOIN terms t ON a."termId" = t.id
        LEFT JOIN sessions sess ON t."sessionId" = sess.id
        WHERE s."isActive" = true
        ${termCondition}
        ${sessionCondition}
        ${lgaPerfCondition}
        ${schoolPerfCondition}
        GROUP BY c.id, c.name, c.grade, sch.id, sch.name, sch.level, lga.name
        HAVING COUNT(DISTINCT s.id) > 0
        ORDER BY "averageScore" DESC;
      `;
    } catch (err) {
      this.logger.warn(`Could not fetch class assessment performance: ${err.message}`);
    }

    const performanceGradeMap = new Map<
      string,
      { grade: string; classCount: number; studentCount: number; totalScoreSum: number; passCountSum: number }
    >();

    for (const item of classPerformanceData) {
      const normGrade = normalizeGrade(item.rawGrade);
      const existing = performanceGradeMap.get(normGrade) || {
        grade: normGrade,
        classCount: 0,
        studentCount: 0,
        totalScoreSum: 0,
        passCountSum: 0,
      };
      existing.classCount += 1;
      existing.studentCount += Number(item.studentCount || 0);
      existing.totalScoreSum += Number(item.averageScore || 0);
      existing.passCountSum += Number(item.passRate || 0);
      performanceGradeMap.set(normGrade, existing);
    }

    const isSecondaryGradeName = (normGrade: string) =>
      normGrade.startsWith('JSS') ||
      normGrade.startsWith('SSS') ||
      normGrade.startsWith('JS') ||
      normGrade.startsWith('SS');

    const performanceByGrade = Array.from(performanceGradeMap.values())
      .map((g) => ({
        grade: g.grade,
        schoolLevel: isSecondaryGradeName(g.grade) ? 'SECONDARY' : 'PRIMARY',
        classCount: g.classCount,
        studentCount: g.studentCount,
        averageScore: g.classCount > 0 ? Math.round((g.totalScoreSum / g.classCount) * 10) / 10 : 0,
        passRate: g.classCount > 0 ? Math.round((g.passCountSum / g.classCount) * 10) / 10 : 0,
      }))
      .sort((a, b) => (GRADE_ORDER[a.grade] || 99) - (GRADE_ORDER[b.grade] || 99));

    // Top performing classes (ranked by academic score)
    const topPerformingClasses = classPerformanceData.slice(0, 20).map((c, index) => ({
      rank: index + 1,
      classId: c.classId,
      className: c.className,
      grade: normalizeGrade(c.rawGrade),
      schoolName: c.schoolName,
      schoolLevel: c.schoolLevel || (isSecondaryGradeName(normalizeGrade(c.rawGrade)) ? 'SECONDARY' : 'PRIMARY'),
      lgaName: c.lgaName,
      studentCount: Number(c.studentCount || 0),
      averageScore: Number(c.averageScore || 0),
      passRate: Number(c.passRate || 0),
    }));

    // Performance bands calculation helper
    const calculateBands = (items: any[]) => {
      let distinctionCount = 0; // >= 70%
      let creditCount = 0; // 50 - 69%
      let passCount = 0; // 40 - 49%
      let failCount = 0; // < 40%

      for (const item of items) {
        const score = Number(item.averageScore || 0);
        if (score >= 70) distinctionCount++;
        else if (score >= 50) creditCount++;
        else if (score >= 40) passCount++;
        else failCount++;
      }

      const totalAssessed = items.length;
      return [
        {
          name: 'Distinction (≥70%)',
          count: distinctionCount,
          percentage: totalAssessed > 0 ? Math.round((distinctionCount / totalAssessed) * 100) : 0,
          color: '#10b981',
        },
        {
          name: 'Credit (50-69%)',
          count: creditCount,
          percentage: totalAssessed > 0 ? Math.round((creditCount / totalAssessed) * 100) : 0,
          color: '#3b82f6',
        },
        {
          name: 'Pass (40-49%)',
          count: passCount,
          percentage: totalAssessed > 0 ? Math.round((passCount / totalAssessed) * 100) : 0,
          color: '#f59e0b',
        },
        {
          name: 'Needs Improvement (<40%)',
          count: failCount,
          percentage: totalAssessed > 0 ? Math.round((failCount / totalAssessed) * 100) : 0,
          color: '#ef4444',
        },
      ];
    };

    const performanceBands = calculateBands(classPerformanceData);
    const primaryPerformanceBands = calculateBands(
      classPerformanceData.filter(
        (c) => c.schoolLevel === 'PRIMARY' || !isSecondaryGradeName(normalizeGrade(c.rawGrade)),
      ),
    );
    const secondaryPerformanceBands = calculateBands(
      classPerformanceData.filter(
        (c) => c.schoolLevel === 'SECONDARY' || isSecondaryGradeName(normalizeGrade(c.rawGrade)),
      ),
    );

    const analyticsData = {
      summary: {
        totalClasses,
        totalEnrolledStudents: totalEnrolled,
        averageClassSize,
        classesWithTeachers: classesWithTeacherCount,
        schoolsRepresented: schoolMap.size,
        totalAssessedClasses,
      },
      performanceByGrade,
      topPerformingClasses,
      performanceBands,
      primaryPerformanceBands,
      secondaryPerformanceBands,
    };

    const response = ResponseHelper.success(
      'Class analytics retrieved successfully',
      analyticsData,
    );

    this.dataCacheService.set(cacheKey, response);
    return response;
  }

  /**
   * Get class details by ID
   */
  async getClassById(id: string) {
    if (id.startsWith('class-level-')) {
      const rawGrade = id.replace('class-level-', '').replace(/-/g, ' ');
      const normGrade = normalizeGrade(rawGrade);

      const classes = await this.prisma.class.findMany({
        where: {
          isActive: true,
          OR: [
            { grade: { equals: normGrade, mode: 'insensitive' } },
            { name: { equals: normGrade, mode: 'insensitive' } },
          ],
        },
        include: {
          school: {
            select: {
              id: true,
              name: true,
              lga: { select: { name: true } },
            },
          },
          students: {
            where: { isActive: true },
            select: {
              id: true,
              studentId: true,
              firstName: true,
              lastName: true,
              gender: true,
            },
            take: 100,
          },
        },
      });

      const schoolsMap = new Map<string, any>();
      const studentsList: any[] = [];

      for (const c of classes) {
        if (c.school) {
          const prev = schoolsMap.get(c.school.id) || {
            id: c.school.id,
            name: c.school.name,
            lgaName: c.school.lga?.name || 'N/A',
            studentCount: 0,
          };
          prev.studentCount += c.students.length;
          schoolsMap.set(c.school.id, prev);
        }

        for (const st of c.students) {
          studentsList.push({
            ...st,
            schoolName: c.school?.name || 'Abia School',
            lgaName: c.school?.lga?.name || 'N/A',
          });
        }
      }

      const schoolsList = Array.from(schoolsMap.values());
      return ResponseHelper.success('Class retrieved successfully', {
        id,
        name: normGrade,
        grade: normGrade,
        schoolsCount: schoolsList.length,
        studentCount: studentsList.length,
        academicYear: '2024-2025',
        schools: schoolsList,
        students: studentsList,
      });
    }

    const cls = await this.prisma.class.findUnique({
      where: { id },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            code: true,
            level: true,
            address: true,
            lga: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        students: {
          where: { isActive: true },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true,
            gender: true,
            dateOfBirth: true,
          },
          take: 50,
        },
        _count: {
          select: {
            students: { where: { isActive: true } },
          },
        },
      },
    });

    if (!cls) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    const studentCount = cls._count?.students || 0;
    const capacity = cls.capacity || 35;
    const utilization = Math.round((studentCount / capacity) * 100);

    return ResponseHelper.success(
      'Class retrieved successfully',
      {
        ...cls,
        currentEnrollment: studentCount,
        studentCount,
        utilization,
      },
    );
  }

  /**
   * Create a new class
   */
  async createClass(createClassDto: CreateClassDto) {
    this.logger.log(
      colors.cyan(`Creating class: ${createClassDto.name}`),
    );

    const className = createClassDto.name.trim();
    const grade = createClassDto.grade ? createClassDto.grade.trim() : className;

    let schoolId = createClassDto.schoolId;
    if (!schoolId) {
      const defaultSchool = await this.prisma.school.findFirst({
        where: { isActive: true },
        select: { id: true, name: true },
      });
      if (!defaultSchool) {
        throw new NotFoundException('No active school found to associate with class.');
      }
      schoolId = defaultSchool.id;
    }

    // 1. Verify school exists
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, name: true },
    });

    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    // 2. Resolve academic year
    let academicYear: string = createClassDto.academicYear || '';
    if (!academicYear) {
      const activeSession = await this.prisma.session.findFirst({
        where: { isCurrent: true },
        select: { name: true },
      });
      academicYear = activeSession?.name || '2024-2025';
    }

    // 3. Check for duplicates in the same school and academic year
    const existing = await this.prisma.class.findFirst({
      where: {
        schoolId: schoolId,
        name: {
          equals: className,
          mode: 'insensitive',
        },
        academicYear,
        isActive: true,
      },
    });

    if (existing) {
      throw new ConflictException(
        `A class named "${className}" already exists in ${school.name} for the ${academicYear} academic year`,
      );
    }

    // 4. Create class
    const newClass = await this.prisma.class.create({
      data: {
        name: className,
        grade: grade,
        section: createClassDto.section?.trim() || 'A',
        schoolId: schoolId,
        capacity: createClassDto.capacity || 35,
        academicYear,
        teacherId: createClassDto.teacherId || null,
        currentEnrollment: 0,
        isActive: true,
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            code: true,
            lga: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // 5. Invalidate caches
    this.dataCacheService.invalidatePrefix('admin:classes');
    this.dataCacheService.invalidatePrefix('admin:schools');
    this.dataCacheService.invalidatePrefix('admin:dashboard');

    this.logger.log(colors.green(`Successfully created class: ${newClass.name} (ID: ${newClass.id})`));

    return ResponseHelper.success('Class created successfully', newClass);
  }

  /**
   * Update an existing class
   */
  async updateClass(id: string, updateClassDto: UpdateClassDto) {
    this.logger.log(colors.cyan(`Updating class ID: ${id}`));

    if (id.startsWith('class-level-')) {
      const oldGrade = id.replace('class-level-', '').replace(/-/g, ' ');
      const normOld = normalizeGrade(oldGrade);
      const newName = updateClassDto.name ? updateClassDto.name.trim() : normOld;

      await this.prisma.class.updateMany({
        where: {
          OR: [
            { grade: { equals: normOld, mode: 'insensitive' } },
            { name: { equals: normOld, mode: 'insensitive' } },
          ],
        },
        data: {
          name: newName,
          grade: newName,
        },
      });

      this.dataCacheService.invalidatePrefix('admin:classes');
      return ResponseHelper.success('Class updated successfully', {
        id,
        name: newName,
        grade: newName,
      });
    }

    const existingClass = await this.prisma.class.findUnique({
      where: { id },
    });

    if (!existingClass) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    // Check duplicate name if name or academic year is changing
    if (
      (updateClassDto.name && updateClassDto.name.trim().toLowerCase() !== existingClass.name.toLowerCase()) ||
      (updateClassDto.academicYear && updateClassDto.academicYear !== existingClass.academicYear)
    ) {
      const checkName = updateClassDto.name?.trim() || existingClass.name;
      const checkYear = updateClassDto.academicYear || existingClass.academicYear;

      const duplicate = await this.prisma.class.findFirst({
        where: {
          id: { not: id },
          schoolId: existingClass.schoolId,
          name: {
            equals: checkName,
            mode: 'insensitive',
          },
          academicYear: checkYear,
          isActive: true,
        },
      });

      if (duplicate) {
        throw new ConflictException(
          `Another class named "${checkName}" already exists in this school for ${checkYear}`,
        );
      }
    }

    const updated = await this.prisma.class.update({
      where: { id },
      data: {
        ...(updateClassDto.name && { name: updateClassDto.name.trim() }),
        ...(updateClassDto.grade && { grade: updateClassDto.grade.trim() }),
        ...(updateClassDto.section && { section: updateClassDto.section.trim() }),
        ...(updateClassDto.capacity !== undefined && { capacity: updateClassDto.capacity }),
        ...(updateClassDto.academicYear && { academicYear: updateClassDto.academicYear }),
        ...(updateClassDto.teacherId !== undefined && { teacherId: updateClassDto.teacherId }),
        ...(updateClassDto.isActive !== undefined && { isActive: updateClassDto.isActive }),
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            lga: { select: { id: true, name: true } },
          },
        },
      },
    });

    this.dataCacheService.invalidatePrefix('admin:classes');
    this.dataCacheService.invalidatePrefix('admin:schools');
    this.dataCacheService.invalidatePrefix('admin:dashboard');

    return ResponseHelper.success('Class updated successfully', updated);
  }

  /**
   * Delete (soft-delete) a class
   */
  async deleteClass(id: string) {
    this.logger.log(colors.cyan(`Deactivating class ID: ${id}`));

    const existingClass = await this.prisma.class.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: { where: { isActive: true } } },
        },
      },
    });

    if (!existingClass) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    if (existingClass._count.students > 0) {
      throw new BadRequestException(
        `Cannot delete class "${existingClass.name}" because it currently has ${existingClass._count.students} active student(s) enrolled`,
      );
    }

    await this.prisma.class.update({
      where: { id },
      data: { isActive: false },
    });

    this.dataCacheService.invalidatePrefix('admin:classes');
    this.dataCacheService.invalidatePrefix('admin:schools');
    this.dataCacheService.invalidatePrefix('admin:dashboard');

    return ResponseHelper.success('Class deleted successfully', null);
  }

  /**
   * Get students belonging to a class
   */
  async getClassStudents(id: string) {
    if (id.startsWith('class-level-')) {
      const rawGrade = id.replace('class-level-', '').replace(/-/g, ' ');
      const normGrade = normalizeGrade(rawGrade);

      const classes = await this.prisma.class.findMany({
        where: {
          isActive: true,
          OR: [
            { grade: { equals: normGrade, mode: 'insensitive' } },
            { name: { equals: normGrade, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          school: {
            select: {
              id: true,
              name: true,
              lga: { select: { name: true } },
            },
          },
          students: {
            where: { isActive: true },
            select: {
              id: true,
              studentId: true,
              firstName: true,
              lastName: true,
              gender: true,
              dateOfBirth: true,
            },
            take: 100,
          },
        },
      });

      const studentsList: any[] = [];
      const schoolsMap = new Map<string, any>();

      for (const c of classes) {
        if (c.school) {
          const prev = schoolsMap.get(c.school.id) || {
            id: c.school.id,
            name: c.school.name,
            lgaName: c.school.lga?.name || 'N/A',
            studentCount: 0,
          };
          prev.studentCount += c.students.length;
          schoolsMap.set(c.school.id, prev);
        }

        for (const st of c.students) {
          studentsList.push({
            ...st,
            schoolName: c.school?.name || 'Abia School',
            lgaName: c.school?.lga?.name || 'N/A',
          });
        }
      }

      return ResponseHelper.success('Class students retrieved successfully', {
        classId: id,
        className: normGrade,
        grade: normGrade,
        schools: Array.from(schoolsMap.values()),
        totalStudents: studentsList.length,
        students: studentsList,
      });
    }

    const cls = await this.prisma.class.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        grade: true,
        section: true,
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        students: {
          where: { isActive: true },
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
            gender: true,
            dateOfBirth: true,
            createdAt: true,
          },
          orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        },
      },
    });

    if (!cls) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    return ResponseHelper.success(
      'Class students retrieved successfully',
      {
        classId: cls.id,
        className: cls.name,
        grade: cls.grade,
        section: cls.section,
        school: cls.school,
        totalStudents: cls.students.length,
        students: cls.students,
      },
    );
  }
}