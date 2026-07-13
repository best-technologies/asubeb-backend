import { Controller, Get, Post, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { SchoolItResultService } from './result.service';
import { UploadResultsDto } from '../../grading/dto/upload-results.dto';

@ApiTags('school-it-result')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SCHOOL_IT)
@Controller('school-it/results')
export class SchoolItResultController {
  constructor(private readonly resultService: SchoolItResultService) {}

  @Get('subjects')
  @ApiOperation({ summary: 'Get all subjects available for the School-IT assigned school level' })
  async getSubjects(@Request() req) {
    return this.resultService.getSubjects(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of results for students in the School-IT assigned school' })
  async getResults(
    @Request() req,
    @Query('classId') classId?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.resultService.getResults(
      req.user.id,
      classId,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get(':studentId')
  @ApiOperation({ summary: 'Get results for a specific student' })
  async getStudentResults(
    @Request() req,
    @Param('studentId') studentId: string,
  ) {
    return this.resultService.getStudentResults(req.user.id, studentId);
  }

  @Get('check/missing')
  @ApiOperation({ summary: 'Check if there are missing results for the active term' })
  async checkMissingResults(@Request() req) {
    return this.resultService.checkMissingResults(req.user.id, req.user.stateId);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit all draft results for approval' })
  async submitResultsForApproval(@Request() req) {
    return this.resultService.submitResultsForApproval(req.user.id, req.user.stateId);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Atomically upload manual or bulk results for students' })
  async uploadResults(@Request() req, @Body() data: UploadResultsDto) {
    return this.resultService.uploadResultsAtomic(req.user.id, req.user.stateId, data);
  }
}
