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
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as colors from 'colors';
import { sendSubebOfficerWelcomeEmail } from '../../../common/mailer/send-mail';
import { RegisterSubebOfficerDto } from './dto/enrollment.dto';
import { EnrollOfficerDto } from '../subeb-officers/dto';

@Injectable()
export class EnrollmentService {
  private readonly logger = new Logger(EnrollmentService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Placeholder method – we will flesh this out with real enrollment logic later.
   */
  async healthCheck() {
    this.logger.log(colors.green('EnrollmentService is up'));
    return { ok: true };
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
}


