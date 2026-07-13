import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogService } from '../../admin/audit-log/audit-log.service';
import { UploadResultsDto } from '../../grading/dto/upload-results.dto';

@Injectable()
export class SchoolItResultService {
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

  async getSubjects(userId: string) {
    const profile = await this.getSchoolItProfile(userId);
    return this.prisma.subject.findMany({
      where: { stateId: profile.stateId, level: profile.school.level },
      orderBy: { name: 'asc' },
    });
  }

  async getResults(userId: string, classId?: string, page: number = 1, limit: number = 20) {
    const profile = await this.getSchoolItProfile(userId);
    const skip = (page - 1) * limit;

    const where: any = {
      schoolId: profile.schoolId,
    };
    if (classId) where.classId = classId;

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          class: true,
          assessments: {
            where: { type: 'EXAM' },
            include: { subject: true },
          },
        },
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

  async getStudentResults(userId: string, studentId: string) {
    const profile = await this.getSchoolItProfile(userId);
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, schoolId: profile.schoolId },
      include: {
        class: true,
        assessments: {
          where: { type: 'EXAM' },
          include: { subject: true },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found or does not belong to your school');
    }

    return student;
  }

  async uploadResultsAtomic(userId: string, stateId: string, data: UploadResultsDto) {
    const profile = await this.getSchoolItProfile(userId);

    // Ensure they only upload results for their assigned school
    if (data.schoolId !== profile.schoolId) {
      throw new BadRequestException('You can only upload results for your assigned school.');
    }

    // Atomic transaction: if any part fails, the whole transaction rolls back
    try {
      await this.prisma.$transaction(async (tx) => {
        for (const studentData of data.students) {
          // Verify student belongs to this school
          const student = await tx.student.findFirst({
            where: { id: studentData.studentId, schoolId: profile.schoolId },
          });

          if (!student) {
            throw new Error(`Student ${studentData.studentId} not found in your school`);
          }

          for (const subjectScore of studentData.subjects) {
            // Find existing assessment
            const existing = await tx.assessment.findUnique({
              where: {
                studentId_subjectId_classId_termId_type_title: {
                  studentId: student.id,
                  subjectId: subjectScore.subjectId,
                  classId: data.classId,
                  termId: data.termId,
                  type: 'EXAM',
                  title: 'Final Exam',
                },
              },
            });

            if (existing && existing.status === 'APPROVED') {
              throw new Error(`Cannot modify APPROVED result for student ${student.firstName} ${student.lastName} (Subject ID: ${subjectScore.subjectId})`);
            }

            if (existing) {
              await tx.assessment.update({
                where: { id: existing.id },
                data: {
                  score: subjectScore.score,
                  percentage: subjectScore.score,
                  status: 'AWAITING_APPROVAL', // Reset status on edit
                  isSubmitted: true,
                },
              });
            } else {
              await tx.assessment.create({
                data: {
                  studentId: student.id,
                  subjectId: subjectScore.subjectId,
                  classId: data.classId,
                  termId: data.termId,
                  type: 'EXAM',
                  title: 'Final Exam',
                  maxScore: 100,
                  score: subjectScore.score,
                  percentage: subjectScore.score,
                  dateGiven: new Date(),
                  isSubmitted: true,
                  status: 'AWAITING_APPROVAL',
                },
              });
            }
          }
        }
      });

      // If transaction succeeds, log it
      await this.auditLogService.createLog(userId, 'UPLOADED_RESULTS', {
        schoolId: data.schoolId,
        classId: data.classId,
        termId: data.termId,
        totalStudents: data.students.length,
      });

      return { success: true, message: `Successfully uploaded results for ${data.students.length} student(s).` };
    } catch (error) {
      throw new BadRequestException(`Bulk upload failed. No results were saved. Error: ${error.message}`);
    }
  }
}
