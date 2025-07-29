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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_service_1 = require("./app.service");
const database_health_service_1 = require("./health/database-health.service");
let AppController = class AppController {
    appService;
    databaseHealthService;
    constructor(appService, databaseHealthService) {
        this.appService = appService;
        this.databaseHealthService = databaseHealthService;
    }
    getHello() {
        return this.appService.getHello();
    }
    async getHealth() {
        const dbHealth = await this.databaseHealthService.checkHealth();
        return {
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: dbHealth,
        };
    }
    echo(data) {
        return {
            message: 'Data received successfully',
            data,
            timestamp: new Date().toISOString(),
        };
    }
    getUser(id) {
        return {
            id,
            name: 'John Doe',
            email: 'john@example.com',
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get hello message' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns a hello message' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Server is healthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Post)('echo'),
    (0, swagger_1.ApiOperation)({ summary: 'Echo endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Returns the sent data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], AppController.prototype, "echo", null);
__decorate([
    (0, common_1.Get)('user/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], AppController.prototype, "getUser", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('default'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        database_health_service_1.DatabaseHealthService])
], AppController);
//# sourceMappingURL=app.controller.js.map