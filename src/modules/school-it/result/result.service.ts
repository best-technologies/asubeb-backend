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

  async getResults(
    userId: string,
    classId?: string,
    status?: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
  ) {
    const profile = await this.getSchoolItProfile(userId);
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      schoolId: profile.schoolId,
    };

    if (search && search.trim()) {
      const q = search.trim();
      const terms = q.split(/\s+/).filter(Boolean);
      if (terms.length > 1) {
        where.AND = terms.map((term) => ({
          OR: [
            { firstName: { contains: term, mode: 'insensitive' } },
            { lastName: { contains: term, mode: 'insensitive' } },
            { studentId: { contains: term, mode: 'insensitive' } },
          ],
        }));
      } else {
        where.OR = [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { studentId: { contains: q, mode: 'insensitive' } },
        ];
      }
    }

    if (classId && classId !== 'ALL') {
      where.classId = classId;
    }

    const normalizedStatus = status?.toUpperCase();
    if (normalizedStatus === 'GRADED') {
      where.assessments = { some: { type: 'EXAM' } };
    } else if (normalizedStatus === 'UNGRADED') {
      where.assessments = { none: { type: 'EXAM' } };
    }

    const scopeWhere: any = {
      schoolId: profile.schoolId,
      ...(classId && classId !== 'ALL' ? { classId } : {}),
      ...(search && search.trim() ? (where.AND ? { AND: where.AND } : { OR: where.OR }) : {}),
    };

    const [students, total, allCount, gradedCount, ungradedCount] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [
          { firstName: 'asc' },
          { lastName: 'asc' },
        ],
        include: {
          class: true,
          assessments: {
            where: { type: 'EXAM' },
            include: { subject: true },
          },
        },
      }),
      this.prisma.student.count({ where }),
      this.prisma.student.count({ where: scopeWhere }),
      this.prisma.student.count({
        where: {
          ...scopeWhere,
          assessments: { some: { type: 'EXAM' } },
        },
      }),
      this.prisma.student.count({
        where: {
          ...scopeWhere,
          assessments: { none: { type: 'EXAM' } },
        },
      }),
    ]);

    return {
      data: students,
      counts: {
        all: allCount,
        graded: gradedCount,
        ungraded: ungradedCount,
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
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

    // Fetch active session and term to enforce data integrity
    const activeTerm = await this.prisma.term.findFirst({
      where: { isCurrent: true, stateId },
      include: { session: true }
    });

    if (!activeTerm) {
      throw new BadRequestException('No active academic term found for grading.');
    }

    const currentTermId = activeTerm.id;
    // We ignore data.termId and data.sessionId and force use of current active terms

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
                  termId: currentTermId,
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
                  status: 'PENDING_SUBMISSION', // Reset status on edit
                  isSubmitted: true,
                },
              });
            } else {
              await tx.assessment.create({
                data: {
                  studentId: student.id,
                  subjectId: subjectScore.subjectId,
                  classId: data.classId,
                  termId: currentTermId,
                  type: 'EXAM',
                  title: 'Final Exam',
                  maxScore: 100,
                  score: subjectScore.score,
                  percentage: subjectScore.score,
                  dateGiven: new Date(),
                  isSubmitted: true,
                  status: 'PENDING_SUBMISSION',
                },
              });
            }
          }
        }
      });

      // If transaction succeeds, log total uploaded assessment results
      let totalResultsCount = 0;
      for (const studentData of data.students) {
        if (studentData.subjects && Array.isArray(studentData.subjects)) {
          totalResultsCount += studentData.subjects.length;
        }
      }
      const countToLog = totalResultsCount > 0 ? totalResultsCount : data.students.length;

      await this.auditLogService.createLog(userId, 'UPLOADED_RESULTS', {
        schoolId: data.schoolId,
        classId: data.classId,
        termId: data.termId,
        totalStudents: data.students.length,
        totalResults: countToLog,
        count: countToLog,
      });

      return { success: true, message: `Successfully uploaded results for ${data.students.length} student(s).` };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async checkMissingResults(userId: string, stateId: string) {
    const profile = await this.getSchoolItProfile(userId);

    const activeTerm = await this.prisma.term.findFirst({
      where: { isCurrent: true, stateId },
    });

    if (!activeTerm) {
      throw new BadRequestException('No active term found.');
    }

    const students = await this.prisma.student.findMany({
      where: { schoolId: profile.schoolId },
      include: {
        assessments: {
          where: { termId: activeTerm.id, type: 'EXAM' }
        }
      }
    });

    const totalExpectedSubjects = profile.school.level === 'PRIMARY' ? 10 : 15;

    let missingCount = 0;
    for (const student of students) {
      if (student.assessments.length < totalExpectedSubjects) {
        missingCount++;
      }
    }

    return {
      hasMissing: missingCount > 0,
      missingCount,
      message: missingCount > 0 
        ? `${missingCount} student(s) have incomplete results for the current term.`
        : 'All students have complete results.'
    };
  }

  async submitResultsForApproval(userId: string, stateId: string) {
    const profile = await this.getSchoolItProfile(userId);

    const activeTerm = await this.prisma.term.findFirst({
      where: { isCurrent: true, stateId },
    });

    if (!activeTerm) {
      throw new BadRequestException('No active term found.');
    }

    const updateResult = await this.prisma.assessment.updateMany({
      where: {
        student: { schoolId: profile.schoolId },
        termId: activeTerm.id,
        status: 'PENDING_SUBMISSION',
      },
      data: {
        status: 'AWAITING_APPROVAL',
      },
    });

    await this.auditLogService.createLog(userId, 'SUBMITTED_RESULTS', {
      schoolId: profile.schoolId,
      count: updateResult.count,
      termId: activeTerm.id,
    });

    return {
      success: true,
      message: `Successfully submitted ${updateResult.count} results for approval.`,
    };
  }

  async previewBulkResults(userId: string, classId: string, file: Express.Multer.File) {
    const profile = await this.getSchoolItProfile(userId);

    // 1. Fetch all subjects available for this school level
    const subjects = await this.prisma.subject.findMany({
      where: { stateId: profile.stateId, level: profile.school.level, isActive: true },
      orderBy: { name: 'asc' },
    });

    if (subjects.length === 0) {
      throw new BadRequestException('No active subjects found for this school level.');
    }

    // 2. Fetch all enrolled students in this class
    const students = await this.prisma.student.findMany({
      where: { schoolId: profile.schoolId, classId },
      select: { id: true, studentId: true, firstName: true, lastName: true },
    });

    if (students.length === 0) {
      throw new BadRequestException('No active students found in this class.');
    }

    // 3. Build dynamic schema for bulk-d
    const targetSchema: Record<string, any> = {
      studentId: {
        type: 'string',
        required: true,
        description: 'Student admission number, registration code, or student ID (e.g. STU699598749)',
      },
      studentName: {
        type: 'string',
        required: false,
        description: 'Student full name, surname, or first name',
      },
    };

    // Add each subject name to targetSchema
    for (const subj of subjects) {
      targetSchema[subj.name] = {
        type: 'number',
        required: false,
        description: `${subj.name} exam score between 0 and 100`,
      };
    }

    // 4. Run bulk-d
    const BulkD = require('bulk-d');
    const mapper = new BulkD({
      provider: 'google',
      apiKey: process.env.GEMINI_API_KEY,
      model: 'gemini-3.1-flash-lite',
      strictness: 'high',
    });

    const parseResult = await mapper.processFile({
      buffer: file.buffer,
      mimetype: file.mimetype,
      filename: file.originalname,
      schema: targetSchema,
    });

    // 5. Match students and format preview rows
    const studentByIdCode = new Map<string, typeof students[0]>();
    for (const s of students) {
      if (s.studentId) studentByIdCode.set(s.studentId.trim().toLowerCase(), s);
    }

    const previewRows: any[] = [];
    let hasErrors = false;

    for (let i = 0; i < parseResult.data.length; i++) {
      const rawData = parseResult.data[i];
      const rowErrors: string[] = [];
      const rawStudentId = (rawData.studentId ? String(rawData.studentId) : '').trim();

      const matchedStudent = studentByIdCode.get(rawStudentId.toLowerCase());

      if (!matchedStudent) {
        rowErrors.push(`Student ID "${rawStudentId}" is not enrolled in this class.`);
      }

      // Collect subject scores
      const subjectScores: Record<string, number | null> = {};
      for (const subj of subjects) {
        const val = rawData[subj.name];
        if (val !== undefined && val !== null && val !== '') {
          const numScore = Number(val);
          if (isNaN(numScore) || numScore < 0 || numScore > 100) {
            rowErrors.push(`${subj.name} score must be between 0 and 100 (got ${val}).`);
            subjectScores[subj.id] = null;
          } else {
            subjectScores[subj.id] = numScore;
          }
        } else {
          subjectScores[subj.id] = null;
        }
      }

      if (rowErrors.length > 0) {
        hasErrors = true;
      }

      previewRows.push({
        rowIndex: i + 1,
        studentDbId: matchedStudent?.id || null,
        studentId: matchedStudent?.studentId || rawStudentId,
        studentName: matchedStudent
          ? `${matchedStudent.firstName} ${matchedStudent.lastName}`
          : (rawData.studentName || 'Unknown'),
        scores: subjectScores,
        errors: rowErrors,
        isValid: rowErrors.length === 0,
      });
    }

    // Include parser errors if any
    for (const err of parseResult.errors) {
      hasErrors = true;
      previewRows.push({
        rowIndex: err.row,
        studentDbId: null,
        studentId: err.raw?.studentId || 'N/A',
        studentName: err.raw?.studentName || 'N/A',
        scores: {},
        errors: err.errors,
        isValid: false,
      });
    }

    return {
      success: true,
      data: {
        mapping: parseResult.mapping,
        unmapped: parseResult.unmapped,
        subjects: subjects.map((s) => ({ id: s.id, name: s.name, code: s.code })),
        rows: previewRows,
        stats: {
          total: previewRows.length,
          valid: previewRows.filter((r) => r.isValid).length,
          invalid: previewRows.filter((r) => !r.isValid).length,
        },
        hasErrors,
      },
    };
  }
}
