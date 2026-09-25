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
      whereConditions.academicYear = academicYear;
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
      whereConditions.academicYear = session;
    }

    // Raw query for fast, accurate aggregations across classes
    const classes = await this.prisma.class.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        grade: true,
        section: true,
        capacity: true,
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
    let totalCapacity = 0;
    let totalEnrolled = 0;
    let overcrowdedCount = 0;
    let balancedCount = 0;
    let underEnrolledCount = 0;

    // Grade map
    const gradeMap = new Map<
      string,
      { grade: string; classCount: number; studentCount: number; capacity: number }
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
      const capacity = cls.capacity || 35;

      totalCapacity += capacity;
      totalEnrolled += studentCount;

      if (studentCount > capacity) {
        overcrowdedCount++;
      } else if (studentCount >= capacity * 0.7) {
        balancedCount++;
      } else {
        underEnrolledCount++;
      }

      // Grade breakdown
      const grade = cls.grade || 'Unassigned';
      const existingGrade = gradeMap.get(grade) || {
        grade,
        classCount: 0,
        studentCount: 0,
        capacity: 0,
      };
      existingGrade.classCount += 1;
      existingGrade.studentCount += studentCount;
      existingGrade.capacity += capacity;
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
    const capacityUtilization =
      totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 1000) / 10 : 0;

    // Format grade array
    const byGrade = Array.from(gradeMap.values())
      .map((g) => ({
        grade: g.grade,
        classCount: g.classCount,
        studentCount: g.studentCount,
        averageSize:
          g.classCount > 0 ? Math.round((g.studentCount / g.classCount) * 10) / 10 : 0,
        utilization:
          g.capacity > 0 ? Math.round((g.studentCount / g.capacity) * 100) : 0,
      }))
      .sort((a, b) => a.grade.localeCompare(b.grade));

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

    const analyticsData = {
      summary: {
        totalClasses,
        totalEnrolledStudents: totalEnrolled,
        averageClassSize,
        totalCapacity,
        capacityUtilization,
        overcrowdedClasses: overcrowdedCount,
        balancedClasses: balancedCount,
        underEnrolledClasses: underEnrolledCount,
      },
      byGrade,
      byLga,
      topSchools,
      utilizationBands: [
        { name: 'Optimal (70-100%)', count: balancedCount, percentage: totalClasses ? Math.round((balancedCount / totalClasses) * 100) : 0 },
        { name: 'Overcrowded (>100%)', count: overcrowdedCount, percentage: totalClasses ? Math.round((overcrowdedCount / totalClasses) * 100) : 0 },
        { name: 'Under Capacity (<70%)', count: underEnrolledCount, percentage: totalClasses ? Math.round((underEnrolledCount / totalClasses) * 100) : 0 },
      ],
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
      colors.cyan(`Creating class: ${createClassDto.name} for school ${createClassDto.schoolId}`),
    );

    // 1. Verify school exists
    const school = await this.prisma.school.findUnique({
      where: { id: createClassDto.schoolId },
      select: { id: true, name: true },
    });

    if (!school) {
      throw new NotFoundException(`School with ID ${createClassDto.schoolId} not found`);
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
        schoolId: createClassDto.schoolId,
        name: {
          equals: createClassDto.name.trim(),
          mode: 'insensitive',
        },
        academicYear,
        isActive: true,
      },
    });

    if (existing) {
      throw new ConflictException(
        `A class named "${createClassDto.name}" already exists in ${school.name} for the ${academicYear} academic year`,
      );
    }

    // 4. Create class
    const newClass = await this.prisma.class.create({
      data: {
        name: createClassDto.name.trim(),
        grade: createClassDto.grade.trim(),
        section: createClassDto.section?.trim() || 'A',
        schoolId: createClassDto.schoolId,
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