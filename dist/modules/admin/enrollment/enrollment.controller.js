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
let EnrollmentController = class EnrollmentController {
    enrollmentService;
    constructor(enrollmentService) {
        this.enrollmentService = enrollmentService;
    }
    async healthCheck() {
        return this.enrollmentService.healthCheck();
    }
    async enrollNewSubebOfficer(req, dto) {
        return this.enrollmentService.enrollNewSubebOfficer(dto, req.user);
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
    (0, common_1.Post)('subeb-officers/enroll'),
    (0, roles_decorator_1.Roles)('SUBEB_ADMIN', 'ADMIN', 'SUPER_ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Enroll a new SUBEB officer (role forced to SUBEB_OFFICER)' }),
    (0, swagger_1.ApiBody)({ type: dto_1.EnrollOfficerDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'SUBEB officer enrolled successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.EnrollOfficerDto]),
    __metadata("design:returntype", Promise)
], EnrollmentController.prototype, "enrollNewSubebOfficer", null);
exports.EnrollmentController = EnrollmentController = __decorate([
    (0, swagger_1.ApiTags)('admin-enrollment'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('admin/enrollment'),
    __metadata("design:paramtypes", [enrollment_service_1.EnrollmentService])
], EnrollmentController);
//# sourceMappingURL=enrollment.controller.js.map