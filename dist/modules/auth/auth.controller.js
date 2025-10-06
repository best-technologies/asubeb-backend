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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const register_dto_1 = require("./dto/register.dto");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const response_helper_1 = require("../../common/helpers/response.helper");
let AuthController = AuthController_1 = class AuthController {
    authService;
    logger = new common_1.Logger(AuthController_1.name);
    constructor(authService) {
        this.authService = authService;
    }
    async login(dto) {
        try {
            const user = await this.authService.validateUser(dto.email, dto.password);
            if (!user) {
                this.logger.warn(`Invalid credentials for ${dto.email}`);
                return response_helper_1.ResponseHelper.error('Invalid credentials', null, common_1.HttpStatus.UNAUTHORIZED);
            }
            const result = await this.authService.login(user);
            return response_helper_1.ResponseHelper.success('Login successful', result);
        }
        catch (error) {
            this.logger.error(`Login error for ${dto.email}: ${error?.message ?? error}`);
            const status = error?.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            return response_helper_1.ResponseHelper.error(error?.message || 'Login failed', null, status);
        }
    }
    async register(dto) {
        try {
            const user = await this.authService.register(dto);
            return response_helper_1.ResponseHelper.created('User registered', user);
        }
        catch (error) {
            this.logger.error(`Registration error for ${dto.email}: ${error?.message ?? error}`);
            const status = error?.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            return response_helper_1.ResponseHelper.error(error?.message || 'Registration failed', null, status);
        }
    }
    profile(req) {
        try {
            return response_helper_1.ResponseHelper.success('Profile fetched', req.user);
        }
        catch (error) {
            this.logger.error(`Profile fetch error: ${error?.message ?? error}`);
            return response_helper_1.ResponseHelper.error('Failed to fetch profile', null, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "profile", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map