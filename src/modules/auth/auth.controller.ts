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
    // Default role for generic registration is USER
    return this.authService.register(dto);
  }

  @Post('register-subeb-officer')
  @ApiOperation({ summary: 'Register a new SUBEB officer (role forced to SUBEB_OFFICER)' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'SUBEB officer registered successfully' })
  async registerSubebOfficer(@Body() dto: RegisterDto) {
    return this.authService.registerSubebOfficer(dto);
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
