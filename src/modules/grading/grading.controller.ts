import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { GradingService } from './grading.service';

@ApiTags('grading')
@Controller('grading')
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  @Get('students/:studentId/grades')
  @ApiOperation({ summary: 'Get student grades' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiQuery({ name: 'subject', required: false, description: 'Filter by subject' })
  @ApiQuery({ name: 'semester', required: false, description: 'Filter by semester' })
  @ApiResponse({ status: 200, description: 'Student grades retrieved successfully' })
  async getStudentGrades(
    @Param('studentId') studentId: string,
    @Query('subject') subject?: string,
    @Query('semester') semester?: string,
  ) {
    return this.gradingService.getStudentGrades(studentId, subject, semester);
  }

  @Post('students/:studentId/grades')
  @ApiOperation({ summary: 'Add student grade' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 201, description: 'Grade added successfully' })
  async addStudentGrade(@Param('studentId') studentId: string, @Body() gradeData: any) {
    return this.gradingService.addStudentGrade(studentId, gradeData);
  }

  @Put('students/:studentId/grades/:gradeId')
  @ApiOperation({ summary: 'Update student grade' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiParam({ name: 'gradeId', description: 'Grade ID' })
  @ApiResponse({ status: 200, description: 'Grade updated successfully' })
  async updateStudentGrade(
    @Param('studentId') studentId: string,
    @Param('gradeId') gradeId: string,
    @Body() gradeData: any,
  ) {
    return this.gradingService.updateStudentGrade(studentId, gradeId, gradeData);
  }

  @Get('classes/:classId/grades')
  @ApiOperation({ summary: 'Get class grades' })
  @ApiParam({ name: 'classId', description: 'Class ID' })
  @ApiQuery({ name: 'subject', required: false, description: 'Filter by subject' })
  @ApiResponse({ status: 200, description: 'Class grades retrieved successfully' })
  async getClassGrades(
    @Param('classId') classId: string,
    @Query('subject') subject?: string,
  ) {
    return this.gradingService.getClassGrades(classId, subject);
  }

  @Post('classes/:classId/grades/bulk')
  @ApiOperation({ summary: 'Add bulk grades for class' })
  @ApiParam({ name: 'classId', description: 'Class ID' })
  @ApiResponse({ status: 201, description: 'Bulk grades added successfully' })
  async addBulkGrades(@Param('classId') classId: string, @Body() gradesData: any) {
    return this.gradingService.addBulkGrades(classId, gradesData);
  }

  @Get('subjects')
  @ApiOperation({ summary: 'Get all subjects' })
  @ApiResponse({ status: 200, description: 'Subjects retrieved successfully' })
  async getSubjects() {
    return this.gradingService.getSubjects();
  }

  @Get('grade-scales')
  @ApiOperation({ summary: 'Get grade scales' })
  @ApiResponse({ status: 200, description: 'Grade scales retrieved successfully' })
  async getGradeScales() {
    return this.gradingService.getGradeScales();
  }

  @Get('reports/class/:classId')
  @ApiOperation({ summary: 'Get class grade report' })
  @ApiParam({ name: 'classId', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class grade report generated successfully' })
  async getClassGradeReport(@Param('classId') classId: string) {
    return this.gradingService.getClassGradeReport(classId);
  }

  @Get('reports/student/:studentId')
  @ApiOperation({ summary: 'Get student grade report' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Student grade report generated successfully' })
  async getStudentGradeReport(@Param('studentId') studentId: string) {
    return this.gradingService.getStudentGradeReport(studentId);
  }
} 