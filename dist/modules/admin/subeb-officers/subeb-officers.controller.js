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
exports.SubebOfficersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const subeb_officers_service_1 = require("./subeb-officers.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const subeb_officers_api_decorators_1 = require("./subeb-officers.api.decorators");
let SubebOfficersController = class SubebOfficersController {
    subebOfficersService;
    constructor(subebOfficersService) {
        this.subebOfficersService = subebOfficersService;
    }
    async enrollOfficer(dto, req) {
        const enrolledByUserId = req.user?.id;
        if (!enrolledByUserId) {
            throw new common_1.UnauthorizedException('User ID not found in request. Please ensure JWT authentication is working correctly.');
        }
        return this.subebOfficersService.enrollOfficer(dto, enrolledByUserId);
    }
    async getAllOfficers(page = 1, limit = 10, req) {
        const userStateId = req.user?.stateId;
        return this.subebOfficersService.getAllOfficers(page, limit, userStateId);
    }
    async updateOfficer(id, dto) {
        return this.subebOfficersService.updateOfficer(id, dto);
    }
};
exports.SubebOfficersController = SubebOfficersController;
__decorate([
    (0, common_1.Post)('enroll-officer'),
    (0, roles_decorator_1.Roles)('subeb-admin', 'admin'),
    (0, subeb_officers_api_decorators_1.ApiEnrollOfficer)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.EnrollOfficerDto, Object]),
    __metadata("design:returntype", Promise)
], SubebOfficersController.prototype, "enrollOfficer", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('subeb-admin', 'admin'),
    (0, subeb_officers_api_decorators_1.ApiGetAllOfficers)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], SubebOfficersController.prototype, "getAllOfficers", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('subeb-admin', 'admin'),
    (0, subeb_officers_api_decorators_1.ApiUpdateOfficer)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateOfficerDto]),
    __metadata("design:returntype", Promise)
], SubebOfficersController.prototype, "updateOfficer", null);
exports.SubebOfficersController = SubebOfficersController = __decorate([
    (0, swagger_1.ApiTags)('admin-subeb-officers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('admin/subeb-officers'),
    __metadata("design:paramtypes", [subeb_officers_service_1.SubebOfficersService])
], SubebOfficersController);
//# sourceMappingURL=subeb-officers.controller.js.map