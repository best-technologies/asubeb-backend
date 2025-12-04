import { Injectable, NotFoundException, Logger, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ResponseHelper } from '../../common/helpers/response.helper';
import * as colors from 'colors';
import { AcademicContextService } from '../academic/academic-context.service';
import {
  UploadResultsDto,
  SuccessfulStudentResultDto,
  FailedStudentResultDto,
} from './dto/upload-results.dto';

@Injectable()
export class GradingService {
  private readonly logger = new Logger(GradingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly academicContext: AcademicContextService,
  ) {}

  private grades = [
    {
      id: '1',
      studentId: '1',
      subject: 'Mathematics',
      semester: 'First Semester',
      academicYear: '2023-2024',
      assignmentScore: 85,
      examScore: 90,
      totalScore: 87.5,
      grade: 'A',
      remarks: 'Excellent performance',
      teacherId: 'TCH001',
      teacherName: 'Mr. Johnson',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      studentId: '1',
      subject: 'English',
      semester: 'First Semester',
      academicYear: '2023-2024',
      assignmentScore: 78,
      examScore: 82,
      totalScore: 80,
      grade: 'B+',
      remarks: 'Good performance',
      teacherId: 'TCH002',
      teacherName: 'Mrs. Smith',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private subjects = [
    { id: '1', name: 'Mathematics', code: 'MATH101' },
    { id: '2', name: 'English', code: 'ENG101' },
    { id: '3', name: 'Science', code: 'SCI101' },
    { id: '4', name: 'History', code: 'HIST101' },
    { id: '5', name: 'Geography', code: 'GEO101' },
    { id: '6', name: 'Computer Science', code: 'CS101' },
  ];

  private gradeScales = [
    { grade: 'A', minScore: 90, maxScore: 100, points: 4.0 },
    { grade: 'A-', minScore: 85, maxScore: 89, points: 3.7 },
    { grade: 'B+', minScore: 80, maxScore: 84, points: 3.3 },
    { grade: 'B', minScore: 75, maxScore: 79, points: 3.0 },
    { grade: 'B-', minScore: 70, maxScore: 74, points: 2.7 },
    { grade: 'C+', minScore: 65, maxScore: 69, points: 2.3 },
    { grade: 'C', minScore: 60, maxScore: 64, points: 2.0 },
    { grade: 'D', minScore: 50, maxScore: 59, points: 1.0 },
    { grade: 'F', minScore: 0, maxScore: 49, points: 0.0 },
  ];

  /**
   * Fetch academic metadata needed for grade entry for a given state.
   * Returns the current session, current term, all LGAs, and all subjects in the state.
   */
  async getAcademicMetadataForGradeEntry(stateId: string) {
    this.logger.log(colors.magenta(`Fetching academic metadata for grade entry for state ${stateId}`));

    try {
      const [{ currentSession, currentTerm }, lgas, subjects] = await Promise.all([
        this.academicContext.getCurrentSessionAndTerm(stateId),
        this.academicContext.getLgasWithSchoolCounts(stateId),
        this.prisma.subject.findMany({
          where: {
            stateId,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            code: true,
            level: true,
            description: true,
          },
          orderBy: [
            { level: 'asc' },
            { name: 'asc' },
          ],
        }),
      ]);

      // Group subjects by level
      const primarySubjects = subjects.filter((s) => s.level === 'PRIMARY');
      const secondarySubjects = subjects.filter((s) => s.level === 'SECONDARY');

      const subjectsByLevel = {
        primary: {
          count: primarySubjects.length,
          subjects: primarySubjects,
        },
        secondary: {
          count: secondarySubjects.length,
          subjects: secondarySubjects,
        },
      };

      this.logger.log(colors.green('Academic metadata for grade entry retrieved successfully'));

      return ResponseHelper.success('Academic metadata retrieved successfully', {
        stateId,
        currentSession,
        currentTerm,
        totalLocalGovernments: lgas.length,
        localGovernments: lgas,
        totalSubjects: subjects.length,
        subjects: subjectsByLevel,
      });
    } catch (error) {
      this.logger.error(colors.red(`Failed to fetch academic metadata for grade entry: ${error?.message ?? error}`));
      return ResponseHelper.error(
        'Failed to fetch academic metadata for grade entry',
        (error as any)?.message ?? error,
        500,
      );
    }
  }

  /**
   * Fetch all schools under a selected Local Government Area for a given state.
   * Used during grade entry when an officer selects an LGA and needs its schools.
   */
  async getSchoolsByLocalGovernment(stateId: string, lgaId: string) {
    this.logger.log(colors.magenta(`Fetching schools for state ${stateId} and LGA ${lgaId}`));

    try {
      const schools = await this.academicContext.getSchoolsWithClassCounts(stateId, lgaId);

      this.logger.log(colors.green(`Retrieved ${schools.length} schools for LGA ${lgaId}`));

      return ResponseHelper.success('Schools in LGA retrieved successfully', {
        stateId,
        lgaId,
        total: schools.length,
        schools,
      });
    } catch (error) {
      this.logger.error(colors.red(`Failed to fetch schools for LGA ${lgaId}: ${error?.message ?? error}`));
      return ResponseHelper.error(
        'Failed to fetch schools for LGA',
        (error as any)?.message ?? error,
        500,
      );
    }
  }

  /**
   * Fetch all classes under a selected school for a given state.
   * Used during grade entry when an officer selects a school and needs its classes.
   */
  async getClassesBySchool(stateId: string, schoolId: string) {
    this.logger.log(colors.magenta(`Fetching classes for state ${stateId} and school ${schoolId}`));

    try {
      const classes = await this.academicContext.getClassesWithStudentCounts(stateId, schoolId);

      this.logger.log(colors.green(`Retrieved ${classes.length} classes for school ${schoolId}`));

      return ResponseHelper.success('Classes in school retrieved successfully', {
        stateId,
        schoolId,
        total: classes.length,
        classes,
      });
    } catch (error) {
      this.logger.error(colors.red(`Failed to fetch classes for school ${schoolId}: ${error?.message ?? error}`));
      return ResponseHelper.error(
        'Failed to fetch classes for school',
        (error as any)?.message ?? error,
        500,
      );
    }
  }

  /**
   * Fetch all students under a selected class.
   * Used during grade entry when an officer selects a class and needs its students.
   * The state is derived from the students' records, so only classId is required.
   */
  async fetchAllStudentsByClassId(classId: string) {
    this.logger.log(colors.magenta(`Fetching students for class ${classId}`));

    try {
      // Fetch all active students in the class
      const students = await this.prisma.student.findMany({
        where: {
          classId,
          isActive: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          studentId: true,
          gender: true,
          email: true,
          schoolId: true,
          stateId: true,
        },
        orderBy: { lastName: 'asc' },
      });

      if (students.length === 0) {
        this.logger.log(colors.yellow(`No students found for class ${classId}`));
        return ResponseHelper.success('No students found for class', {
          currentSession: null,
          currentTerm: null,
          stateId: null,
          schoolId: null,
          classId,
          total: 0,
          students: [],
        });
      }

      // Derive stateId from the first student record
      const stateId = students[0].stateId;

      // Fetch current session and term for this state
      const { currentSession, currentTerm } = await this.academicContext.getCurrentSessionAndTerm(stateId);

      // If we have a current term, find which students already have assessments (results) for that term & class
      let studentIdsWithResults = new Set<string>();
      if (currentTerm) {
        const assessments = await this.prisma.assessment.findMany({
          where: {
            classId,
            termId: currentTerm.id,
          },
          select: {
            studentId: true,
          },
        });

        studentIdsWithResults = new Set(assessments.map(a => a.studentId));
      }

      this.logger.log(colors.green(`Retrieved ${students.length} students for class ${classId}`));

      const schoolId = students[0]?.schoolId ?? null;

      return ResponseHelper.success('Students in class retrieved successfully', {
        currentSession: currentSession
          ? {
              id: currentSession.id,
              name: currentSession.name,
              isCurrent: currentSession.isCurrent,
            }
          : null,
        currentTerm: currentTerm
          ? {
              isCurrent: currentTerm.isCurrent,
              name: currentTerm.name,
              id: currentTerm.id,
            }
          : null,
        stateId,
        schoolId,
        classId,
        total: students.length,
        students: students.map(({ schoolId, firstName, lastName, ...rest }) => {
          const rawFullName = `${firstName ?? ''} ${lastName ?? ''}`.trim() || firstName || lastName || '';
          const formattedFullName = this.formatFullName(rawFullName);

          return {
            ...rest,
            firstName,
            lastName,
            fullName: formattedFullName,
            hasResultForActiveTerm: currentTerm ? studentIdsWithResults.has(rest.id) : false,
          };
        }),
      });
    } catch (error) {
      this.logger.error(colors.red(`Failed to fetch students for class ${classId}: ${error?.message ?? error}`));
      return ResponseHelper.error(
        'Failed to fetch students for class',
        (error as any)?.message ?? error,
        500,
      );
    }
  }

  /**
   * Helper to format a raw name string into "Title Case" for display.
   */
  private formatFullName(name: string): string {
    if (!name) return '';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }


  /**
   * Upload results (assessments) for multiple students in a batch.
   * Validates all required entities and processes students one by one.
   * Returns detailed success/failure information for each student.
   */
  async uploadResults(stateId: string, uploadData: UploadResultsDto) {
    this.logger.log(
      colors.magenta(
        `Uploading results for ${uploadData.students.length} students in class ${uploadData.classId}`,
      ),
    );

    const successfulStudents: SuccessfulStudentResultDto[] = [];
    const failedStudents: FailedStudentResultDto[] = [];

    try {
      // Step 1: Validate Session
      const session = await this.prisma.session.findFirst({
        where: {
          id: uploadData.sessionId,
          stateId: stateId,
        },
      });

      if (!session) {
        this.logger.error(colors.red(`Session with ID ${uploadData.sessionId} not found or does not belong to this state`));
        return ResponseHelper.error(
          'Session not found or does not belong to this state',
          `Session with ID ${uploadData.sessionId} not found or does not belong to this state`,
          400,
        );
      }

      // Step 2: Validate Term
      const term = await this.prisma.term.findFirst({
        where: {
          id: uploadData.termId,
          sessionId: uploadData.sessionId,
          stateId: stateId,
        },
      });

      if (!term) {
        this.logger.error(colors.red(`Term with ID ${uploadData.termId} not found or does not belong to the specified session`));
        return ResponseHelper.error(
          'Term not found or does not belong to the specified session',
          `Term with ID ${uploadData.termId} not found or does not belong to the specified session`,
          400,
        );
      }

      // Step 3: Validate LGA
      const lga = await this.prisma.localGovernmentArea.findFirst({
        where: {
          id: uploadData.lgaId,
          stateId: stateId,
        },
      });

      if (!lga) {
        this.logger.error(colors.red(`LGA not found or does not belong to this state`));
        return ResponseHelper.error(
          'LGA not found or does not belong to this state',
          400,
        );
      }

      // Step 4: Validate School
      const school = await this.prisma.school.findFirst({
        where: {
          id: uploadData.schoolId,
          lgaId: uploadData.lgaId,
          stateId: stateId,
        },
      });

      if (!school) {
        this.logger.error(colors.red(`School not found or does not belong to the specified LGA`));
        return ResponseHelper.error(
          'School not found or does not belong to the specified LGA',
          400,
        );
      }

      // Step 5: Validate Class
      const classRecord = await this.prisma.class.findFirst({
        where: {
          id: uploadData.classId,
          schoolId: uploadData.schoolId,
        },
      });

      if (!classRecord) {
        this.logger.error(colors.red(`Class not found or does not belong to the specified school`));
        return ResponseHelper.error(
          'Class not found or does not belong to the specified school',
          400,
        );
      }

      // Step 6: Get all valid subject IDs for this state to validate against
      const validSubjects = await this.prisma.subject.findMany({
        where: {
          stateId: stateId,
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      const validSubjectIds = new Set(validSubjects.map((s) => s.id));

      // Step 7: Process each student one by one
      this.logger.log(colors.magenta(`Processing ${uploadData.students.length} students`));
      for (const studentData of uploadData.students) {
        try {
          // Validate student exists and belongs to the class
          const student = await this.prisma.student.findFirst({
            where: {
              id: studentData.studentId,
              classId: uploadData.classId,
              schoolId: uploadData.schoolId,
              isActive: true,
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              studentId: true,
            },
          });

          if (!student) {
            failedStudents.push({
              studentId: studentData.studentId,
              error: 'Student not found or does not belong to the specified class',
            });
            continue;
          }

          // Validate and process each subject score
          let assessmentsCount = 0;
          const subjectErrors: string[] = [];

          for (const subjectScore of studentData.subjects) {
            // Validate score is within range (already validated by DTO, but double-check)
            if (subjectScore.score < 0 || subjectScore.score > 100) {
              subjectErrors.push(
                `Subject ${subjectScore.subjectId}: Score must be between 0 and 100, got ${subjectScore.score}`,
              );
              continue;
            }

            // Validate subject exists and belongs to state
            if (!validSubjectIds.has(subjectScore.subjectId)) {
              subjectErrors.push(
                `Subject ${subjectScore.subjectId}: Subject not found or not active for this state`,
              );
              continue;
            }

            // Create or update assessment using upsert
            try {
              await this.prisma.assessment.upsert({
                where: {
                  studentId_subjectId_classId_termId_type_title: {
                    studentId: student.id,
                    subjectId: subjectScore.subjectId,
                    classId: uploadData.classId,
                    termId: uploadData.termId,
                    type: 'EXAM',
                    title: 'Grade Entry Assessment',
                  },
                },
                update: {
                  score: subjectScore.score,
                  maxScore: 100,
                  percentage: 100,
                  dateGiven: new Date(),
                  dateSubmitted: new Date(),
                  isSubmitted: true,
                  isGraded: true,
                  updatedAt: new Date(),
                },
                create: {
                  studentId: student.id,
                  subjectId: subjectScore.subjectId,
                  classId: uploadData.classId,
                  termId: uploadData.termId,
                  type: 'EXAM',
                  title: 'Grade Entry Assessment',
                  maxScore: 100,
                  score: subjectScore.score,
                  percentage: 100,
                  dateGiven: new Date(),
                  dateSubmitted: new Date(),
                  isSubmitted: true,
                  isGraded: true,
                },
              });

              assessmentsCount++;
            } catch (error) {
              subjectErrors.push(
                `Subject ${subjectScore.subjectId}: Failed to create/update assessment - ${error.message}`,
              );
            }
          }

          // If there were subject errors, mark student as failed
          if (subjectErrors.length > 0) {
            failedStudents.push({
              studentId: studentData.studentId,
              error: subjectErrors.join('; '),
              studentName: `${student.firstName} ${student.lastName}`.trim(),
            });
          } else if (assessmentsCount > 0) {
            // Student processed successfully
            successfulStudents.push({
              studentId: studentData.studentId,
              assessmentsCount: assessmentsCount,
              studentName: `${student.firstName} ${student.lastName}`.trim(),
            });
          } else {
            // No valid subjects provided
            failedStudents.push({
              studentId: studentData.studentId,
              error: 'No valid subjects provided for this student',
              studentName: `${student.firstName} ${student.lastName}`.trim(),
            });
          }
        } catch (error) {
          // Catch any unexpected errors for this student
          failedStudents.push({
            studentId: studentData.studentId,
            error: `Unexpected error: ${error.message}`,
          });
        }
      }

      const total = uploadData.students.length;
      const successful = successfulStudents.length;
      const failed = failedStudents.length;

      this.logger.log(
        colors.green(
          `Results upload completed: ${successful} successful, ${failed} failed out of ${total} total students`,
        ),
      );

      const message =
        failed > 0
          ? `Results upload completed. ${successful} successful, ${failed} failed out of ${total} total students.`
          : `All ${successful} students uploaded successfully.`;

      return ResponseHelper.success(message, {
        total,
        successful,
        failed,
        successfulStudents,
        failedStudents,
      });
    } catch (error) {
      this.logger.error(colors.red(`Failed to upload results: ${error?.message ?? error}`));
      return ResponseHelper.error(
        'Failed to upload results',
        (error as any)?.message ?? error,
        500,
      );
    }
  }
} 