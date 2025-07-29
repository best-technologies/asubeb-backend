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
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all students' }),
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