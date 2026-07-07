import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { SchoolItDashboardService } from './dashboard.service';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('school-it-dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SCHOOL_IT)
@Controller('school-it/dashboard')
export class SchoolItDashboardController {
  constructor(private readonly dashboardService: SchoolItDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get School-IT dashboard analytics' })
  async getDashboardAnalytics(@Request() req) {
    return this.dashboardService.getDashboardAnalytics(req.user.id);
  }
}
