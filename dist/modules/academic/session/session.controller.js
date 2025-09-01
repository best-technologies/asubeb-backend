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
exports.SessionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const session_service_1 = require("./session.service");
const dto_1 = require("./dto");
let SessionController = class SessionController {
    sessionService;
    constructor(sessionService) {
        this.sessionService = sessionService;
    }
    async getAllSessions(page = 1, limit = 10, isActive) {
        return this.sessionService.getAllSessions(page, limit, isActive);
    }
    async getCurrentSession() {
        return this.sessionService.getCurrentSession();
    }
    async getSessionById(id) {
        return this.sessionService.getSessionById(id);
    }
    async createSession(createSessionDto) {
        return this.sessionService.createSession(createSessionDto);
    }
    async updateSession(id, updateSessionDto) {
        return this.sessionService.updateSession(id, updateSessionDto);
    }
    async deleteSession(id) {
        return this.sessionService.deleteSession(id);
    }
    async activateSession(id) {
        return this.sessionService.activateSession(id);
    }
    async deactivateSession(id) {
        return this.sessionService.deactivateSession(id);
    }
    async getSessionTerms(id) {
        return this.sessionService.getSessionTerms(id);
    }
};
exports.SessionController = SessionController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sessions' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, description: 'Filter by active status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sessions retrieved successfully' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Boolean]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "getAllSessions", null);
__decorate([
    (0, common_1.Get)('current'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current active session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Current session retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "getCurrentSession", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get session by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Session ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "getSessionById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new session' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Session created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateSessionDto]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "createSession", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update session' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Session ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateSessionDto]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "updateSession", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete session' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Session ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "deleteSession", null);
__decorate([
    (0, common_1.Put)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate session' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Session ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session activated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "activateSession", null);
__decorate([
    (0, common_1.Put)(':id/deactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate session' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Session ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session deactivated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "deactivateSession", null);
__decorate([
    (0, common_1.Get)(':id/terms'),
    (0, swagger_1.ApiOperation)({ summary: 'Get terms for a session' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Session ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session terms retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "getSessionTerms", null);
exports.SessionController = SessionController = __decorate([
    (0, swagger_1.ApiTags)('academic-session'),
    (0, common_1.Controller)('academic/sessions'),
    __metadata("design:paramtypes", [session_service_1.SessionService])
], SessionController);
//# sourceMappingURL=session.controller.js.map