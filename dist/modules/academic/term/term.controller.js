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
exports.TermController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const term_service_1 = require("./term.service");
let TermController = class TermController {
    termService;
    constructor(termService) {
        this.termService = termService;
    }
    async getAllTerms(page = 1, limit = 10, sessionId, isActive) {
        return this.termService.getAllTerms(page, limit, sessionId, isActive);
    }
    async getCurrentTerm() {
        return this.termService.getCurrentTerm();
    }
    async getTermById(id) {
        return this.termService.getTermById(id);
    }
    async createTerm(createTermDto) {
        return this.termService.createTerm(createTermDto);
    }
    async updateTerm(id, updateTermDto) {
        return this.termService.updateTerm(id, updateTermDto);
    }
    async deleteTerm(id) {
        return this.termService.deleteTerm(id);
    }
    async activateTerm(id) {
        return this.termService.activateTerm(id);
    }
    async deactivateTerm(id) {
        return this.termService.deactivateTerm(id);
    }
    async getTermAssessments(id) {
        return this.termService.getTermAssessments(id);
    }
};
exports.TermController = TermController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all terms' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'sessionId', required: false, description: 'Filter by session ID' }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, description: 'Filter by active status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Terms retrieved successfully' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('sessionId')),
    __param(3, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, Boolean]),
    __metadata("design:returntype", Promise)
], TermController.prototype, "getAllTerms", null);
__decorate([
    (0, common_1.Get)('current'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current active term' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Current term retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TermController.prototype, "getCurrentTerm", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get term by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Term ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Term retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Term not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TermController.prototype, "getTermById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new term' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Term created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TermController.prototype, "createTerm", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update term' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Term ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Term updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Term not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TermController.prototype, "updateTerm", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete term' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Term ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Term deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Term not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TermController.prototype, "deleteTerm", null);
__decorate([
    (0, common_1.Put)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate term' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Term ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Term activated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TermController.prototype, "activateTerm", null);
__decorate([
    (0, common_1.Put)(':id/deactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate term' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Term ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Term deactivated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TermController.prototype, "deactivateTerm", null);
__decorate([
    (0, common_1.Get)(':id/assessments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get assessments for a term' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Term ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Term assessments retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TermController.prototype, "getTermAssessments", null);
exports.TermController = TermController = __decorate([
    (0, swagger_1.ApiTags)('academic-term'),
    (0, common_1.Controller)('academic/terms'),
    __metadata("design:paramtypes", [term_service_1.TermService])
], TermController);
//# sourceMappingURL=term.controller.js.map