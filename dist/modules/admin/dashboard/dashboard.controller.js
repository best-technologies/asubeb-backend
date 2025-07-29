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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboard_service_1 = require("./dashboard.service");
let DashboardController = class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getAdminDashboard(session, term) {
        return this.dashboardService.getAdminDashboard(session, term);
    }
    async fetchDashboardPerformanceTable(session, term, page = 1, limit = 10, search, schoolId, classId, gender) {
        return this.dashboardService.fetchDashboardPerformanceTable(session, term, page, limit, search, schoolId, classId, gender);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin dashboard data' }),
    (0, swagger_1.ApiQuery)({ name: 'session', required: true, description: 'Academic session (e.g., 2023-2024)' }),
    (0, swagger_1.ApiQuery)({ name: 'term', required: true, description: 'Academic term (FIRST_TERM, SECOND_TERM, THIRD_TERM)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard data retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session or term' }),
    __param(0, (0, common_1.Query)('session')),
    __param(1, (0, common_1.Query)('term')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getAdminDashboard", null);
__decorate([
    (0, common_1.Get)('performance-table'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student performance table' }),
    (0, swagger_1.ApiQuery)({ name: 'session', required: true, description: 'Academic session' }),
    (0, swagger_1.ApiQuery)({ name: 'term', required: true, description: 'Academic term' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Records per page (default: 10)' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search by student name or ID' }),
    (0, swagger_1.ApiQuery)({ name: 'schoolId', required: false, description: 'Filter by school ID' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false, description: 'Filter by class ID' }),
    (0, swagger_1.ApiQuery)({ name: 'gender', required: false, description: 'Filter by gender (MALE, FEMALE, OTHER)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Performance table retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid session or term' }),
    __param(0, (0, common_1.Query)('session')),
    __param(1, (0, common_1.Query)('term')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('schoolId')),
    __param(6, (0, common_1.Query)('classId')),
    __param(7, (0, common_1.Query)('gender')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "fetchDashboardPerformanceTable", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('admin-dashboard'),
    (0, common_1.Controller)('admin/dashboard'),
    __metadata("design:paramtypes", [typeof (_a = typeof dashboard_service_1.DashboardService !== "undefined" && dashboard_service_1.DashboardService) === "function" ? _a : Object])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map