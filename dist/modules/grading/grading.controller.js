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
exports.GradingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const grading_service_1 = require("./grading.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let GradingController = class GradingController {
    gradingService;
    constructor(gradingService) {
        this.gradingService = gradingService;
    }
    async fetchAcademicMetadataForGradeEntry(req) {
        const user = req.user;
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        if (user.role !== 'SUBEB_OFFICER') {
            throw new common_1.ForbiddenException('Only SUBEB_OFFICER can access this resource');
        }
        if (!user.stateId) {
            throw new common_1.BadRequestException('User state not found');
        }
        return this.gradingService.getAcademicMetadataForGradeEntry(user.stateId);
    }
    async getStudentGrades(studentId, subject, semester) {
        return this.gradingService.getStudentGrades(studentId, subject, semester);
    }
    async addStudentGrade(studentId, gradeData) {
        return this.gradingService.addStudentGrade(studentId, gradeData);
    }
    async updateStudentGrade(studentId, gradeId, gradeData) {
        return this.gradingService.updateStudentGrade(studentId, gradeId, gradeData);
    }
    async getClassGrades(classId, subject) {
        return this.gradingService.getClassGrades(classId, subject);
    }
    async addBulkGrades(classId, gradesData) {
        return this.gradingService.addBulkGrades(classId, gradesData);
    }
    async getSubjects() {
        return this.gradingService.getSubjects();
    }
    async getGradeScales() {
        return this.gradingService.getGradeScales();
    }
    async getClassGradeReport(classId) {
        return this.gradingService.getClassGradeReport(classId);
    }
    async getStudentGradeReport(studentId) {
        return this.gradingService.getStudentGradeReport(studentId);
    }
};
exports.GradingController = GradingController;
__decorate([
    (0, common_1.Get)('metadata/grade-entry'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch academic metadata for grade entry (SUBEB_OFFICER only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Academic metadata retrieved successfully' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GradingController.prototype, "fetchAcademicMetadataForGradeEntry", null);
__decorate([
    (0, common_1.Get)('students/:studentId/grades'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student grades' }),
    (0, swagger_1.ApiParam)({ name: 'studentId', description: 'Student ID' }),
    (0, swagger_1.ApiQuery)({ name: 'subject', required: false, description: 'Filter by subject' }),
    (0, swagger_1.ApiQuery)({ name: 'semester', required: false, description: 'Filter by semester' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student grades retrieved successfully' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('subject')),
    __param(2, (0, common_1.Query)('semester')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GradingController.prototype, "getStudentGrades", null);
__decorate([
    (0, common_1.Post)('students/:studentId/grades'),
    (0, swagger_1.ApiOperation)({ summary: 'Add student grade' }),
    (0, swagger_1.ApiParam)({ name: 'studentId', description: 'Student ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Grade added successfully' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GradingController.prototype, "addStudentGrade", null);
__decorate([
    (0, common_1.Put)('students/:studentId/grades/:gradeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update student grade' }),
    (0, swagger_1.ApiParam)({ name: 'studentId', description: 'Student ID' }),
    (0, swagger_1.ApiParam)({ name: 'gradeId', description: 'Grade ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Grade updated successfully' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Param)('gradeId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], GradingController.prototype, "updateStudentGrade", null);
__decorate([
    (0, common_1.Get)('classes/:classId/grades'),
    (0, swagger_1.ApiOperation)({ summary: 'Get class grades' }),
    (0, swagger_1.ApiParam)({ name: 'classId', description: 'Class ID' }),
    (0, swagger_1.ApiQuery)({ name: 'subject', required: false, description: 'Filter by subject' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Class grades retrieved successfully' }),
    __param(0, (0, common_1.Param)('classId')),
    __param(1, (0, common_1.Query)('subject')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GradingController.prototype, "getClassGrades", null);
__decorate([
    (0, common_1.Post)('classes/:classId/grades/bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Add bulk grades for class' }),
    (0, swagger_1.ApiParam)({ name: 'classId', description: 'Class ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Bulk grades added successfully' }),
    __param(0, (0, common_1.Param)('classId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GradingController.prototype, "addBulkGrades", null);
__decorate([
    (0, common_1.Get)('subjects'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all subjects' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subjects retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GradingController.prototype, "getSubjects", null);
__decorate([
    (0, common_1.Get)('grade-scales'),
    (0, swagger_1.ApiOperation)({ summary: 'Get grade scales' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Grade scales retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GradingController.prototype, "getGradeScales", null);
__decorate([
    (0, common_1.Get)('reports/class/:classId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get class grade report' }),
    (0, swagger_1.ApiParam)({ name: 'classId', description: 'Class ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Class grade report generated successfully' }),
    __param(0, (0, common_1.Param)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GradingController.prototype, "getClassGradeReport", null);
__decorate([
    (0, common_1.Get)('reports/student/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student grade report' }),
    (0, swagger_1.ApiParam)({ name: 'studentId', description: 'Student ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student grade report generated successfully' }),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GradingController.prototype, "getStudentGradeReport", null);
exports.GradingController = GradingController = __decorate([
    (0, swagger_1.ApiTags)('grading'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('grading'),
    __metadata("design:paramtypes", [grading_service_1.GradingService])
], GradingController);
//# sourceMappingURL=grading.controller.js.map