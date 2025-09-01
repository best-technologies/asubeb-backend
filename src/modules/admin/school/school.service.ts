import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSchoolDto } from './dto';
import { ResponseHelper } from '../../../common/helpers';
import * as colors from 'colors';

@Injectable()
export class SchoolService {
  private readonly logger = new Logger(SchoolService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createSchool(createSchoolDto: CreateSchoolDto) {
    this.logger.log(colors.magenta('Creating new school...'));

    // Check if LGA exists
    const lga = await this.prisma.localGovernmentArea.findUnique({
      where: { id: createSchoolDto.lgaId },
    });

    if (!lga) {
      throw new NotFoundException('Local Government Area not found');
    }

    // Check if school with the same name already exists
    const existingSchool = await this.prisma.school.findFirst({
      where: {
        name: createSchoolDto.name,
      },
    });

    if (existingSchool) {
      throw new ConflictException('School with this name already exists');
    }

    // Generate unique code for school
    const code = await this.generateUniqueCode(createSchoolDto.name);

    // Create new school
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
        isActive: true, // Automatically set to true
      },
      include: {
        lga: true, // Include LGA details
      },
    });

    this.logger.log(colors.america('School created successfully'));
    return ResponseHelper.created(
      'School created successfully',
      school
    );
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

  async getAllSchools(page: number = 1, limit: number = 10) {
    this.logger.log(colors.cyan(`Fetching schools with pagination - page: ${page}, limit: ${limit}`));

    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await this.prisma.school.count({
      where: { isActive: true },
    });

    const schools = await this.prisma.school.findMany({
      where: { isActive: true },
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
        totalStudents: true,
        totalTeachers: true,
        capacity: true,
        lga: {
          select: {
            id: true,
            name: true,
            code: true,
            state: true,
          },
        },
        _count: {
          select: {
            classes: {
              where: { isActive: true },
            },
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
        name: 'asc',
      },
    });

    const schoolsWithCounts = schools.map(school => ({
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
      totalStudents: school.totalStudents,
      totalTeachers: school.totalTeachers,
      capacity: school.capacity,
      lga: school.lga,
      totalClasses: school._count.classes,
      actualStudentCount: school._count.students,
      actualTeacherCount: school._count.teachers,
    }));

    this.logger.log(colors.green(`Retrieved ${schoolsWithCounts.length} schools (page ${page} of ${Math.ceil(total / limit)})`));
          return ResponseHelper.success(
        'Schools retrieved successfully',
        {
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1,
            nextPage: page < Math.ceil(total / limit) ? page + 1 : null,
            previousPage: page > 1 ? page - 1 : null,
            startIndex: (page - 1) * limit + 1,
            endIndex: Math.min(page * limit, total),
          },
          data: schoolsWithCounts,
        }
      );
  }

  async getAllClasses(page: number = 1, limit: number = 10) {
    this.logger.log(colors.cyan(`Fetching classes with pagination - page: ${page}, limit: ${limit}`));

    const skip = (page - 1) * limit;

    // Get total count for pagination
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
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            teacherId: true,
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
    });

    const classesWithDetails = classes.map(cls => ({
      id: cls.id,
      name: cls.name,
      grade: cls.grade,
      section: cls.section,
      capacity: cls.capacity,
      currentEnrollment: cls.currentEnrollment,
      actualEnrollment: cls._count.students,
      academicYear: cls.academicYear,
      school: cls.school,
      teacher: cls.teacher ? {
        id: cls.teacher.id,
        name: `${cls.teacher.firstName} ${cls.teacher.lastName}`,
        teacherId: cls.teacher.teacherId,
        email: cls.teacher.email,
      } : null,
      enrollmentPercentage: cls.capacity > 0 ? Math.round((cls._count.students / cls.capacity) * 100) : 0,
    }));

    this.logger.log(colors.green(`Retrieved ${classesWithDetails.length} classes (page ${page} of ${Math.ceil(total / limit)})`));
    return ResponseHelper.success(
      'Classes retrieved successfully',
      {
        data: classesWithDetails,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1,
          nextPage: page < Math.ceil(total / limit) ? page + 1 : null,
          previousPage: page > 1 ? page - 1 : null,
          startIndex: (page - 1) * limit + 1,
          endIndex: Math.min(page * limit, total),
        },
      }
    );
  }

  /**
   * Generate unique code for school
   * Format: First 3 letters of name + 3 random digits
   */
  private async generateUniqueCode(name: string): Promise<string> {
    const firstThreeLetters = name.substring(0, 3).toUpperCase();
    let code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const randomDigits = Math.floor(Math.random() * 900) + 100; // 100-999
      code = `${firstThreeLetters}${randomDigits}`;
      
      // Check if code already exists
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