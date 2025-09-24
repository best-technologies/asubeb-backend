import { Controller, Get, Post, Put, Delete, Body, Param, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';
import { StudentService } from './student.service';
import { TermType } from '@prisma/client';

@ApiTags('admin-student')
@Controller('admin/students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('explorer')
  @ApiOperation({ summary: 'Cascading explorer for sessions/terms → LGAs → schools → classes → students' })
  @ApiQuery({ name: 'sessionId', required: false, description: 'Selected session ID' })
  @ApiQuery({ name: 'termId', required: false, description: 'Selected term ID' })
  @ApiQuery({ name: 'lgaId', required: false, description: 'Selected LGA ID' })
  @ApiQuery({ name: 'schoolId', required: false, description: 'Selected school ID' })
  @ApiQuery({ name: 'classId', required: false, description: 'Selected class ID' })
  @ApiQuery({ name: 'studentId', required: false, description: 'Selected student ID' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by student name, school, or LGA' })
  @ApiQuery({ name: 'page', required: false, description: 'Students page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Students per page (default: 10)', example: 10 })
  @ApiResponse({ status: 200, description: 'Explorer data retrieved successfully' })
  @ApiOkResponse({
    description: 'Explorer data with selections, filters, optional students, pagination, and totals',
    schema: {
      example: {
        success: true,
        message: 'Explorer data retrieved successfully',
        data: {
          selections: {
            session: { id: 'sess_1', name: '2024/2025' },
            term: { id: 'term_2', name: 'SECOND_TERM' },
            lga: { id: 'lga_1', name: 'Umuahia North' },
            school: { id: 'sch_1', name: 'Central Primary School' },
            class: { id: 'cls_5', name: 'Primary 5' },
            student: { id: 'stu_1', name: 'John Doe' },
          },
          sessions: [
            { id: 'sess_1', name: '2024/2025', isCurrent: true, terms: [ { id: 'term_1', name: 'FIRST_TERM', isCurrent: false } ] },
          ],
          lgas: [ { id: 'lga_1', name: 'Umuahia North', code: 'UMN', state: 'Abia' } ],
          schools: [ { id: 'sch_1', name: 'Central Primary School', code: 'CPS', level: 'PRIMARY' } ],
          classes: [ { id: 'cls_5', name: 'Primary 5', grade: 5, section: 'A' } ],
          students: [ { id: 'stu_1', firstName: 'John', lastName: 'Doe', studentId: 'STU123', gender: 'MALE', email: 'john@example.com' } ],
          pagination: { page: 1, limit: 10, total: 57, totalPages: 6 },
          totals: { schools: 1000, classes: 9, students: 57 },
          lastUpdated: '2025-09-22T12:00:00.000Z',
        },
      },
    },
  })
  async getStudentExplorer(
    @Query('sessionId') sessionId?: string,
    @Query('termId') termId?: string,
    @Query('lgaId') lgaId?: string,
    @Query('schoolId') schoolId?: string,
    @Query('classId') classId?: string,
    @Query('studentId') studentId?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.studentService.getStudentExplorer({ sessionId, termId, lgaId, schoolId, classId, studentId, search, page, limit });
  }

  // Alias for convenience: /admin/students/explore (maps to explorer)
  @Get('explore')
  @ApiOperation({ summary: 'Alias of explorer endpoint' })
  @ApiQuery({ name: 'sessionId', required: false })
  @ApiQuery({ name: 'termId', required: false })
  @ApiQuery({ name: 'lgaId', required: false })
  @ApiQuery({ name: 'schoolId', required: false })
  @ApiQuery({ name: 'classId', required: false })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Explorer data retrieved successfully' })
  @ApiOkResponse({
    description: 'Explorer data (alias)',
  })
  async getStudentExploreAlias(
    @Query('sessionId') sessionId?: string,
    @Query('termId') termId?: string,
    @Query('lgaId') lgaId?: string,
    @Query('schoolId') schoolId?: string,
    @Query('classId') classId?: string,
    @Query('studentId') studentId?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.studentService.getStudentExplorer({ sessionId, termId, lgaId, schoolId, classId, studentId, search, page, limit });
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get student dashboard data with advanced filtering' })
  @ApiQuery({ name: 'session', required: false, description: 'Academic session (e.g., 2024/2025)' })
  @ApiQuery({ name: 'term', required: false, description: 'Academic term (FIRST_TERM, SECOND_TERM, THIRD_TERM)' })
  @ApiQuery({ name: 'schoolId', required: false, description: 'Filter by school ID' })
  @ApiQuery({ name: 'classId', required: false, description: 'Filter by class ID' })
  @ApiQuery({ name: 'subject', required: false, description: 'Filter by subject name' })
  @ApiQuery({ name: 'gender', required: false, description: 'Gender (MALE, FEMALE, OTHER)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by student name or ID' })
  @ApiResponse({ status: 200, description: 'Student dashboard data retrieved successfully' })
  async getStudentDashboard(
    @Query('session') session?: string,
    @Query('term') term?: string,
    @Query('schoolId') schoolId?: string,
    @Query('classId') classId?: string,
    @Query('subject') subject?: string,
    @Query('gender') gender?: string,
    @Query('search') search?: string,
  ) {
    const filters = {
      session,
      term: term as TermType,
      schoolId,
      classId,
      subject,
      gender,
      search,
    };

    return this.studentService.getStudentDashboard(filters);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search, filter, and paginate students with comprehensive options' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search by student name, ID, or email' })
  @ApiQuery({ name: 'lgaId', required: false, description: 'Filter by Local Government Area ID' })
  @ApiQuery({ name: 'schoolId', required: false, description: 'Filter by school ID' })
  @ApiQuery({ name: 'classId', required: false, description: 'Filter by class ID' })
  @ApiQuery({ name: 'gender', required: false, description: 'Filter by gender (MALE, FEMALE, OTHER)' })
  @ApiQuery({ name: 'subject', required: false, description: 'Filter by subject name' })
  @ApiQuery({ name: 'session', required: false, description: 'Academic session (e.g., 2023-2024)' })
  @ApiQuery({ name: 'term', required: false, description: 'Academic term (FIRST_TERM, SECOND_TERM, THIRD_TERM)' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort by field (firstName, lastName, studentId, email, gender, enrollmentDate)', example: 'firstName' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc, desc)', example: 'asc' })
  @ApiResponse({ status: 200, description: 'Students retrieved successfully' })
  async searchFilterPaginationStudents(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('lgaId') lgaId?: string,
    @Query('schoolId') schoolId?: string,
    @Query('classId') classId?: string,
    @Query('gender') gender?: string,
    @Query('subject') subject?: string,
    @Query('session') session?: string,
    @Query('term') term?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.studentService.searchFilterPaginationStudents({
      page,
      limit,
      search,
      lgaId,
      schoolId,
      classId,
      gender,
      subject,
      session,
      term: term as TermType,
      sortBy,
      sortOrder,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all students (legacy endpoint)' })
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

  // Place static routes BEFORE dynamic ':id' to avoid conflicts
  @Get('class-result.pdf')
  @ApiOperation({ summary: 'Download class results PDF (landscape table): students x subjects' })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School ID' })
  @ApiQuery({ name: 'classId', required: true, description: 'Class ID' })
  @ApiQuery({ name: 'sessionId', required: false, description: 'Optional session ID' })
  @ApiQuery({ name: 'termId', required: false, description: 'Optional term ID' })
  @ApiOkResponse({ description: 'PDF binary stream' })
  async downloadClassResultsPdf(
    @Query('schoolId') schoolId: string,
    @Query('classId') classId: string,
    @Query('sessionId') sessionId: string | undefined,
    @Query('termId') termId: string | undefined,
    @Res() res: ExpressResponse,
  ) {
    const { pdf, filename } = await this.studentService.getClassResultsPdf({ schoolId, classId, sessionId, termId });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(pdf);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Student retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async getStudentById(@Param('id') id: string) {
    return this.studentService.getStudentById(id);
  }

  
  @Get(':id/result.pdf')
  @ApiOperation({ summary: 'Download student result as PDF for current (or specified) session/term' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiQuery({ name: 'sessionId', required: false, description: 'Optional session ID to filter assessments' })
  @ApiQuery({ name: 'termId', required: false, description: 'Optional term ID to filter assessments' })
  @ApiOkResponse({ description: 'PDF binary stream' })
  async downloadStudentResultPdf(
    @Param('id') id: string,
    @Query('sessionId') sessionId: string | undefined,
    @Query('termId') termId: string | undefined,
    @Res() res: ExpressResponse,
  ) {
    const { pdf, filename } = await this.studentService.getStudentResultPdf(id, { sessionId, termId });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(pdf);
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