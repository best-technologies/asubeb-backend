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
const grading_metadata_dto_1 = require("./dto/grading-metadata.dto");
let GradingController = class GradingController {
    gradingService;
    constructor(gradingService) {
        this.gradingService = gradingService;
    }
    async fetchAcademicMetadataForGradeEntry(req) {
        return this.gradingService.getAcademicMetadataForGradeEntry(req.user.stateId);
    }
    async fetchSchoolsByLocalGovernment(req, lgaId) {
        return this.gradingService.getSchoolsByLocalGovernment(req.user.stateId, lgaId);
    }
    async fetchClassesBySchool(req, schoolId) {
        return this.gradingService.getClassesBySchool(req.user.stateId, schoolId);
    }
    async fetchAllStudentsByClassId(req, classId) {
        return this.gradingService.fetchAllStudentsByClassId(classId);
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
    (0, common_1.Get)('metadata/lgas/:lgaId/schools'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch all schools under a selected LGA for grade entry (SUBEB_OFFICER only)' }),
    (0, swagger_1.ApiParam)({ name: 'lgaId', description: 'Local Government Area ID' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Schools under the selected LGA retrieved successfully',
        type: grading_metadata_dto_1.GradeEntrySchoolsResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('lgaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GradingController.prototype, "fetchSchoolsByLocalGovernment", null);
__decorate([
    (0, common_1.Get)('metadata/schools/:schoolId/classes'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch all classes under a selected school for grade entry (SUBEB_OFFICER only)' }),
    (0, swagger_1.ApiParam)({ name: 'schoolId', description: 'School ID' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Classes under the selected school retrieved successfully',
        type: grading_metadata_dto_1.GradeEntryClassesResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GradingController.prototype, "fetchClassesBySchool", null);
__decorate([
    (0, common_1.Get)('metadata/classes/:classId/students'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch all students under a selected class for grade entry (SUBEB_OFFICER only)' }),
    (0, swagger_1.ApiParam)({ name: 'classId', description: 'Class ID' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Students under the selected class retrieved successfully',
        type: grading_metadata_dto_1.GradeEntryStudentsResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GradingController.prototype, "fetchAllStudentsByClassId", null);
exports.GradingController = GradingController = __decorate([
    (0, swagger_1.ApiTags)('grading'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('grading'),
    __metadata("design:paramtypes", [grading_service_1.GradingService])
], GradingController);
//# sourceMappingURL=grading.controller.js.map