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