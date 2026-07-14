import { Controller, Get, Post, Patch, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { ExamOfficerService } from './exam-officer.service';

@ApiTags('exam-officer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUBEB_OFFICER)
@Controller('exam-officer')
export class ExamOfficerController {
  constructor(private readonly examOfficerService: ExamOfficerService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get analytics for Exam Officer dashboard' })
  async getDashboard(@Request() req) {
    return {
      success: true,
      data: await this.examOfficerService.getDashboardAnalytics(req.user.id),
    };
  }

  @Get('results')
  @ApiOperation({ summary: 'Get schools with results for the LGA Exam Officer' })
  @ApiQuery({ name: 'status', required: false, enum: ['ALL', 'AWAITING_APPROVAL', 'APPROVED'] })
  async getResults(@Request() req, @Query('status') status?: string) {
    return {
      success: true,
      data: await this.examOfficerService.getSchoolsWithResults(req.user.id, status),
    };
  }
  @Get('results/:schoolId')
  @ApiOperation({ summary: 'Get detailed results for a specific school' })
  async getSchoolResultsDetails(@Request() req, @Param('schoolId') schoolId: string) {
    return {
      success: true,
      data: await this.examOfficerService.getSchoolResultsDetails(req.user.id, schoolId),
    };
  }

  @Post('results/:schoolId/approve')
  @ApiOperation({ summary: 'Approve results for a specific school' })
  async approveResults(@Request() req, @Param('schoolId') schoolId: string) {
    return {
      success: true,
      data: await this.examOfficerService.approveSchoolResults(req.user.id, schoolId),
    };
  }

  @Post('results/:schoolId/reject')
  @ApiOperation({ summary: 'Reject results for a specific school' })
  async rejectResults(@Request() req, @Param('schoolId') schoolId: string) {
    return {
      success: true,
      data: await this.examOfficerService.rejectSchoolResults(req.user.id, schoolId),
    };
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get profile details' })
  async getProfile(@Request() req) {
    return {
      success: true,
      data: await this.examOfficerService.getProfile(req.user.id),
    };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update profile details' })
  async updateProfile(@Request() req, @Body() data: any) {
    return {
      success: true,
      data: await this.examOfficerService.updateProfile(req.user.id, data),
    };
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs of approvals and rejections' })
  async getAuditLogs(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    return {
      success: true,
      data: await this.examOfficerService.getAuditLogs(req.user.id, Number(page), Number(limit)),
    };
  }
}
