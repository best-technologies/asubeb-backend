import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  UnauthorizedException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { ResponseHelper } from '../../common/helpers/response.helper';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      const user = await this.authService.validateUser(dto.email, dto.password);
      if (!user) {
        this.logger.warn(`Invalid credentials for ${dto.email}`);
        return ResponseHelper.error('Invalid credentials', null, HttpStatus.UNAUTHORIZED);
      }

      const result = await this.authService.login(user);
      return ResponseHelper.success('Login successful', result);
    } catch (error) {
      this.logger.error(`Login error for ${dto.email}: ${error?.message ?? error}`);
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      return ResponseHelper.error(error?.message || 'Login failed', null, status);
    }
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      const user = await this.authService.register(dto as any);
      return ResponseHelper.created('User registered', user);
    } catch (error) {
      this.logger.error(`Registration error for ${dto.email}: ${error?.message ?? error}`);
      const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      return ResponseHelper.error(error?.message || 'Registration failed', null, status);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Request() req) {
    try {
      return ResponseHelper.success('Profile fetched', req.user);
    } catch (error) {
      this.logger.error(`Profile fetch error: ${error?.message ?? error}`);
      return ResponseHelper.error('Failed to fetch profile', null, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
