import { Controller, Get, Post, Put, Delete, Body, Param, Query, Res, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiOkResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';
import { StudentService } from './student.service';
import { 
  CreateStudentDto, 
  UpdateStudentDto, 
  StudentResponseDto, 
  StudentExplorerResponseDto, 
  StudentDashboardResponseDto,
  StudentListResponseDto,
  StudentDashboardQueryDto
} from './dto';
import { TermType } from '@prisma/client';

@ApiTags('admin-student')
@Controller('admin/students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('explorer')
  @ApiOperation({ summary: 'Cascading explorer for sessions/terms → LGAs → schools → classes → students' })
  @ApiQuery({ name: 'sessionId', required: false, description: 'Selected session ID', example: 'session-uuid-123' })
  @ApiQuery({ name: 'termId', required: false, description: 'Selected term ID', example: 'term-uuid-456' })
  @ApiQuery({ name: 'lgaId', required: false, description: 'Selected LGA ID', example: 'lga-uuid-789' })
  @ApiQuery({ name: 'schoolId', required: false, description: 'Selected school ID', example: 'school-uuid-101' })
  @ApiQuery({ name: 'classId', required: false, description: 'Selected class ID', example: 'class-uuid-202' })
  @ApiQuery({ name: 'studentId', required: false, description: 'Selected student ID', example: 'student-uuid-303' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by student name, school, or LGA', example: 'John' })
  @ApiQuery({ name: 'page', required: false, description: 'Students page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Students per page (default: 10)', example: 10 })
  @ApiResponse({ status: 200, description: 'Explorer data retrieved successfully', type: StudentExplorerResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - invalid parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiQuery({ name: 'sessionId', required: false, description: 'Selected session ID', example: 'session-uuid-123' })
  @ApiQuery({ name: 'termId', required: false, description: 'Selected term ID', example: 'term-uuid-456' })
  @ApiQuery({ name: 'lgaId', required: false, description: 'Selected LGA ID', example: 'lga-uuid-789' })
  @ApiQuery({ name: 'schoolId', required: false, description: 'Selected school ID', example: 'school-uuid-101' })
  @ApiQuery({ name: 'classId', required: false, description: 'Selected class ID', example: 'class-uuid-202' })
  @ApiQuery({ name: 'studentId', required: false, description: 'Selected student ID', example: 'student-uuid-303' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by student name, school, or LGA', example: 'John' })
  @ApiQuery({ name: 'page', required: false, description: 'Students page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Students per page (default: 10)', example: 10 })
  @ApiResponse({ status: 200, description: 'Explorer data retrieved successfully', type: StudentExplorerResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - invalid parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiOperation({ 
    summary: 'Get student dashboard data with progressive loading',
    description: 'Progressively loads dashboard data based on provided filters. Without any filters, returns current session and term. With LGA ID, returns schools in that LGA. With school ID, returns classes in that school. With class ID, returns paginated students in that class.'
  })
  @ApiQuery({ name: 'session', required: false, description: 'Academic session (e.g., 2024/2025)', example: '2024/2025' })
  @ApiQuery({ name: 'term', required: false, description: 'Academic term (FIRST_TERM, SECOND_TERM, THIRD_TERM)', example: 'FIRST_TERM' })
  @ApiQuery({ name: 'lgaId', required: false, description: 'Filter by LGA ID to get schools', example: 'lga-uuid-123' })
  @ApiQuery({ name: 'schoolId', required: false, description: 'Filter by school ID to get classes', example: 'school-uuid-123' })
  @ApiQuery({ name: 'classId', required: false, description: 'Filter by class ID to get students', example: 'class-uuid-456' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for student list', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page for student list', example: 10 })
  @ApiQuery({ name: 'gender', required: false, description: 'Gender (MALE, FEMALE, OTHER)', example: 'MALE' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by student name or ID', example: 'John' })
  @ApiResponse({ status: 200, description: 'Student dashboard data retrieved successfully', type: StudentDashboardResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - invalid parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getStudentDashboard(@Query() query: StudentDashboardQueryDto) {
    return this.studentService.getStudentDashboard(query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search, filter, and paginate students with comprehensive options' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search by student name, ID, or email', example: 'John' })
  @ApiQuery({ name: 'lgaId', required: false, description: 'Filter by Local Government Area ID', example: 'lga-uuid-123' })
  @ApiQuery({ name: 'schoolId', required: false, description: 'Filter by school ID', example: 'school-uuid-456' })
  @ApiQuery({ name: 'classId', required: false, description: 'Filter by class ID', example: 'class-uuid-789' })
  @ApiQuery({ name: 'gender', required: false, description: 'Filter by gender (MALE, FEMALE, OTHER)', example: 'MALE' })
  @ApiQuery({ name: 'subject', required: false, description: 'Filter by subject name', example: 'Mathematics' })
  @ApiQuery({ name: 'session', required: false, description: 'Academic session (e.g., 2024/2025)', example: '2024/2025' })
  @ApiQuery({ name: 'term', required: false, description: 'Academic term (FIRST_TERM, SECOND_TERM, THIRD_TERM)', example: 'FIRST_TERM' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort by field (firstName, lastName, studentId, email, gender, enrollmentDate)', example: 'firstName' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc, desc)', example: 'asc' })
  @ApiResponse({ status: 200, description: 'Students retrieved successfully', type: StudentListResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - invalid parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'schoolId', required: false, description: 'Filter by school ID', example: 'school-uuid-123' })
  @ApiResponse({ status: 200, description: 'Students retrieved successfully', type: StudentListResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - invalid parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiQuery({ name: 'schoolId', required: true, description: 'School ID', example: 'school-uuid-123' })
  @ApiQuery({ name: 'classId', required: true, description: 'Class ID', example: 'class-uuid-456' })
  @ApiQuery({ name: 'sessionId', required: false, description: 'Optional session ID', example: 'session-uuid-789' })
  @ApiQuery({ name: 'termId', required: false, description: 'Optional term ID', example: 'term-uuid-101' })
  @ApiOkResponse({ description: 'PDF binary stream', content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 400, description: 'Bad request - missing required parameters' })
  @ApiResponse({ status: 404, description: 'School or class not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiParam({ name: 'id', description: 'Student ID', example: 'student-uuid-123' })
  @ApiResponse({ status: 200, description: 'Student retrieved successfully', type: StudentResponseDto })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid student ID' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getStudentById(@Param('id') id: string) {
    return this.studentService.getStudentById(id);
  }

  
  @Get(':id/result.pdf')
  @ApiOperation({ summary: 'Download student result as PDF for current (or specified) session/term' })
  @ApiParam({ name: 'id', description: 'Student ID', example: 'student-uuid-123' })
  @ApiQuery({ name: 'sessionId', required: false, description: 'Optional session ID to filter assessments', example: 'session-uuid-456' })
  @ApiQuery({ name: 'termId', required: false, description: 'Optional term ID to filter assessments', example: 'term-uuid-789' })
  @ApiOkResponse({ description: 'PDF binary stream', content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiBody({ type: CreateStudentDto })
  @ApiResponse({ status: 201, description: 'Student created successfully', type: StudentResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'Conflict - student with this ID already exists' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createStudent(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.createStudent(createStudentDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update student' })
  @ApiParam({ name: 'id', description: 'Student ID', example: 'student-uuid-123' })
  @ApiBody({ type: UpdateStudentDto })
  @ApiResponse({ status: 200, description: 'Student updated successfully', type: StudentResponseDto })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateStudent(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.updateStudent(id, updateStudentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete student' })
  @ApiParam({ name: 'id', description: 'Student ID', example: 'student-uuid-123' })
  @ApiResponse({ status: 200, description: 'Student deleted successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid student ID' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteStudent(@Param('id') id: string) {
    return this.studentService.deleteStudent(id);
  }

  @Get(':id/academic-record')
  @ApiOperation({ summary: 'Get student academic record' })
  @ApiParam({ name: 'id', description: 'Student ID', example: 'student-uuid-123' })
  @ApiResponse({ status: 200, description: 'Academic record retrieved successfully', type: StudentResponseDto })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid student ID' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getStudentAcademicRecord(@Param('id') id: string) {
    return this.studentService.getStudentAcademicRecord(id);
  }

  @Get(':id/assessment-breakdown')
  @ApiOperation({ summary: 'Get student assessment breakdown for debugging' })
  @ApiParam({ name: 'id', description: 'Student ID', example: 'student-uuid-123' })
  @ApiResponse({ status: 200, description: 'Assessment breakdown retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid student ID' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getStudentAssessmentBreakdown(@Param('id') id: string) {
    return this.studentService.getStudentAssessmentBreakdown(id);
  }
} 