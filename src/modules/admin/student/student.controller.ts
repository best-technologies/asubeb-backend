import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { StudentService } from './student.service';

@ApiTags('admin-student')
@Controller('admin/students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all students' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'schoolId', required: false, description: 'Filter by school ID' })
  @ApiResponse({ status: 200, description: 'Students retrieved successfully' })
  async getAllStudents(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('schoolId') schoolId?: string,
  ) {
    return this.studentService.getAllStudents(page, limit, schoolId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Student retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async getStudentById(@Param('id') id: string) {
    return this.studentService.getStudentById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new student' })
  @ApiResponse({ status: 201, description: 'Student created successfully' })
  async createStudent(@Body() createStudentDto: any) {
    return this.studentService.createStudent(createStudentDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Student updated successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async updateStudent(@Param('id') id: string, @Body() updateStudentDto: any) {
    return this.studentService.updateStudent(id, updateStudentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete student' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Student deleted successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async deleteStudent(@Param('id') id: string) {
    return this.studentService.deleteStudent(id);
  }

  @Get(':id/academic-record')
  @ApiOperation({ summary: 'Get student academic record' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Academic record retrieved successfully' })
  async getStudentAcademicRecord(@Param('id') id: string) {
    return this.studentService.getStudentAcademicRecord(id);
  }

  @Get(':id/assessment-breakdown')
  @ApiOperation({ summary: 'Get student assessment breakdown for debugging' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Assessment breakdown retrieved successfully' })
  async getStudentAssessmentBreakdown(@Param('id') id: string) {
    return this.studentService.getStudentAssessmentBreakdown(id);
  }
} 