import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ResponseHelper } from '../../common/helpers/response.helper';
import { UserRole } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import * as colors from 'colors';
import { MailService } from '../../common/mailer/mail.service';

export type SafeUser = { id: string; email: string; role: string; firstName?: string | null; lastName?: string | null };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly mailService: MailService,
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
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        this.logger.warn(`Authentication attempt for non-existing user: ${email}`);
        return null;
      }

      const isValid = await bcrypt.compare(pass, user.password);
      if (!isValid) {
        this.logger.warn(`Invalid password attempt for user: ${email}`);
        return null;
      }

      const safe: SafeUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      this.logger.log(`User validated: ${email}`);
      return safe;
    } catch (error) {
      this.logger.error(`Error validating user ${email}: ${error?.message ?? error}`);
      throw new InternalServerErrorException('Failed to validate user');
    }
  }

  /**
   * Authenticate user with email and password, then return formatted response with JWT token and user data.
   * Throws UnauthorizedException if credentials are invalid.
   */
  async authenticate(email: string, password: string) {

    this.logger.log(`Authenticating user ${email} with password ${password}`);

    try {
      
    } catch (error) {
      
    }

    if (!email || !password) {
      this.logger.warn('Missing email or password');
      throw new BadRequestException('Email and password must be provided');
    }

    const user = await this.validateUser(email, password);
    if (!user) {
      this.logger.warn(`Invalid credentials for ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const result = await this.login(user);
    return ResponseHelper.success('Login successful', result);
  }

  /**
   * Sign a JWT for an authenticated user and return token + user payload.
   */
  private async login(user: SafeUser) {
    if (!user || !user.id) {
      this.logger.warn('login called with invalid user payload');
      throw new BadRequestException('Invalid user');
    }

    const payload: JwtPayload = { sub: user.id, id: user.id, email: user.email, role: user.role };

    try {
      this.logger.log(`Signing JWT for user ${user.email} (${user.id})`);
      const token = this.jwtService.sign(payload);
      return {
        access_token: token,
        user: { sub: payload.sub, id: payload.id, email: payload.email, role: payload.role },
      };
    } catch (error) {
      this.logger.error(`Failed to sign JWT for user ${user.email}: ${error?.message ?? error}`);
      throw new InternalServerErrorException('Failed to generate access token');
    }
  }

  /**
   * Register a new user. By default assigns role 'grade-entry-officer' unless overridden.
   * Returns formatted response with user data.
   */
  async register(data: RegisterDto, role: UserRole = UserRole.USER) {
    this.logger.log(colors.yellow(`Registering user ${data.email} with role ${role}`));

    try {
      const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existing) {
        this.logger.warn(`Attempt to register with existing email: ${data.email}`);
        throw new ConflictException('User already exists');
      }

      // Get Abia State ID
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

      // If this is a SUBEB_OFFICER, also create a SubebOfficer record
      if (role === UserRole.SUBEB_OFFICER) {
        // Simple officerId generation: OFF + 5 random digits
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
      // If we already threw a known exception, rethrow it
      if (error instanceof ConflictException || error instanceof BadRequestException) throw error;

      this.logger.error(`Failed to create user ${data.email}: ${error?.message ?? error}`);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  /**
   * Register a SUBEB officer:
   * - Generates a temporary password
   * - Creates User with SUBEB_OFFICER role (+ SubebOfficer record via register)
   * - Sends welcome email with temp password
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
        .catch(() => {
          // Swallow email errors; main registration should still succeed
        });
    }

    return result;
  }

  /**
   * Get user profile formatted response.
   */
  getProfile(user: any) {
    return ResponseHelper.success('Profile fetched', user);
  }
}
