import { Controller, Get, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnrollmentService } from './enrollment.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { EnrollOfficerDto } from '../subeb-officers/dto';
import { EnrollSingleOrBulkStudentsDto } from './dto/enroll-student.dto';
import {
  EnrollStudentsResponseDto,
  EnrollSubebOfficerResponseDto,
  StudentEnrollmentClassesResponseDto,
  StudentEnrollmentMetadataResponseDto,
  StudentEnrollmentSchoolsResponseDto,
} from './dto/enrollment-metadata.dto';

@ApiTags('admin-enrollment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Get('health')
  @ApiOperation({ summary: 'Enrollment module health check' })
  async healthCheck() {
    return this.enrollmentService.healthCheck();
  }

  @Get('students/enrollment/metadata')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SUBEB_ADMIN')
  @ApiOperation({ summary: 'Fetch academic metadata for student enrollment (current user state)' })
  @ApiOkResponse({
    description: 'Student enrollment metadata retrieved successfully',
    type: StudentEnrollmentMetadataResponseDto,
  })
  async getStudentEnrollmentMetadata(@Req() req: any) {
    return this.enrollmentService.getStudentEnrollmentMetadata(req.user);
  }

  @Get('students/enrollment/lgas/:lgaId/schools')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SUBEB_ADMIN')
  @ApiOperation({ summary: 'Fetch schools under an LGA for student enrollment' })
  @ApiParam({ name: 'lgaId', description: 'Local Government Area ID' })
  @ApiOkResponse({
    description: 'Schools for student enrollment retrieved successfully',
    type: StudentEnrollmentSchoolsResponseDto,
  })
  async getSchoolsForStudentEnrollment(@Req() req: any, @Param('lgaId') lgaId: string) {
    return this.enrollmentService.getSchoolsForStudentEnrollment(req.user, lgaId);
  }

  @Get('students/enrollment/schools/:schoolId/classes')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SUBEB_ADMIN')
  @ApiOperation({ summary: 'Fetch classes under a school for student enrollment' })
  @ApiParam({ name: 'schoolId', description: 'School ID' })
  @ApiOkResponse({
    description: 'Classes for student enrollment retrieved successfully',
    type: StudentEnrollmentClassesResponseDto,
  })
  async getClassesForStudentEnrollment(@Req() req: any, @Param('schoolId') schoolId: string) {
    return this.enrollmentService.getClassesForStudentEnrollment(req.user, schoolId);
  }

  @Post('subeb-officers/enroll')
  @Roles('SUBEB_ADMIN', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Enroll a new SUBEB officer (role forced to SUBEB_OFFICER)' })
  @ApiBody({ type: EnrollOfficerDto })
  @ApiResponse({
    status: 201,
    description: 'SUBEB officer enrolled successfully',
    type: EnrollSubebOfficerResponseDto,
  })
  async enrollNewSubebOfficer(@Req() req: any, @Body() dto: EnrollOfficerDto) {
    return this.enrollmentService.enrollNewSubebOfficer(dto, req.user);
  }

  @Post('students/enrollsingleorbulkstudents')
  @Roles('SUPER_ADMIN', 'ADMIN', 'SUBEB_ADMIN')
  @ApiOperation({ summary: 'Enroll single or multiple students into a school and class' })
  @ApiBody({ type: EnrollSingleOrBulkStudentsDto })
  @ApiResponse({
    status: 201,
    description: 'Students enrolled successfully',
    type: EnrollStudentsResponseDto,
  })
  async enrollSingleOrBulkStudents(@Req() req: any, @Body() payload: EnrollSingleOrBulkStudentsDto) {
    return this.enrollmentService.enrollSingleOrBulkStudents(payload, req.user);
  }
}
