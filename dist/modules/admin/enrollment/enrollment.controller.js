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
exports.EnrollmentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const enrollment_service_1 = require("./enrollment.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const dto_1 = require("../subeb-officers/dto");
const enroll_student_dto_1 = require("./dto/enroll-student.dto");
const enrollment_metadata_dto_1 = require("./dto/enrollment-metadata.dto");
let EnrollmentController = class EnrollmentController {
    enrollmentService;
    constructor(enrollmentService) {
        this.enrollmentService = enrollmentService;
    }
    async healthCheck() {
        return this.enrollmentService.healthCheck();
    }
    async getStudentEnrollmentMetadata(req) {
        return this.enrollmentService.getStudentEnrollmentMetadata(req.user);
    }
    async getSchoolsForStudentEnrollment(req, lgaId) {
        return this.enrollmentService.getSchoolsForStudentEnrollment(req.user, lgaId);
    }
    async getClassesForStudentEnrollment(req, schoolId) {
        return this.enrollmentService.getClassesForStudentEnrollment(req.user, schoolId);
    }
    async enrollNewSubebOfficer(req, dto) {
        return this.enrollmentService.enrollNewSubebOfficer(dto, req.user);
    }
    async enrollSingleOrBulkStudents(req, payload) {
        return this.enrollmentService.enrollSingleOrBulkStudents(payload, req.user);
    }
};
exports.EnrollmentController = EnrollmentController;
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Enrollment module health check' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Get)('students/enrollment/metadata'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN', 'SUBEB_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch academic metadata for student enrollment (current user state)' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Student enrollment metadata retrieved successfully',
        type: enrollment_metadata_dto_1.StudentEnrollmentMetadataResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "getStudentEnrollmentMetadata", null);
__decorate([
    (0, common_1.Get)('students/enrollment/lgas/:lgaId/schools'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN', 'SUBEB_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch schools under an LGA for student enrollment' }),
    (0, swagger_1.ApiParam)({ name: 'lgaId', description: 'Local Government Area ID' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Schools for student enrollment retrieved successfully',
        type: enrollment_metadata_dto_1.StudentEnrollmentSchoolsResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('lgaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "getSchoolsForStudentEnrollment", null);
__decorate([
    (0, common_1.Get)('students/enrollment/schools/:schoolId/classes'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN', 'SUBEB_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch classes under a school for student enrollment' }),
    (0, swagger_1.ApiParam)({ name: 'schoolId', description: 'School ID' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Classes for student enrollment retrieved successfully',
        type: enrollment_metadata_dto_1.StudentEnrollmentClassesResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "getClassesForStudentEnrollment", null);
__decorate([
    (0, common_1.Post)('subeb-officers/enroll'),
    (0, roles_decorator_1.Roles)('SUBEB_ADMIN', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Enroll a new SUBEB officer (role forced to SUBEB_OFFICER)' }),
    (0, swagger_1.ApiBody)({ type: dto_1.EnrollOfficerDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'SUBEB officer enrolled successfully',
        type: enrollment_metadata_dto_1.EnrollSubebOfficerResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.EnrollOfficerDto]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "enrollNewSubebOfficer", null);
__decorate([
    (0, common_1.Post)('students/enrollsingleorbulkstudents'),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN', 'SUBEB_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Enroll single or multiple students into a school and class' }),
    (0, swagger_1.ApiBody)({ type: enroll_student_dto_1.EnrollSingleOrBulkStudentsDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Students enrolled successfully',
        type: enrollment_metadata_dto_1.EnrollStudentsResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, enroll_student_dto_1.EnrollSingleOrBulkStudentsDto]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "enrollSingleOrBulkStudents", null);
exports.EnrollmentController = EnrollmentController = __decorate([
    (0, swagger_1.ApiTags)('admin-enrollment'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('admin/enrollment'),
    __metadata("design:paramtypes", [enrollment_service_1.EnrollmentService])
], EnrollmentController);
//# sourceMappingURL=enrollment.controller.js.map