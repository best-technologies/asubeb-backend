import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { GradingService } from './grading.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  GradeEntrySchoolsResponseDto,
  GradeEntryClassesResponseDto,
  GradeEntryStudentsResponseDto,
  GradeEntryMetadataResponseDto,
} from './dto/grading-metadata.dto';
import {
  UploadResultsDto,
  UploadResultsResponseDto,
} from './dto/upload-results.dto';

@ApiTags('grading')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('grading')
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  @Get('metadata/grade-entry')
  @ApiOperation({
    summary: 'Fetch academic metadata for grade entry (SUBEB_OFFICER only)',
    description:
      'Returns current session, current term, all LGAs with school counts, and all available subjects for the state. Subjects are organized by level (PRIMARY and SECONDARY).',
  })
  @ApiOkResponse({
    description: 'Academic metadata retrieved successfully, including session, term, LGAs, and subjects',
    type: GradeEntryMetadataResponseDto,
  })
  async fetchAcademicMetadataForGradeEntry(@Req() req: any) {
    return this.gradingService.getAcademicMetadataForGradeEntry(req.user.stateId);
  }

  @Get('metadata/lgas/:lgaId/schools')
  @ApiOperation({ summary: 'Fetch all schools under a selected LGA for grade entry (SUBEB_OFFICER only)' })
  @ApiParam({ name: 'lgaId', description: 'Local Government Area ID' })
  @ApiOkResponse({
    description: 'Schools under the selected LGA retrieved successfully',
    type: GradeEntrySchoolsResponseDto,
  })
  async fetchSchoolsByLocalGovernment(@Req() req: any, @Param('lgaId') lgaId: string) {
    return this.gradingService.getSchoolsByLocalGovernment(req.user.stateId, lgaId);
  }

  @Get('metadata/schools/:schoolId/classes')
  @ApiOperation({ summary: 'Fetch all classes under a selected school for grade entry (SUBEB_OFFICER only)' })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiOkResponse({
    description: 'Classes under the selected school retrieved successfully',
    type: GradeEntryClassesResponseDto,
  })
  async fetchClassesBySchool(@Req() req: any, @Param('schoolId') schoolId: string) {
    return this.gradingService.getClassesBySchool(req.user.stateId, schoolId);
  }

  @Get('metadata/classes/:classId/students')
  @ApiOperation({ summary: 'Fetch all students under a selected class for grade entry (SUBEB_OFFICER only)' })
  @ApiParam({ name: 'classId', description: 'Class ID' })
  @ApiOkResponse({
    description: 'Students under the selected class retrieved successfully',
    type: GradeEntryStudentsResponseDto,
  })
  async fetchAllStudentsByClassId(@Req() req: any, @Param('classId') classId: string) {
    return this.gradingService.fetchAllStudentsByClassId(classId);
  }

  @Post('upload-results')
  @ApiOperation({
    summary: 'Upload results (assessments) for multiple students in a batch (SUBEB_OFFICER only)',
    description:
      'Uploads assessment results for one or more students. Validates session, term, LGA, school, class, students, and subjects. Processes students one by one and returns detailed success/failure information for each student. Scores must be between 0 and 100.',
  })
  @ApiOkResponse({
    description: 'Results upload completed with detailed success/failure information',
    type: UploadResultsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid entity IDs',
  })
  async uploadResults(@Req() req: any, @Body() uploadData: UploadResultsDto) {
    return this.gradingService.uploadResults(req.user.stateId, uploadData);
  }
} 