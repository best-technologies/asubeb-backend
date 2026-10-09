import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
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
    @Query('status') status?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
  ) {
    return this.resultService.getResults(
      req.user.id,
      classId,
      status,
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 20,
      search,
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

  @Post('check-submission')
  @ApiOperation({ summary: 'Check submission readiness, blockers and warnings by class or student' })
  async checkSubmission(
    @Request() req,
    @Body() dto: { classIds?: string[]; studentId?: string },
  ) {
    return this.resultService.checkSubmission(req.user.id, req.user.stateId, dto);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit results for approval by class(es) or individual student' })
  async submitResultsForApproval(
    @Request() req,
    @Body() dto?: { classIds?: string[]; studentId?: string },
  ) {
    return this.resultService.submitResultsForApproval(req.user.id, req.user.stateId, dto);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Atomically upload manual or bulk results for students' })
  async uploadResults(@Request() req, @Body() data: UploadResultsDto) {
    return this.resultService.uploadResultsAtomic(req.user.id, req.user.stateId, data);
  }

  @Post('preview-bulk')
  @ApiOperation({ summary: 'Preview and AI-map student results from uploaded spreadsheet using bulk-d' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async previewBulkResults(
    @Request() req,
    @Body('classId') classId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Please provide a spreadsheet file (.csv or .xlsx).');
    }
    if (!classId) {
      throw new BadRequestException('Please provide a classId.');
    }
    return this.resultService.previewBulkResults(req.user.id, classId, file);
  }
}
