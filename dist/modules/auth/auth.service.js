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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const response_helper_1 = require("../../common/helpers/response.helper");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async validateUser(email, pass) {
        if (!email || !pass) {
            this.logger.warn('Missing email or password');
            throw new common_1.BadRequestException('Email and password must be provided');
        }
        try {
            const user = await this.prisma.user.findUnique({ where: { email } });
            if (!user) {
                this.logger.warn(`Authentication attempt for non-existing user: ${email}`);
                return null;
            }
            const isValid = await bcrypt.compare(pass, user.password);
            if (!isValid) {
                this.logger.warn(`Invalid password attempt for user: ${email}`);
                return null;
            }
            const safe = {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
            };
            this.logger.log(`User validated: ${email}`);
            return safe;
        }
        catch (error) {
            this.logger.error(`Error validating user ${email}: ${error?.message ?? error}`);
            throw new common_1.InternalServerErrorException('Failed to validate user');
        }
    }
    async authenticate(email, password) {
        this.logger.log(`Authenticating user ${email} with password ${password}`);
        try {
        }
        catch (error) {
        }
        if (!email || !password) {
            this.logger.warn('Missing email or password');
            throw new common_1.BadRequestException('Email and password must be provided');
        }
        const user = await this.validateUser(email, password);
        if (!user) {
            this.logger.warn(`Invalid credentials for ${email}`);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const result = await this.login(user);
        return response_helper_1.ResponseHelper.success('Login successful', result);
    }
    async login(user) {
        if (!user || !user.id) {
            this.logger.warn('login called with invalid user payload');
            throw new common_1.BadRequestException('Invalid user');
        }
        const payload = { sub: user.id, id: user.id, email: user.email, role: user.role };
        try {
            this.logger.log(`Signing JWT for user ${user.email} (${user.id})`);
            const token = this.jwtService.sign(payload);
            return {
                access_token: token,
                user: { sub: payload.sub, id: payload.id, email: payload.email, role: payload.role },
            };
        }
        catch (error) {
            this.logger.error(`Failed to sign JWT for user ${user.email}: ${error?.message ?? error}`);
            throw new common_1.InternalServerErrorException('Failed to generate access token');
        }
    }
    async register(data) {
        if (!data?.email || !data?.password || !data?.firstName || !data?.lastName) {
            this.logger.warn('register called with missing required fields');
            throw new common_1.BadRequestException('Email, password, firstName, and lastName are required');
        }
        try {
            const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
            if (existing) {
                this.logger.warn(`Attempt to register with existing email: ${data.email}`);
                throw new common_1.ConflictException('User already exists');
            }
            const hashed = await bcrypt.hash(data.password, 10);
            const user = await this.prisma.user.create({
                data: {
                    email: data.email,
                    username: data.email,
                    password: hashed,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    role: 'grade-entry-officer',
                },
                select: { id: true, email: true, role: true, firstName: true, lastName: true },
            });
            this.logger.log(`Created user ${user.email} (${user.id})`);
            return response_helper_1.ResponseHelper.created('User registered', user);
        }
        catch (error) {
            if (error instanceof common_1.ConflictException || error instanceof common_1.BadRequestException)
                throw error;
            this.logger.error(`Failed to create user ${data.email}: ${error?.message ?? error}`);
            throw new common_1.InternalServerErrorException('Failed to register user');
        }
    }
    getProfile(user) {
        return response_helper_1.ResponseHelper.success('Profile fetched', user);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map