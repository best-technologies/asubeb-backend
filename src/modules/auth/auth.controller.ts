import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserRole } from '@prisma/client';
import { sendSubebOfficerWelcomeEmail } from '../../common/mailer/send-mail';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() dto: LoginDto) {
    return this.authService.authenticate(dto.email, dto.password);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('register-subeb-officer')
  @ApiOperation({ summary: 'Register a new SUBEB officer (role forced to SUBEB_OFFICER)' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'SUBEB officer registered successfully' })
  async registerSubebOfficer(@Body() dto: RegisterDto) {
    // Generate a random temporary password for the officer
    const tempPassword = Math.random().toString(36).slice(-10);

    // Force role to SUBEB_OFFICER regardless of what is sent in body
    const result = await this.authService.register({
      ...dto,
      password: tempPassword,
      role: UserRole.SUBEB_OFFICER,
    });

    // Fire-and-forget email (don't block response if email fails)
    const user = result?.data;
    if (
      user?.email &&
      user?.firstName &&
      user?.lastName &&
      (user.role === UserRole.SUPER_ADMIN ||
        user.role === UserRole.SUBEB_ADMIN ||
        user.role === UserRole.ADMIN ||
        user.role === UserRole.SUBEB_OFFICER)
    ) {
      sendSubebOfficerWelcomeEmail(user.email, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: tempPassword,
      }).catch(() => {
        // Swallow email errors; main registration should still succeed
      });
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile fetched successfully' })
  profile(@Request() req) {
    return this.authService.getProfile(req.user);
  }
}
