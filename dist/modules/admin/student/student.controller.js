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
    async getStudentDashboard(session, term, schoolId, classId, subject, gender, search) {
        const filters = {
            session,
            term: term,
            schoolId,
            classId,
            subject,
            gender,
            search,
        };
        return this.studentService.getStudentDashboard(filters);
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
    async getStudentById(id) {
        return this.studentService.getStudentById(id);
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
    (0, swagger_1.ApiQuery)({ name: 'sessionId', required: false, description: 'Selected session ID' }),
    (0, swagger_1.ApiQuery)({ name: 'termId', required: false, description: 'Selected term ID' }),
    (0, swagger_1.ApiQuery)({ name: 'lgaId', required: false, description: 'Selected LGA ID' }),
    (0, swagger_1.ApiQuery)({ name: 'schoolId', required: false, description: 'Selected school ID' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false, description: 'Selected class ID' }),
    (0, swagger_1.ApiQuery)({ name: 'studentId', required: false, description: 'Selected student ID' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search by student name, school, or LGA' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Students page number (default: 1)', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Students per page (default: 10)', example: 10 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Explorer data retrieved successfully' }),
    (0, swagger_1.ApiOkResponse)({
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
                        { id: 'sess_1', name: '2024/2025', isCurrent: true, terms: [{ id: 'term_1', name: 'FIRST_TERM', isCurrent: false }] },
                    ],
                    lgas: [{ id: 'lga_1', name: 'Umuahia North', code: 'UMN', state: 'Abia' }],
                    schools: [{ id: 'sch_1', name: 'Central Primary School', code: 'CPS', level: 'PRIMARY' }],
                    classes: [{ id: 'cls_5', name: 'Primary 5', grade: 5, section: 'A' }],
                    students: [{ id: 'stu_1', firstName: 'John', lastName: 'Doe', studentId: 'STU123', gender: 'MALE', email: 'john@example.com' }],
                    pagination: { page: 1, limit: 10, total: 57, totalPages: 6 },
                    totals: { schools: 1000, classes: 9, students: 57 },
                    lastUpdated: '2025-09-22T12:00:00.000Z',
                },
            },
        },
    }),
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
    (0, swagger_1.ApiQuery)({ name: 'sessionId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'termId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'lgaId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'schoolId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'studentId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 10 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Explorer data retrieved successfully' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Explorer data (alias)',
    }),
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
    (0, swagger_1.ApiOperation)({ summary: 'Get student dashboard data with advanced filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'session', required: false, description: 'Academic session (e.g., 2024/2025)' }),
    (0, swagger_1.ApiQuery)({ name: 'term', required: false, description: 'Academic term (FIRST_TERM, SECOND_TERM, THIRD_TERM)' }),
    (0, swagger_1.ApiQuery)({ name: 'schoolId', required: false, description: 'Filter by school ID' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false, description: 'Filter by class ID' }),
    (0, swagger_1.ApiQuery)({ name: 'subject', required: false, description: 'Filter by subject name' }),
    (0, swagger_1.ApiQuery)({ name: 'gender', required: false, description: 'Gender (MALE, FEMALE, OTHER)' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search by student name or ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student dashboard data retrieved successfully' }),
    __param(0, (0, common_1.Query)('session')),
    __param(1, (0, common_1.Query)('term')),
    __param(2, (0, common_1.Query)('schoolId')),
    __param(3, (0, common_1.Query)('classId')),
    __param(4, (0, common_1.Query)('subject')),
    __param(5, (0, common_1.Query)('gender')),
    __param(6, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getStudentDashboard", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search, filter, and paginate students with comprehensive options' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page (default: 10)', example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search by student name, ID, or email' }),
    (0, swagger_1.ApiQuery)({ name: 'lgaId', required: false, description: 'Filter by Local Government Area ID' }),
    (0, swagger_1.ApiQuery)({ name: 'schoolId', required: false, description: 'Filter by school ID' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false, description: 'Filter by class ID' }),
    (0, swagger_1.ApiQuery)({ name: 'gender', required: false, description: 'Filter by gender (MALE, FEMALE, OTHER)' }),
    (0, swagger_1.ApiQuery)({ name: 'subject', required: false, description: 'Filter by subject name' }),
    (0, swagger_1.ApiQuery)({ name: 'session', required: false, description: 'Academic session (e.g., 2023-2024)' }),
    (0, swagger_1.ApiQuery)({ name: 'term', required: false, description: 'Academic term (FIRST_TERM, SECOND_TERM, THIRD_TERM)' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, description: 'Sort by field (firstName, lastName, studentId, email, gender, enrollmentDate)', example: 'firstName' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, description: 'Sort order (asc, desc)', example: 'asc' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Students retrieved successfully' }),
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
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'schoolId', required: false, description: 'Filter by school ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Students retrieved successfully' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getAllStudents", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Student ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getStudentById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new student' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Student created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "createStudent", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update student' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Student ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "updateStudent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete student' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Student ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Student not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "deleteStudent", null);
__decorate([
    (0, common_1.Get)(':id/academic-record'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student academic record' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Student ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Academic record retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getStudentAcademicRecord", null);
__decorate([
    (0, common_1.Get)(':id/assessment-breakdown'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student assessment breakdown for debugging' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Student ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Assessment breakdown retrieved successfully' }),
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