import { Controller, Get, Post, Patch, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { ExamOfficerService } from './exam-officer.service';
import { CreateSchoolItDto, UpdateSchoolItDto } from './dto/school-it.dto';

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

  @Get('lgas')
  @ApiOperation({ summary: 'Get current and past LGAs for the exam officer' })
  async getOfficerLgas(@Request() req) {
    return {
      success: true,
      data: await this.examOfficerService.getOfficerLgas(req.user.id),
    };
  }

  @Get('schools')
  @ApiOperation({ summary: 'Get active schools in the officer LGA jurisdiction' })
  @ApiQuery({ name: 'lgaId', required: false, type: String })
  async getSchools(@Request() req, @Query('lgaId') lgaId?: string) {
    return {
      success: true,
      data: await this.examOfficerService.getSchoolsInLga(req.user.id, lgaId),
    };
  }

  @Get('school-it')
  @ApiOperation({ summary: 'Get list of School IT personnels in the officer LGA jurisdiction' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'schoolId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['ALL', 'ACTIVE', 'INACTIVE'] })
  @ApiQuery({ name: 'lgaId', required: false, type: String })
  async getSchoolItPersonnel(
    @Request() req,
    @Query('search') search?: string,
    @Query('schoolId') schoolId?: string,
    @Query('status') status?: string,
    @Query('lgaId') lgaId?: string,
  ) {
    return {
      success: true,
      data: await this.examOfficerService.getSchoolItList(req.user.id, search, schoolId, status, lgaId),
    };
  }

  @Post('school-it')
  @ApiOperation({ summary: 'Create a new School IT personnel for a school in the officer LGA jurisdiction' })
  @ApiBody({ type: CreateSchoolItDto })
  async createSchoolItPersonnel(@Request() req, @Body() dto: CreateSchoolItDto) {
    return {
      success: true,
      data: await this.examOfficerService.createSchoolItPerson(req.user.id, dto),
    };
  }

  @Patch('school-it/:id')
  @ApiOperation({ summary: 'Update an existing School IT personnel' })
  @ApiBody({ type: UpdateSchoolItDto })
  async updateSchoolItPersonnel(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateSchoolItDto
  ) {
    return {
      success: true,
      data: await this.examOfficerService.updateSchoolItPerson(req.user.id, id, dto),
    };
  }

  @Patch('school-it/:id/toggle-status')
  @ApiOperation({ summary: 'Toggle status of a School IT personnel' })
  async toggleSchoolItStatus(@Request() req, @Param('id') id: string) {
    return {
      success: true,
      data: await this.examOfficerService.toggleSchoolItStatus(req.user.id, id),
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
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);
    return {
      success: true,
      data: await this.examOfficerService.getAuditLogs(req.user.id, pageNum, limitNum),
    };
  }
}
