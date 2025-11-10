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

export type SafeUser = { id: string; email: string; role: string; firstName?: string | null; lastName?: string | null };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

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
  async register(data: { email: string; password: string; firstName: string; lastName: string }) {
    if (!data?.email || !data?.password || !data?.firstName || !data?.lastName) {
      this.logger.warn('register called with missing required fields');
      throw new BadRequestException('Email, password, firstName, and lastName are required');
    }

    try {
      const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existing) {
        this.logger.warn(`Attempt to register with existing email: ${data.email}`);
        throw new ConflictException('User already exists');
      }

      const hashed = await bcrypt.hash(data.password, 10);
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          username: data.email,
          password: hashed,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'grade-entry-officer',
        },
        select: { id: true, email: true, role: true, firstName: true, lastName: true },
      });

      this.logger.log(`Created user ${user.email} (${user.id})`);
      return ResponseHelper.created('User registered', user as SafeUser);
    } catch (error) {
      // If we already threw a known exception, rethrow it
      if (error instanceof ConflictException || error instanceof BadRequestException) throw error;

      this.logger.error(`Failed to create user ${data.email}: ${error?.message ?? error}`);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  /**
   * Get user profile formatted response.
   */
  getProfile(user: any) {
    return ResponseHelper.success('Profile fetched', user);
  }
}
