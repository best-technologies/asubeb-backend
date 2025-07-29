import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ResponseHelper } from '../../../common/helpers/response.helper';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllStudents(page: number = 1, limit: number = 10, schoolId?: string) {
    const skip = (page - 1) * limit;
    
    const where = {
      isActive: true,
      ...(schoolId && { schoolId }),
    };

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
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
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return ResponseHelper.success(
      'Students retrieved successfully',
      students,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    );
  }

  async getStudentById(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
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
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return ResponseHelper.success('Student retrieved successfully', student);
  }

  async createStudent(createStudentDto: any) {
    const student = await this.prisma.student.create({
      data: createStudentDto,
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
      },
    });

    // Update school student count
    await this.updateSchoolStudentCount(student.schoolId);

    return ResponseHelper.created('Student created successfully', student);
  }

  async updateStudent(id: string, updateStudentDto: any) {
    const existingStudent = await this.prisma.student.findUnique({
      where: { id },
      select: { schoolId: true },
    });

    if (!existingStudent) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    const student = await this.prisma.student.update({
      where: { id },
      data: updateStudentDto,
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
      },
    });

    // Update school student count if school changed
    if (updateStudentDto.schoolId && updateStudentDto.schoolId !== existingStudent.schoolId) {
      await Promise.all([
        this.updateSchoolStudentCount(existingStudent.schoolId),
        this.updateSchoolStudentCount(updateStudentDto.schoolId),
      ]);
    } else {
      await this.updateSchoolStudentCount(student.schoolId);
    }

    return ResponseHelper.success('Student updated successfully', student);
  }

  async deleteStudent(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      select: { schoolId: true },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    await this.prisma.student.update({
      where: { id },
      data: { isActive: false },
    });

    // Update school student count
    await this.updateSchoolStudentCount(student.schoolId);

    return ResponseHelper.success('Student deleted successfully');
  }

  async getStudentAcademicRecord(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
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
          include: {
            subject: true,
            term: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return ResponseHelper.success('Academic record retrieved successfully', student);
  }

  async getStudentAssessmentBreakdown(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
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
          select: {
            id: true,
            score: true,
            maxScore: true,
            percentage: true,
            type: true,
            title: true,
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            term: {
              select: {
                id: true,
                name: true,
                session: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            subject: {
              name: 'asc',
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // Calculate total score
    const totalScore = student.assessments.reduce((sum, assessment) => sum + assessment.score, 0);
    const totalMaxScore = student.assessments.reduce((sum, assessment) => sum + assessment.maxScore, 0);
    const averageScore = student.assessments.length > 0 ? totalScore / student.assessments.length : 0;

    const breakdown = {
      student: {
        id: student.id,
        studentId: student.studentId,
        name: `${student.firstName} ${student.lastName}`,
        gender: student.gender,
        school: student.school?.name,
        class: student.class?.name,
      },
      assessments: student.assessments,
      summary: {
        totalAssessments: student.assessments.length,
        totalScore,
        totalMaxScore,
        averageScore: Math.round(averageScore * 100) / 100,
        percentage: totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100 * 100) / 100 : 0,
      },
    };

    return ResponseHelper.success('Assessment breakdown retrieved successfully', breakdown);
  }

  private async updateSchoolStudentCount(schoolId: string): Promise<void> {
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
} 