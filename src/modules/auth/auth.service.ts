import colors from 'colors';
import {
  Injectable,
  Logger,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ResponseHelper } from '../../common/helpers/response.helper';
import { MailService } from '../../common/mailer/mail.service';
import { AuditLogService } from '../admin/audit-log/audit-log.service';
import { DataCacheService } from '../../common/cache/data-cache.service';

export type SafeUser = {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  stateId?: string | null;
  schoolName?: string | null;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private static readonly otpStore = new Map<
    string,
    { otp: string; userId: string; email: string; attempts: number; expiresAt: number }
  >();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly auditLogService: AuditLogService,
    private readonly dataCacheService: DataCacheService,
  ) {}

  /**
   * Validate user credentials.
   * Returns a safe user object (no password) when credentials are valid, otherwise null.
   */
  async validateUser(email: string, pass: string): Promise<SafeUser | null> {
    if (!email || !pass) {
      this.logger.warn('Missing email or password');
      throw new BadRequestException('Email and password must be provided');
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const user = await this.prisma.user.findFirst({
        where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
        include: {
          schoolIt: {
            include: {
              school: {
                include: { lga: true },
              },
              officer: true,
            },
          },
        },
      });
      if (!user) {
        this.logger.warn(`Authentication attempt for non-existing user: ${email}`);
        return null;
      }

      const isValid = await bcrypt.compare(pass, user.password);
      if (!isValid) {
        this.logger.warn(`Invalid password attempt for user: ${email}`);
        return null;
      }

      // Resolve School IT profile if user has SCHOOL_IT role or relation
      let schoolIt = user.schoolIt;
      if (!schoolIt && (user.role as string) === 'SCHOOL_IT') {
        schoolIt = await this.prisma.schoolIt.findFirst({
          where: {
            OR: [
              { userId: user.id },
              { email: { equals: normalizedEmail, mode: 'insensitive' } },
            ],
          },
          include: {
            school: {
              include: { lga: true },
            },
            officer: true,
          },
        });
      }

      // Check if user account or School IT profile is deactivated
      const isSchoolIt = (user.role as string) === 'SCHOOL_IT' || !!schoolIt;
      const isDeactivated = !user.isActive || (isSchoolIt && schoolIt && !schoolIt.isActive);

      if (isDeactivated) {
        this.logger.warn(`Login rejected: deactivated user ${email} (${user.role})`);

        // Ensure database state is synchronized if one record is deactivated
        if (user.isActive) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: { isActive: false },
          }).catch(() => {});
        }
        if (schoolIt && schoolIt.isActive) {
          await this.prisma.schoolIt.update({
            where: { id: schoolIt.id },
            data: { isActive: false },
          }).catch(() => {});
        }

        if (isSchoolIt) {
          const lgaName = schoolIt?.school?.lga?.name;
          let officer = schoolIt?.officer;

          // If officer not directly attached, lookup by LGA
          if (!officer && schoolIt?.school?.lgaId) {
            officer = await this.prisma.subebOfficer.findFirst({
              where: {
                lgaId: { contains: schoolIt.school.lgaId },
              },
            }).catch(() => null) as any;
          }

          const officerName = officer
            ? `${officer.firstName} ${officer.lastName}`.trim()
            : null;

          let contactTarget = 'your LGA Exam Officer';
          if (officerName && lgaName) {
            contactTarget = `your LGA Exam Officer (${officerName} - ${lgaName} LGA)`;
          } else if (lgaName) {
            contactTarget = `your LGA Exam Officer in ${lgaName} LGA`;
          } else if (officerName) {
            contactTarget = `your LGA Exam Officer (${officerName})`;
          }

          throw new UnauthorizedException(
            `Your account has been deactivated. If you believe this is an error, please reach out to ${contactTarget} to reactivate your access.`
          );
        }

        throw new UnauthorizedException(
          'Your account has been deactivated. If you believe this is an error, please reach out to the system administrator to reactivate your access.'
        );
      }

      const safe: SafeUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        stateId: user.stateId,
        schoolName: user.schoolIt?.school?.name || null,
      };

      this.logger.log(`User validated: ${email}`);
      return safe;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(`Error validating user ${email}: ${error?.message ?? error}`);
      throw new InternalServerErrorException('Failed to validate user');
    }
  }

  /**
   * Authenticate user with email and password, then return formatted response with JWT token and user data.
   * Logs USER_LOGIN action in audit logs.
   */
  async authenticate(email: string, password: string) {
    if (!email || !password) {
      this.logger.warn('Missing email or password');
      throw new BadRequestException('Email and password must be provided');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.validateUser(normalizedEmail, password);
    if (!user) {
      this.logger.warn(`Invalid credentials for ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const result = await this.login(user);

    // Record login audit log for all roles
    try {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      await this.auditLogService.createLog(
        user.id,
        'USER_LOGIN',
        {
          email: user.email,
          role: user.role,
          name: fullName || user.email,
        },
        'Authentication',
        user.id,
      );
      this.logger.log(`Audit log USER_LOGIN recorded for ${user.email} (${user.role})`);
    } catch (auditErr: any) {
      this.logger.error(`Failed to record login audit log: ${auditErr?.message}`);
    }

    return ResponseHelper.success('Login successful', result);
  }

  /**
   * User logout handler.
   * Invalidates token in cache and logs USER_LOGOUT in audit logs.
   */
  async logout(req: any) {
    let token: string | null = null;
    const authHeader = req?.headers?.authorization || req?.headers?.Authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    let userId: string | null = req?.user?.id || req?.user?.sub || req?.user?.userId || null;
    let email: string | null = req?.user?.email || null;
    let role: string | null = req?.user?.role || null;
    let fullName: string | null = req?.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() : null;

    if (token) {
      try {
        const decoded: any = this.jwtService.decode(token);
        if (decoded) {
          userId = userId || decoded.sub || decoded.id || decoded.userId || null;
          email = email || decoded.email || null;
          role = role || decoded.role || null;

          // Blacklist the token until it expires
          const remainingMs = decoded.exp
            ? Math.max(decoded.exp * 1000 - Date.now(), 60000)
            : 7 * 24 * 60 * 60 * 1000;
          this.dataCacheService.set(`blacklist:${token}`, true, remainingMs);
          this.logger.log(`Token blacklisted on logout until expiry (${Math.round(remainingMs / 1000)}s)`);
        }
      } catch (e) {
        this.dataCacheService.set(`blacklist:${token}`, true, 7 * 24 * 60 * 60 * 1000);
      }
    }

    if (userId) {
      if (!email || !role || !fullName) {
        try {
          const dbUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, role: true, firstName: true, lastName: true },
          });
          if (dbUser) {
            email = email || dbUser.email;
            role = role || dbUser.role;
            fullName = fullName || `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim();
          }
        } catch (e) {}
      }

      try {
        const cacheKey = `recent_logout_log:${userId}`;
        const alreadyLogged = this.dataCacheService.get(cacheKey);
        if (!alreadyLogged) {
          this.dataCacheService.set(cacheKey, true, 5000);
          await this.auditLogService.createLog(
            userId,
            'USER_LOGOUT',
            {
              email: email || 'N/A',
              role: role || 'USER',
              name: fullName || email || 'User',
            },
            'Authentication',
            userId,
          );
          this.logger.log(`Audit log USER_LOGOUT recorded for ${email || userId} (${role})`);
        }
      } catch (auditErr: any) {
        this.logger.error(`Failed to record logout audit log: ${auditErr?.message}`);
      }
    }

    return ResponseHelper.success('Logout successful');
  }

  /**
   * Sign a JWT for an authenticated user and return token + user payload.
   */
  private async login(user: SafeUser) {
    if (!user || !user.id) {
      this.logger.warn('login called with invalid user payload');
      throw new BadRequestException('Invalid user');
    }

    const payload: JwtPayload = { sub: user.id, id: user.id, email: user.email, role: user.role, stateId: user.stateId };

    try {
      this.logger.log(`Signing JWT for user ${user.email} (${user.id})`);
      const token = this.jwtService.sign(payload);
      return {
        access_token: token,
        user: { sub: payload.sub, id: payload.id, email: payload.email, role: payload.role, stateId: payload.stateId, schoolName: user.schoolName },
      };
    } catch (error) {
      this.logger.error(`Failed to sign JWT for user ${user.email}: ${error?.message ?? error}`);
      throw new InternalServerErrorException('Failed to generate access token');
    }
  }

  /**
   * Register a new user.
   */
  async register(data: RegisterDto, role: UserRole = UserRole.USER) {
    this.logger.log(colors.yellow(`Registering user ${data.email} with role ${role}`));

    try {
      const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existing) {
        this.logger.warn(`Attempt to register with existing email: ${data.email}`);
        throw new ConflictException('User already exists');
      }

      const abiaState = await this.prisma.state.findFirst({
        where: { stateId: 'ABIA' },
      });
      if (!abiaState) {
        throw new BadRequestException('Abia State not found. Please run the migration first.');
      }

      const hashed = await bcrypt.hash(data.password, 10);
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          username: data.email,
          password: hashed,
          firstName: data.firstName,
          lastName: data.lastName,
          role,
          stateId: abiaState.id,
        },
      });

      if (role === UserRole.SUBEB_OFFICER) {
        const randomDigits = Math.floor(Math.random() * 90000) + 10000;
        const officerId = `OFF${randomDigits}`;

        await this.prisma.subebOfficer.create({
          data: {
            userId: user.id,
            officerId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: '',
            address: null,
            designation: null,
            stateId: abiaState.id,
            enrolledBy: null,
          },
        });
      }

      const safeUser: SafeUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      this.logger.log(`Created user ${safeUser.email} (${safeUser.id})`);
      return ResponseHelper.created('User registered', safeUser);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) throw error;
      this.logger.error(`Failed to create user ${data.email}: ${error?.message ?? error}`);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  /**
   * Register a SUBEB officer.
   */
  async registerSubebOfficer(dto: RegisterDto) {
    const tempPassword = Math.random().toString(36).slice(-10);

    const result = await this.register(
      {
        ...dto,
        password: tempPassword,
      },
      UserRole.SUBEB_OFFICER,
    );

    const user = result?.data as SafeUser | undefined;
    if (user?.email && user?.firstName && user?.lastName) {
      this.mailService
        .sendSubebOfficerWelcomeEmail(user.email, {
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          email: user.email,
          password: tempPassword,
        })
        .catch(() => {});
    }

    return result;
  }

  /**
   * Send 6-digit recovery OTP for forgot password request.
   */
  async forgotPassword(email: string) {
    if (!email) {
      throw new BadRequestException('Email address is required');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      this.logger.warn(`Password recovery attempt for unregistered email: ${normalizedEmail}`);
      throw new BadRequestException('No account found with this email address. Please check and try again.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresInMinutes = 15;
    const ttlMs = expiresInMinutes * 60 * 1000;

    const cacheKey = `pwd_reset:${normalizedEmail}`;
    const payload = {
      otp,
      userId: user.id,
      email: normalizedEmail,
      attempts: 0,
      expiresAt: Date.now() + ttlMs,
    };

    this.dataCacheService.set(cacheKey, payload, ttlMs);
    AuthService.otpStore.set(normalizedEmail, payload);

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User';

    try {
      await this.mailService.sendPasswordResetOtpEmail(normalizedEmail, {
        name: fullName,
        email: normalizedEmail,
        otp,
        expiresInMinutes,
      });
      this.logger.log(`Password reset OTP delivered to ${normalizedEmail}`);
    } catch (emailError: any) {
      this.logger.error(`Failed to send password reset email to ${normalizedEmail}: ${emailError?.message}`);
      throw new InternalServerErrorException(
        'Unable to send verification email. Please check your email configuration or try again later.',
      );
    }

    return ResponseHelper.success(
      'A 6-digit recovery code has been sent to your email address.',
      { email: normalizedEmail },
    );
  }

  /**
   * Verify 6-digit OTP code and reset password.
   */
  async resetPassword(dto: { email: string; otp: string; newPassword: string }) {
    const { email, otp, newPassword } = dto;
    if (!email || !otp || !newPassword) {
      throw new BadRequestException('Email, verification code, and new password are required');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cacheKey = `pwd_reset:${normalizedEmail}`;

    let cached = this.dataCacheService.get<{
      otp: string;
      userId: string;
      email: string;
      attempts: number;
      expiresAt: number;
    }>(cacheKey);

    if (!cached) {
      cached = AuthService.otpStore.get(normalizedEmail);
      if (cached && Date.now() > cached.expiresAt) {
        AuthService.otpStore.delete(normalizedEmail);
        cached = undefined;
      }
    }

    if (!cached) {
      throw new BadRequestException(
        'The verification code has expired or is invalid. Please request a new code.',
      );
    }

    if (cached.attempts >= 5) {
      this.dataCacheService.del(cacheKey);
      AuthService.otpStore.delete(normalizedEmail);
      throw new BadRequestException(
        'Too many incorrect verification attempts. Please request a new code.',
      );
    }

    if (cached.otp !== otp.trim()) {
      cached.attempts = (cached.attempts || 0) + 1;
      const remainingMs = Math.max(cached.expiresAt - Date.now(), 60000);
      this.dataCacheService.set(cacheKey, cached, remainingMs);
      AuthService.otpStore.set(normalizedEmail, cached);
      throw new BadRequestException('Invalid verification code. Please check your email and try again.');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    this.dataCacheService.del(cacheKey);
    AuthService.otpStore.delete(normalizedEmail);

    this.logger.log(`Password reset completed successfully for user: ${normalizedEmail}`);

    return ResponseHelper.success(
      'Password reset successful. You can now sign in with your new password.',
    );
  }

  /**
   * Get user profile.
   */
  getProfile(user: any) {
    return ResponseHelper.success('Profile fetched', user);
  }

  /**
   * Update user profile.
   */
  async updateProfile(userId: string, data: { firstName?: string; lastName?: string }) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
      },
    });

    const safeUser = {
      id: updated.id,
      email: updated.email,
      role: updated.role,
      firstName: updated.firstName,
      lastName: updated.lastName,
      stateId: updated.stateId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
    return ResponseHelper.success('Profile updated successfully', safeUser);
  }
}
