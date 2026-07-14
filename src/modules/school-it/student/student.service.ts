import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogService } from '../../admin/audit-log/audit-log.service';
import { CreateStudentDto } from '../../admin/student/dto/create-student.dto';

@Injectable()
export class SchoolItStudentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  private async getSchoolItProfile(userId: string) {
    const profile = await this.prisma.schoolIt.findUnique({
      where: { userId },
      include: { school: true },
    });
    if (!profile) {
      throw new NotFoundException('School-IT profile not found for user');
    }
    return profile;
  }

  async getStudents(userId: string, page: number = 1, limit: number = 20, search?: string) {
    const profile = await this.getSchoolItProfile(userId);
    const skip = (page - 1) * limit;

    const where: any = { schoolId: profile.schoolId };
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { class: true },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async enrolStudent(userId: string, stateId: string, data: CreateStudentDto) {
    const profile = await this.getSchoolItProfile(userId);
    
    // Ensure they only enrol to their own school
    if (data.schoolId && data.schoolId !== profile.schoolId) {
      throw new BadRequestException('You can only enrol students to your assigned school.');
    }

    const student = await this.prisma.student.create({
      data: {
        ...data,
        schoolId: profile.schoolId,
        stateId: stateId,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(),
        enrollmentDate: data.enrollmentDate ? new Date(data.enrollmentDate) : new Date(),
      },
    });

    // Log the action
    await this.auditLogService.createLog(userId, 'ENROLLED_STUDENT', {
      studentId: student.id,
      name: `${student.firstName} ${student.lastName}`,
    });

    return student;
  }

  async updateStudent(userId: string, studentId: string, data: Partial<CreateStudentDto>) {
    const profile = await this.getSchoolItProfile(userId);

    const existingStudent = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent || existingStudent.schoolId !== profile.schoolId) {
      throw new NotFoundException('Student not found in your school');
    }

    const updatedData: any = {};
    if (data.firstName !== undefined) updatedData.firstName = data.firstName;
    if (data.lastName !== undefined) updatedData.lastName = data.lastName;
    if (data.gender !== undefined) updatedData.gender = data.gender;
    if (data.classId !== undefined) updatedData.classId = data.classId;
    if (data.studentId !== undefined) updatedData.studentId = data.studentId;
    if (data.profilePicture !== undefined && !data.profilePicture.startsWith('blob:')) updatedData.profilePicture = data.profilePicture;
    if (data.dateOfBirth) updatedData.dateOfBirth = new Date(data.dateOfBirth);
    if (data.enrollmentDate) updatedData.enrollmentDate = new Date(data.enrollmentDate);

    const student = await this.prisma.student.update({
      where: { id: studentId },
      data: updatedData,
    });

    // Log the action
    await this.auditLogService.createLog(userId, 'UPDATED_STUDENT', {
      studentId: student.id,
      name: `${student.firstName} ${student.lastName}`,
      updates: data,
    });

    return student;
  }
}
