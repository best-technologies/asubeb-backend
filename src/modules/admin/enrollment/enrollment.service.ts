import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ResponseHelper } from '../../../common/helpers/response.helper';
import { Gender, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as colors from 'colors';
import { sendSubebOfficerWelcomeEmail } from '../../../common/mailer/send-mail';
import { EnrollOfficerDto } from '../subeb-officers/dto';
import { AcademicContextService } from '../../academic/academic-context.service';
import { EnrollSingleOrBulkStudentsDto, EnrollStudentDto } from './dto/enroll-student.dto';

@Injectable()
export class EnrollmentService {
  private readonly logger = new Logger(EnrollmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly academicContext: AcademicContextService,
  ) {}

  /**
   * Placeholder method – we will flesh this out with real enrollment logic later.
   */
  async healthCheck() {
    this.logger.log(colors.green('EnrollmentService is up'));
    return { ok: true };
  }

  /**
   * Fetch academic metadata for student enrollment for the current user's state:
   * - Current session and term
   * - All LGAs in the state with school counts
   */
  async getStudentEnrollmentMetadata(user: any) {
    if (!user?.stateId) {
      throw new BadRequestException('User state not found');
    }

    const stateId = user.stateId;

    this.logger.log(
      colors.magenta(
        `Fetching student enrollment metadata for state ${stateId} (user: ${user.id ?? 'unknown'})`,
      ),
    );

    const [{ currentSession, currentTerm }, lgas] = await Promise.all([
      this.academicContext.getCurrentSessionAndTerm(stateId),
      this.academicContext.getLgasWithSchoolCounts(stateId),
    ]);

    this.logger.log(
      colors.green(
        `Student enrollment metadata fetched for state ${stateId}: ${lgas.length} LGAs, session=${currentSession?.name ?? 'none'}, term=${currentTerm?.name ?? 'none'}`,
      ),
    );

    return ResponseHelper.success('Student enrollment metadata retrieved successfully', {
      stateId,
      currentSession,
      currentTerm,
      totalLocalGovernments: lgas.length,
      localGovernments: lgas,
    });
  }

  /**
   * Fetch schools under an LGA for student enrollment (for current user's state).
   */
  async getSchoolsForStudentEnrollment(user: any, lgaId: string) {
    if (!user?.stateId) {
      throw new BadRequestException('User state not found');
    }

    const stateId = user.stateId;
    this.logger.log(
      colors.magenta(
        `Fetching schools for student enrollment for state ${stateId}, LGA ${lgaId} (user: ${
          user.id ?? 'unknown'
        })`,
      ),
    );

    const schools = await this.academicContext.getSchoolsWithClassCounts(stateId, lgaId);

    this.logger.log(
      colors.green(
        `Retrieved ${schools.length} schools for student enrollment (state ${stateId}, LGA ${lgaId})`,
      ),
    );

    return ResponseHelper.success('Schools for student enrollment retrieved successfully', {
      stateId,
      lgaId,
      total: schools.length,
      schools,
    });
  }

  /**
   * Fetch classes under a school for student enrollment (for current user's state).
   */
  async getClassesForStudentEnrollment(user: any, schoolId: string) {
    if (!user?.stateId) {
      throw new BadRequestException('User state not found');
    }

    const stateId = user.stateId;
    this.logger.log(
      colors.magenta(
        `Fetching classes for student enrollment for state ${stateId}, school ${schoolId} (user: ${
          user.id ?? 'unknown'
        })`,
      ),
    );

    const classes = await this.academicContext.getClassesWithStudentCounts(stateId, schoolId);

    this.logger.log(
      colors.green(
        `Retrieved ${classes.length} classes for student enrollment (state ${stateId}, school ${schoolId})`,
      ),
    );

    return ResponseHelper.success('Classes for student enrollment retrieved successfully', {
      stateId,
      schoolId,
      total: classes.length,
      classes,
    });
  }

  /**
   * Register a SUBEB officer from the Enrollment module:
   * - Generates a temporary password
   * - Creates User with SUBEB_OFFICER role
   * - Creates SubebOfficer record
   * - Sends welcome email with temp password
   */
  async enrollNewSubebOfficer(dto: EnrollOfficerDto, user: any) {
    if (!user?.id) {
      throw new UnauthorizedException(
        'User ID not found in request. Please ensure JWT authentication is working correctly.',
      );
    }

    const enrolledByUserId = user.id;
    this.logger.log(colors.yellow(`Enrolling SUBEB officer ${dto.email} from EnrollmentModule by ${enrolledByUserId}`));

    try {
      // 1. Check if user already exists
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existing) {
        this.logger.warn(`Attempt to enroll SUBEB officer with existing email: ${dto.email}`);
        throw new ConflictException('User already exists');
      }

      // 2. Resolve stateId strictly from the enrolling user's state
      const enrollingUser = await this.prisma.user.findUnique({
        where: { id: enrolledByUserId },
        select: { stateId: true },
      });
      if (!enrollingUser?.stateId) {
        this.logger.warn('Enrolling user has no stateId. stateId is required.');
        throw new BadRequestException(
          'Enrolling user must be associated with a state to enroll a SUBEB officer',
        );
      }
      const stateId = enrollingUser.stateId;

      // 3. Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-10);

      // 4. Hash password
      const hashed = await bcrypt.hash(tempPassword, 10);

      // 5. Simple officerId generation: OFF + 5 random digits
      const randomDigits = Math.floor(Math.random() * 90000) + 10000;
      const officerId = `OFF${randomDigits}`;

      // 6. Create user and SubebOfficer within a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: dto.email,
            username: dto.email,
            password: hashed,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: UserRole.SUBEB_OFFICER,
            stateId,
          },
        });

        await tx.subebOfficer.create({
          data: {
            userId: user.id,
            officerId,
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            phone: dto.phone, // can be updated later
            address: dto.address || "",
            designation: dto.designation || "",
            stateId,
            enrolledBy: enrolledByUserId,
          },
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      });

      // 7. Send welcome email with temp password (fire-and-forget)
      if (result?.email && result?.firstName && result?.lastName) {
        sendSubebOfficerWelcomeEmail(result.email, {
          firstName: result.firstName ?? '',
          lastName: result.lastName ?? '',
          email: result.email,
          password: tempPassword,
        }).catch(() => {
          // Swallow email errors; main registration should still succeed
        });
      }

      this.logger.log(`Created SUBEB officer ${result.email} (${result.id}) via EnrollmentModule`);
      return ResponseHelper.created('SUBEB officer registered', result);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Failed to register SUBEB officer ${dto.email} via EnrollmentModule: ${error?.message ?? error}`,
      );
      throw new InternalServerErrorException('Failed to register SUBEB officer');
    }
  }

  /**
   * Enroll a new student into a school and class for the current user's state.
   * Single-student helper used by bulk operation.
   */
  private async enrollSingleStudentInternal(
    dto: EnrollStudentDto,
    user: any,
    serialInClass: number,
    schoolCode: string,
    stateName: string,
  ) {
    if (!user?.id) {
      throw new UnauthorizedException(
        'User ID not found in request. Please ensure JWT authentication is working correctly.',
      );
    }

    if (!user?.stateId) {
      throw new BadRequestException('Enrolling user must be associated with a state to enroll a student');
    }

    const stateId = user.stateId as string;

    const studentLabel = dto.email ?? `${dto.firstName} ${dto.lastName}`;

    try {
      // Ensure class belongs to the given school and state
      const targetClass = await this.prisma.class.findFirst({
        where: {
          id: dto.classId,
          schoolId: dto.schoolId,
          school: {
            stateId,
          },
        },
        select: {
          id: true,
          schoolId: true,
        },
      });

      if (!targetClass) {
        throw new BadRequestException('Class does not belong to the specified school or state');
      }

      // Check if a student with same email or generated ID exists (email is optional)
      if (dto.email) {
        const existingByEmail = await this.prisma.student.findUnique({
          where: { email: dto.email },
        });
        if (existingByEmail) {
          throw new ConflictException('A student with this email already exists');
        }
      }

      // Generate studentId and email based on naming convention
      const now = new Date();
      const yearSuffix = now.getFullYear().toString().slice(-2); // e.g. '25'
      const monthPart = (now.getMonth() + 1).toString().padStart(2, '0'); // '01' - '12'
      const serialPart = serialInClass.toString().padStart(2, '0'); // e.g. '01', '24'

      const normalize = (value: string) =>
        (value || '')
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '')
          .replace(/[^a-z0-9]/g, '');

      const first = normalize(dto.firstName);
      const last = normalize(dto.lastName);
      const code = normalize(schoolCode);
      const stateSlug = normalize(stateName);

      const localPart = `${first}.${last}.${code}.${yearSuffix}${monthPart}${serialPart}`;
      const emailGenerated = `${localPart}@${stateSlug}subeb.edu.ng`;

      const studentId = `STU${yearSuffix}${monthPart}${serialPart}${code.toUpperCase()}`;

      // Ensure email is unique; if not, fall back to provided dto.email (if any)
      const existingEmailOwner = await this.prisma.student.findUnique({
        where: { email: emailGenerated },
      });
      const finalEmail =
        existingEmailOwner || !emailGenerated ? dto.email ?? null : emailGenerated;

      // Create student and increment school student count in a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        const student = await tx.student.create({
          data: {
            studentId: studentId!,
            schoolId: dto.schoolId,
            classId: dto.classId,
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: finalEmail,
            phone: dto.phone ?? null,
            dateOfBirth: new Date(dto.dateOfBirth),
            gender: dto.gender as Gender,
            address: dto.address ?? null,
            stateId,
          },
        });

        await tx.school.update({
          where: { id: dto.schoolId },
          data: {
            totalStudents: {
              increment: 1,
            },
          },
        });

        return student;
      });

      this.logger.log(
        colors.green(
          `Enrolled student ${result.studentId} (${result.id}) via EnrollmentModule into class ${dto.classId}`,
        ),
      );

      return result;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Failed to enroll student ${dto.email ?? dto.firstName + ' ' + dto.lastName}: ${
          (error as any)?.message ?? error
        }`,
      );
      throw new InternalServerErrorException('Failed to enroll student');
    }
  }

  /**
   * Enroll single or multiple students into a school/class for the current user's state.
   * Uses shared academic context and auto-generates institutional emails.
   */
  async enrollSingleOrBulkStudents(payload: EnrollSingleOrBulkStudentsDto, user: any) {
    this.logger.log(
      colors.cyan(
        `Incoming enrollSingleOrBulkStudents payload: ${JSON.stringify(payload, null, 2)}`,
      ),
    );

    if (!payload?.students || payload.students.length === 0) {
      this.logger.error('No students provided in the payload');
      return ResponseHelper.error('No students provided in the payload');
    }
    this.logger.log(colors.yellow(`Enrolling New student(s) total ${payload.students.length}`));
    if (!user?.id) {
      this.logger.error('User ID not found in request. Please ensure JWT authentication is working correctly.');
      return ResponseHelper.error('User ID not found in request');
    }

    if (!user?.stateId) {
      this.logger.error('Enrolling user must be associated with a state to enroll students');
      return ResponseHelper.error('Enrolling user must be associated with a state to enroll students');
    }

    const stateId = user.stateId as string;

    // For simplicity and consistency, ensure all students target the same school and class
    const [first] = payload.students;
    const schoolId = first.schoolId;
    const classId = first.classId;

    const inconsistentTarget = payload.students.some(
      (s) => s.schoolId !== schoolId || s.classId !== classId,
    );
    if (inconsistentTarget) {
      this.logger.error('All students must target the same schoolId and classId');
      return ResponseHelper.error('All students must target the same schoolId and classId');
    }

    this.logger.log(
      colors.yellow(
        `Enrolling New student(s) total ${payload.students.length}`,
      ),
    );

    // Ensure school and class belong to this state and are linked
    const school = await this.prisma.school.findFirst({
      where: {
        id: schoolId,
        stateId,
      },
      select: {
        id: true,
        code: true,
        stateRef: {
          select: {
            stateName: true,
          },
        },
      },
    });

    if (!school) {
      this.logger.error('School does not belong to the current user state');
      return ResponseHelper.error('School does not belong to the current user state');
    }

    const targetClass = await this.prisma.class.findFirst({
      where: {
        id: classId,
        schoolId,
        school: {
          stateId,
        },
      },
      select: {
        id: true,
        schoolId: true,
      },
    });

    if (!targetClass) {
      this.logger.error('Class does not belong to the specified school or state');
      return ResponseHelper.error('Class does not belong to the specified school or state');
    }

    // Determine starting serial based on current number of students in the class
    const existingCount = await this.prisma.student.count({
      where: { classId },
    });

    const schoolCode = school.code;
    const stateName = school.stateRef.stateName;

    const createdStudents: any[] = [];

    for (let i = 0; i < payload.students.length; i++) {
      const dto = payload.students[i];
      const serialInClass = existingCount + i + 1; // next available serial within the class
      const student = await this.enrollSingleStudentInternal(
        dto,
        user,
        serialInClass,
        schoolCode,
        stateName,
      );
      createdStudents.push(student);
    }

    this.logger.log(
      colors.green(
        `Successfully enrolled New student(s) total ${createdStudents.length}`,
      ),
    );

    return ResponseHelper.created(
      'New student(s) enrolled successfully',
      createdStudents,
    );
  }
}


