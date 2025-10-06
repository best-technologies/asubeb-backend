"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const student_service_1 = require("./student.service");
const dto_1 = require("./dto");
let StudentController = class StudentController {
    studentService;
    constructor(studentService) {
        this.studentService = studentService;
    }
    async getStudentExplorer(sessionId, termId, lgaId, schoolId, classId, studentId, search, page = 1, limit = 10) {
        return this.studentService.getStudentExplorer({ sessionId, termId, lgaId, schoolId, classId, studentId, search, page, limit });
    }
    async getStudentExploreAlias(sessionId, termId, lgaId, schoolId, classId, studentId, search, page = 1, limit = 10) {
        return this.studentService.getStudentExplorer({ sessionId, termId, lgaId, schoolId, classId, studentId, search, page, limit });
    }
    async getStudentDashboard(query) {
        return this.studentService.getStudentDashboard(query);
    }
    async searchFilterPaginationStudents(page = 1, limit = 10, search, lgaId, schoolId, classId, gender, subject, session, term, sortBy, sortOrder) {
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
            term: term,
            sortBy,
            sortOrder,
        });
    }
    async getAllStudents(page = 1, limit = 10, schoolId) {
        return this.studentService.getAllStudents(page, limit, schoolId);
    }
    async downloadClassResultsPdf(schoolId, classId, sessionId, termId, res) {
        const { pdf, filename } = await this.studentService.getClassResultsPdf({ schoolId, classId, sessionId, termId });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(pdf);
    }
    async getStudentById(id) {
        return this.studentService.getStudentById(id);
    }
    async downloadStudentResultPdf(id, sessionId, termId, res) {
        const { pdf, filename } = await this.studentService.getStudentResultPdf(id, { sessionId, termId });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(pdf);
    }
    async createStudent(createStudentDto) {
        return this.studentService.createStudent(createStudentDto);
    }
    async updateStudent(id, updateStudentDto) {
        return this.studentService.updateStudent(id, updateStudentDto);
    }
    async deleteStudent(id) {
        return this.studentService.deleteStudent(id);
    }
    async getStudentAcademicRecord(id) {
        return this.studentService.getStudentAcademicRecord(id);
    }
    async getStudentAssessmentBreakdown(id) {
        return this.studentService.getStudentAssessmentBreakdown(id);
    }
};
exports.StudentController = StudentController;
__decorate([
    (0, common_1.Get)('explorer'),
    (0, swagger_1.ApiOperation)({ summary: 'Cascading explorer for sessions/terms → LGAs → schools → classes → students' }),
    (0, swagger_1.ApiQuery)({ name: 'sessionId', required: false, description: 'Selected session ID', example: 'session-uuid-123' }),
    (0, swagger_1.ApiQuery)({ name: 'termId', required: false, description: 'Selected term ID', example: 'term-uuid-456' }),
    (0, swagger_1.ApiQuery)({ name: 'lgaId', required: false, description: 'Selected LGA ID', example: 'lga-uuid-789' }),
    (0, swagger_1.ApiQuery)({ name: 'schoolId', required: false, description: 'Selected school ID', example: 'school-uuid-101' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false, description: 'Selected class ID', example: 'class-uuid-202' }),
    (0, swagger_1.ApiQuery)({ name: 'studentId', required: false, description: 'Selected student ID', example: 'student-uuid-303' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search by student name, school, or LGA', example: 'John' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Students page number (default: 1)', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Students per page (default: 10)', example: 10 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Explorer data retrieved successfully', type: dto_1.StudentExplorerResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - invalid parameters' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Query)('sessionId')),
    __param(1, (0, common_1.Query)('termId')),
    __param(2, (0, common_1.Query)('lgaId')),
    __param(3, (0, common_1.Query)('schoolId')),
    __param(4, (0, common_1.Query)('classId')),
    __param(5, (0, common_1.Query)('studentId')),
    __param(6, (0, common_1.Query)('search')),
    __param(7, (0, common_1.Query)('page')),
    __param(8, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getStudentExplorer", null);
__decorate([
    (0, common_1.Get)('explore'),
    (0, swagger_1.ApiOperation)({ summary: 'Alias of explorer endpoint' }),
    (0, swagger_1.ApiQuery)({ name: 'sessionId', required: false, description: 'Selected session ID', example: 'session-uuid-123' }),
    (0, swagger_1.ApiQuery)({ name: 'termId', required: false, description: 'Selected term ID', example: 'term-uuid-456' }),
    (0, swagger_1.ApiQuery)({ name: 'lgaId', required: false, description: 'Selected LGA ID', example: 'lga-uuid-789' }),
    (0, swagger_1.ApiQuery)({ name: 'schoolId', required: false, description: 'Selected school ID', example: 'school-uuid-101' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false, description: 'Selected class ID', example: 'class-uuid-202' }),
    (0, swagger_1.ApiQuery)({ name: 'studentId', required: false, description: 'Selected student ID', example: 'student-uuid-303' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search by student name, school, or LGA', example: 'John' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Students page number (default: 1)', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Students per page (default: 10)', example: 10 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Explorer data retrieved successfully', type: dto_1.StudentExplorerResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - invalid parameters' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Query)('sessionId')),
    __param(1, (0, common_1.Query)('termId')),
    __param(2, (0, common_1.Query)('lgaId')),
    __param(3, (0, common_1.Query)('schoolId')),
    __param(4, (0, common_1.Query)('classId')),
    __param(5, (0, common_1.Query)('studentId')),
    __param(6, (0, common_1.Query)('search')),
    __param(7, (0, common_1.Query)('page')),
    __param(8, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getStudentExploreAlias", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get student dashboard data with progressive loading',
        description: 'Progressively loads dashboard data based on provided filters. Without any filters, returns current session and term. With LGA ID, returns schools in that LGA. With school ID, returns classes in that school. With class ID, returns paginated students in that class.'
    }),
    (0, swagger_1.ApiQuery)({ name: 'session', required: false, description: 'Academic session (e.g., 2024/2025)', example: '2024/2025' }),
    (0, swagger_1.ApiQuery)({ name: 'term', required: false, description: 'Academic term (FIRST_TERM, SECOND_TERM, THIRD_TERM)', example: 'FIRST_TERM' }),
    (0, swagger_1.ApiQuery)({ name: 'lgaId', required: false, description: 'Filter by LGA ID to get schools', example: 'lga-uuid-123' }),
    (0, swagger_1.ApiQuery)({ name: 'schoolId', required: false, description: 'Filter by school ID to get classes', example: 'school-uuid-123' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false, description: 'Filter by class ID to get students', example: 'class-uuid-456' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number for student list', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page for student list', example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'gender', required: false, description: 'Gender (MALE, FEMALE, OTHER)', example: 'MALE' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search by student name or ID', example: 'John' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student dashboard data retrieved successfully', type: dto_1.StudentDashboardResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - invalid parameters' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.StudentDashboardQueryDto]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getStudentDashboard", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search, filter, and paginate students with comprehensive options' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page (default: 10)', example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search by student name, ID, or email', example: 'John' }),
    (0, swagger_1.ApiQuery)({ name: 'lgaId', required: false, description: 'Filter by Local Government Area ID', example: 'lga-uuid-123' }),
    (0, swagger_1.ApiQuery)({ name: 'schoolId', required: false, description: 'Filter by school ID', example: 'school-uuid-456' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false, description: 'Filter by class ID', example: 'class-uuid-789' }),
    (0, swagger_1.ApiQuery)({ name: 'gender', required: false, description: 'Filter by gender (MALE, FEMALE, OTHER)', example: 'MALE' }),
    (0, swagger_1.ApiQuery)({ name: 'subject', required: false, description: 'Filter by subject name', example: 'Mathematics' }),
    (0, swagger_1.ApiQuery)({ name: 'session', required: false, description: 'Academic session (e.g., 2024/2025)', example: '2024/2025' }),
    (0, swagger_1.ApiQuery)({ name: 'term', required: false, description: 'Academic term (FIRST_TERM, SECOND_TERM, THIRD_TERM)', example: 'FIRST_TERM' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, description: 'Sort by field (firstName, lastName, studentId, email, gender, enrollmentDate)', example: 'firstName' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, description: 'Sort order (asc, desc)', example: 'asc' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Students retrieved successfully', type: dto_1.StudentListResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - invalid parameters' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('lgaId')),
    __param(4, (0, common_1.Query)('schoolId')),
    __param(5, (0, common_1.Query)('classId')),
    __param(6, (0, common_1.Query)('gender')),
    __param(7, (0, common_1.Query)('subject')),
    __param(8, (0, common_1.Query)('session')),
    __param(9, (0, common_1.Query)('term')),
    __param(10, (0, common_1.Query)('sortBy')),
    __param(11, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "searchFilterPaginationStudents", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all students (legacy endpoint)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page', example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'schoolId', required: false, description: 'Filter by school ID', example: 'school-uuid-123' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Students retrieved successfully', type: dto_1.StudentListResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - invalid parameters' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getAllStudents", null);
__decorate([
    (0, common_1.Get)('class-result.pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Download class results PDF (landscape table): students x subjects' }),
    (0, swagger_1.ApiQuery)({ name: 'schoolId', required: true, description: 'School ID', example: 'school-uuid-123' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: true, description: 'Class ID', example: 'class-uuid-456' }),
    (0, swagger_1.ApiQuery)({ name: 'sessionId', required: false, description: 'Optional session ID', example: 'session-uuid-789' }),
    (0, swagger_1.ApiQuery)({ name: 'termId', required: false, description: 'Optional term ID', example: 'term-uuid-101' }),
    (0, swagger_1.ApiOkResponse)({ description: 'PDF binary stream', content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - missing required parameters' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'School or class not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Query)('schoolId')),
    __param(1, (0, common_1.Query)('classId')),
    __param(2, (0, common_1.Query)('sessionId')),
    __param(3, (0, common_1.Query)('termId')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "downloadClassResultsPdf", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Student ID', example: 'student-uuid-123' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student retrieved successfully', type: dto_1.StudentResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - invalid student ID' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getStudentById", null);
__decorate([
    (0, common_1.Get)(':id/result.pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Download student result as PDF for current (or specified) session/term' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Student ID', example: 'student-uuid-123' }),
    (0, swagger_1.ApiQuery)({ name: 'sessionId', required: false, description: 'Optional session ID to filter assessments', example: 'session-uuid-456' }),
    (0, swagger_1.ApiQuery)({ name: 'termId', required: false, description: 'Optional term ID to filter assessments', example: 'term-uuid-789' }),
    (0, swagger_1.ApiOkResponse)({ description: 'PDF binary stream', content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - invalid parameters' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('sessionId')),
    __param(2, (0, common_1.Query)('termId')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "downloadStudentResultPdf", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new student' }),
    (0, swagger_1.ApiBody)({ type: dto_1.CreateStudentDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Student created successfully', type: dto_1.StudentResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflict - student with this ID already exists' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateStudentDto]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "createStudent", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update student' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Student ID', example: 'student-uuid-123' }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateStudentDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student updated successfully', type: dto_1.StudentResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateStudentDto]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "updateStudent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete student' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Student ID', example: 'student-uuid-123' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - invalid student ID' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "deleteStudent", null);
__decorate([
    (0, common_1.Get)(':id/academic-record'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student academic record' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Student ID', example: 'student-uuid-123' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Academic record retrieved successfully', type: dto_1.StudentResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - invalid student ID' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getStudentAcademicRecord", null);
__decorate([
    (0, common_1.Get)(':id/assessment-breakdown'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student assessment breakdown for debugging' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Student ID', example: 'student-uuid-123' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Assessment breakdown retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - invalid student ID' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getStudentAssessmentBreakdown", null);
exports.StudentController = StudentController = __decorate([
    (0, swagger_1.ApiTags)('admin-student'),
    (0, common_1.Controller)('admin/students'),
    __metadata("design:paramtypes", [student_service_1.StudentService])
], StudentController);
//# sourceMappingURL=student.controller.js.map