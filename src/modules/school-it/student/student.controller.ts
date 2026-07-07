import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { SchoolItStudentService } from './student.service';
import { CreateStudentDto } from '../../admin/student/dto/create-student.dto';

@ApiTags('school-it-student')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SCHOOL_IT)
@Controller('school-it/students')
export class SchoolItStudentController {
  constructor(private readonly studentService: SchoolItStudentService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of students in the School-IT assigned school' })
  async getStudents(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
  ) {
    return this.studentService.getStudents(
      req.user.id,
      parseInt(page, 10),
      parseInt(limit, 10),
      search,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Enrol a new student' })
  async enrolStudent(@Request() req, @Body() data: CreateStudentDto) {
    return this.studentService.enrolStudent(req.user.id, req.user.stateId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing student' })
  async updateStudent(
    @Request() req,
    @Param('id') id: string,
    @Body() data: Partial<CreateStudentDto>,
  ) {
    return this.studentService.updateStudent(req.user.id, id, data);
  }
}
