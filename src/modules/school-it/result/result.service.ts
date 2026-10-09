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
      const isSingleStudent = data.students.length === 1;
      let savedStudentsCount = 0;
      let skippedSuspendedCount = 0;
      let totalResultsCount = 0;

      await this.prisma.$transaction(async (tx) => {
        for (const studentData of data.students) {
          // Verify student belongs to this school
          const student = await tx.student.findFirst({
            where: { id: studentData.studentId, schoolId: profile.schoolId },
          });

          if (!student) {
            throw new Error(`Student ${studentData.studentId} not found in your school`);
          }

          if (!student.isActive) {
            if (isSingleStudent) {
              throw new BadRequestException(
                `Cannot upload results: Student "${student.firstName} ${student.lastName}" is currently suspended. Please unsuspend the student in the Student Directory first.`
              );
            } else {
              // In bulk upload, skip suspended student without rolling back other students
              skippedSuspendedCount++;
              continue;
            }
          }

          savedStudentsCount++;
          if (studentData.subjects && Array.isArray(studentData.subjects)) {
            totalResultsCount += studentData.subjects.length;
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
      if (savedStudentsCount > 0) {
        const countToLog = totalResultsCount > 0 ? totalResultsCount : savedStudentsCount;
        await this.auditLogService.createLog(userId, 'UPLOADED_RESULTS', {
          schoolId: data.schoolId,
          classId: data.classId,
          termId: data.termId,
          totalStudents: savedStudentsCount,
          totalResults: countToLog,
          count: countToLog,
          skippedSuspended: skippedSuspendedCount,
        });
      }

      let message = `Successfully uploaded results for ${savedStudentsCount} student(s).`;
      if (skippedSuspendedCount > 0) {
        if (savedStudentsCount === 0) {
          message = `All ${skippedSuspendedCount} student(s) in this batch are suspended and were skipped. No results were saved.`;
        } else {
          message = `Successfully uploaded results for ${savedStudentsCount} student(s). ${skippedSuspendedCount} suspended student(s) were skipped and not saved.`;
        }
      }

      return {
        success: true,
        message,
        savedCount: savedStudentsCount,
        skippedCount: skippedSuspendedCount,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async checkSubmission(
    userId: string,
    stateId: string,
    dto?: { classIds?: string[]; studentId?: string },
  ) {
    const profile = await this.getSchoolItProfile(userId);

    const activeTerm = await this.prisma.term.findFirst({
      where: { isCurrent: true, stateId },
    });

    if (!activeTerm) {
      throw new BadRequestException('No active term found.');
    }

    // Fetch all active subjects for this school's level
    const activeSubjects = await this.prisma.subject.findMany({
      where: { stateId, level: profile.school.level, isActive: true },
      orderBy: { name: 'asc' },
    });
    const expectedSubjectCount = activeSubjects.length;

    const blockers: Array<{
      studentId: string;
      studentCode: string;
      studentName: string;
      className: string;
      uploadedSubjects: number;
      expectedSubjects: number;
      missingSubjects: string[];
      message: string;
    }> = [];

    const warnings: Array<{
      classId?: string;
      className?: string;
      totalEnrolled?: number;
      readyCount?: number;
      approvedCount?: number;
      unuploadedCount?: number;
      message: string;
    }> = [];

    const classesSummary: Array<{
      classId: string;
      className: string;
      totalEnrolled: number;
      readyCount: number;
      approvedCount: number;
      noResultsCount: number;
      incompleteStudentsCount: number;
    }> = [];

    let totalReadyStudents = 0;

    // Single student check
    if (dto?.studentId) {
      const student = await this.prisma.student.findFirst({
        where: { id: dto.studentId, schoolId: profile.schoolId },
        include: {
          class: true,
          assessments: {
            where: { termId: activeTerm.id, type: 'EXAM' },
            include: { subject: true },
          },
        },
      });

      if (!student) {
        throw new NotFoundException('Student not found in your school.');
      }

      if (!student.isActive) {
        return {
          canSubmit: false,
          blockers: [
            {
              studentId: student.id,
              studentCode: student.studentId,
              studentName: `${student.firstName} ${student.lastName}`,
              className: student.class?.name || 'Class',
              uploadedSubjects: 0,
              expectedSubjects: expectedSubjectCount,
              missingSubjects: [],
              message: `Student "${student.firstName} ${student.lastName}" (${student.studentId}) is currently suspended. Please unsuspend the student in the Student Directory before submitting results.`,
            },
          ],
          warnings: [],
          classesSummary: [],
          totalReadyStudents: 0,
          expectedSubjectCount,
        };
      }

      const assessments = student.assessments || [];
      const isAlreadyApproved = assessments.length > 0 && assessments.every((a) => a.status === 'APPROVED');

      if (isAlreadyApproved) {
        return {
          canSubmit: false,
          blockers: [
            {
              studentId: student.id,
              studentCode: student.studentId,
              studentName: `${student.firstName} ${student.lastName}`,
              className: student.class?.name || 'Class',
              uploadedSubjects: assessments.length,
              expectedSubjects: expectedSubjectCount,
              missingSubjects: [],
              message: `Results for "${student.firstName} ${student.lastName}" are already approved and closed for this term.`,
            },
          ],
          warnings: [],
          classesSummary: [],
          totalReadyStudents: 0,
          expectedSubjectCount,
        };
      }

      if (assessments.length === 0) {
        return {
          canSubmit: false,
          blockers: [
            {
              studentId: student.id,
              studentCode: student.studentId,
              studentName: `${student.firstName} ${student.lastName}`,
              className: student.class?.name || 'Class',
              uploadedSubjects: 0,
              expectedSubjects: expectedSubjectCount,
              missingSubjects: activeSubjects.map((s) => s.name),
              message: `No results have been uploaded for "${student.firstName} ${student.lastName}" yet.`,
            },
          ],
          warnings: [],
          classesSummary: [],
          totalReadyStudents: 0,
          expectedSubjectCount,
        };
      }

      // Check if student has missing subjects
      if (assessments.length < expectedSubjectCount) {
        const gradedSubjectIds = new Set(assessments.map((a) => a.subjectId));
        const missing = activeSubjects.filter((s) => !gradedSubjectIds.has(s.id)).map((s) => s.name);

        return {
          canSubmit: false,
          blockers: [
            {
              studentId: student.id,
              studentCode: student.studentId,
              studentName: `${student.firstName} ${student.lastName}`,
              className: student.class?.name || 'Class',
              uploadedSubjects: assessments.length,
              expectedSubjects: expectedSubjectCount,
              missingSubjects: missing,
              message: `Student "${student.firstName} ${student.lastName}" (${student.studentId}) only has ${assessments.length} of ${expectedSubjectCount} subject scores. Missing: ${missing.join(', ')}.`,
            },
          ],
          warnings: [],
          classesSummary: [],
          totalReadyStudents: 0,
          expectedSubjectCount,
        };
      }

      return {
        canSubmit: true,
        blockers: [],
        warnings: [],
        classesSummary: [],
        totalReadyStudents: 1,
        expectedSubjectCount,
      };
    }

    // Classes-based check
    let targetClassIds = dto?.classIds;
    if (!targetClassIds || targetClassIds.length === 0) {
      const allSchoolClasses = await this.prisma.class.findMany({
        where: { schoolId: profile.schoolId },
        select: { id: true },
      });
      targetClassIds = allSchoolClasses.map((c) => c.id);
    }

    for (const classId of targetClassIds) {
      const classObj = await this.prisma.class.findUnique({
        where: { id: classId },
      });
      if (!classObj) continue;

      const students = await this.prisma.student.findMany({
        where: { schoolId: profile.schoolId, classId, isActive: true },
        include: {
          assessments: {
            where: { termId: activeTerm.id, type: 'EXAM' },
            include: { subject: true },
          },
        },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      });

      let readyCount = 0;
      let approvedCount = 0;
      let noResultsCount = 0;
      let classBlockersCount = 0;

      for (const student of students) {
        const assessments = student.assessments || [];
        if (assessments.length === 0) {
          noResultsCount++;
          continue;
        }

        const isApproved = assessments.every((a) => a.status === 'APPROVED');
        if (isApproved) {
          approvedCount++;
          continue;
        }

        // Student has assessments that need submission (PENDING_SUBMISSION or REJECTED)
        if (assessments.length < expectedSubjectCount) {
          classBlockersCount++;
          const gradedSubjectIds = new Set(assessments.map((a) => a.subjectId));
          const missing = activeSubjects.filter((s) => !gradedSubjectIds.has(s.id)).map((s) => s.name);

          blockers.push({
            studentId: student.id,
            studentCode: student.studentId,
            studentName: `${student.firstName} ${student.lastName}`,
            className: classObj.name,
            uploadedSubjects: assessments.length,
            expectedSubjects: expectedSubjectCount,
            missingSubjects: missing,
            message: `Student "${student.firstName} ${student.lastName}" (${student.studentId}) in ${classObj.name} only has ${assessments.length} of ${expectedSubjectCount} subject scores recorded. Missing: ${missing.join(', ')}.`,
          });
        } else {
          readyCount++;
          totalReadyStudents++;
        }
      }

      // Class-level warnings (non-blocking)
      if (students.length > 0) {
        const unuploadedCount = students.length - (readyCount + approvedCount + classBlockersCount);
        if (unuploadedCount > 0 && readyCount > 0) {
          warnings.push({
            classId,
            className: classObj.name,
            totalEnrolled: students.length,
            readyCount,
            approvedCount,
            unuploadedCount,
            message: `Class "${classObj.name}" has ${students.length} enrolled student(s), but results for only ${readyCount} student(s) will be submitted (${unuploadedCount} student(s) have no results uploaded yet).`,
          });
        } else if (readyCount === 0 && approvedCount === students.length) {
          warnings.push({
            classId,
            className: classObj.name,
            totalEnrolled: students.length,
            readyCount: 0,
            approvedCount,
            unuploadedCount: 0,
            message: `All ${students.length} student(s) in "${classObj.name}" have already been approved and closed for this term.`,
          });
        } else if (readyCount === 0 && approvedCount === 0 && classBlockersCount === 0) {
          warnings.push({
            classId,
            className: classObj.name,
            totalEnrolled: students.length,
            readyCount: 0,
            approvedCount,
            unuploadedCount: students.length,
            message: `No results have been uploaded for "${classObj.name}" yet.`,
          });
        }
      }

      classesSummary.push({
        classId,
        className: classObj.name,
        totalEnrolled: students.length,
        readyCount,
        approvedCount,
        noResultsCount,
        incompleteStudentsCount: classBlockersCount,
      });
    }

    const canSubmit = blockers.length === 0 && totalReadyStudents > 0;

    return {
      canSubmit,
      blockers,
      warnings,
      classesSummary,
      totalReadyStudents,
      expectedSubjectCount,
    };
  }

  async checkMissingResults(userId: string, stateId: string) {
    const check = await this.checkSubmission(userId, stateId);
    return {
      hasMissing: check.warnings.length > 0 || check.blockers.length > 0,
      missingCount: check.blockers.length,
      message:
        check.blockers.length > 0
          ? `${check.blockers.length} student(s) have incomplete subject scores.`
          : check.warnings.length > 0
          ? check.warnings[0].message
          : 'All students have complete results.',
    };
  }

  async submitResultsForApproval(
    userId: string,
    stateId: string,
    dto?: { classIds?: string[]; studentId?: string },
  ) {
    const profile = await this.getSchoolItProfile(userId);

    const activeTerm = await this.prisma.term.findFirst({
      where: { isCurrent: true, stateId },
    });

    if (!activeTerm) {
      throw new BadRequestException('No active term found.');
    }

    // Run strict pre-submission validation
    const check = await this.checkSubmission(userId, stateId, dto);

    if (!check.canSubmit) {
      if (check.blockers.length > 0) {
        throw new BadRequestException(
          `Cannot submit for approval: ${check.blockers[0].message}`
        );
      }
      if (check.totalReadyStudents === 0) {
        throw new BadRequestException('No eligible results found ready for submission.');
      }
    }

    // Submit single student
    if (dto?.studentId) {
      const student = await this.prisma.student.findFirst({
        where: { id: dto.studentId, schoolId: profile.schoolId },
      });
      if (!student) {
        throw new NotFoundException('Student not found in your school.');
      }
      if (!student.isActive) {
        throw new BadRequestException(
          `Cannot submit results: Student "${student.firstName} ${student.lastName}" is currently suspended. Please unsuspend the student first.`
        );
      }

      const updateResult = await this.prisma.assessment.updateMany({
        where: {
          studentId: dto.studentId,
          student: { schoolId: profile.schoolId, isActive: true },
          termId: activeTerm.id,
          status: { in: ['PENDING_SUBMISSION', 'REJECTED'] },
        },
        data: {
          status: 'AWAITING_APPROVAL',
        },
      });

      await this.auditLogService.createLog(userId, 'SUBMITTED_RESULTS', {
        schoolId: profile.schoolId,
        studentId: dto.studentId,
        count: updateResult.count,
        termId: activeTerm.id,
      });

      return {
        success: true,
        message: `Successfully submitted results for student for approval.`,
        count: updateResult.count,
      };
    }

    // Submit selected class(es)
    const classFilter =
      dto?.classIds && dto.classIds.length > 0
        ? { classId: { in: dto.classIds } }
        : {};

    const updateResult = await this.prisma.assessment.updateMany({
      where: {
        student: {
          schoolId: profile.schoolId,
          isActive: true,
          ...classFilter,
        },
        termId: activeTerm.id,
        status: { in: ['PENDING_SUBMISSION', 'REJECTED'] },
      },
      data: {
        status: 'AWAITING_APPROVAL',
      },
    });

    await this.auditLogService.createLog(userId, 'SUBMITTED_RESULTS', {
      schoolId: profile.schoolId,
      classIds: dto?.classIds,
      count: updateResult.count,
      termId: activeTerm.id,
    });

    return {
      success: true,
      message: `Successfully submitted results for ${check.totalReadyStudents} student(s) for approval.`,
      count: updateResult.count,
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
      select: { id: true, studentId: true, firstName: true, lastName: true, isActive: true },
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

      const isSuspended = matchedStudent ? matchedStudent.isActive === false : false;

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

      if (!isSuspended && rowErrors.length > 0) {
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
        isSuspended,
        suspendedReason: isSuspended
          ? 'Student is currently suspended. This result will be skipped and not saved to awaiting approval.'
          : undefined,
        isValid: isSuspended ? true : rowErrors.length === 0,
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
          valid: previewRows.filter((r) => r.isValid && !r.isSuspended).length,
          invalid: previewRows.filter((r) => !r.isValid && !r.isSuspended).length,
          suspended: previewRows.filter((r) => r.isSuspended).length,
        },
        hasErrors,
      },
    };
  }
}
