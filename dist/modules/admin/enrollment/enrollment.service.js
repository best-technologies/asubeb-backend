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
var EnrollmentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const response_helper_1 = require("../../../common/helpers/response.helper");
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const colors = require("colors");
const send_mail_1 = require("../../../common/mailer/send-mail");
let EnrollmentService = EnrollmentService_1 = class EnrollmentService {
    prisma;
    logger = new common_1.Logger(EnrollmentService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async healthCheck() {
        this.logger.log(colors.green('EnrollmentService is up'));
        return { ok: true };
    }
    async enrollNewSubebOfficer(dto, user) {
        if (!user?.id) {
            throw new common_1.UnauthorizedException('User ID not found in request. Please ensure JWT authentication is working correctly.');
        }
        const enrolledByUserId = user.id;
        this.logger.log(colors.yellow(`Enrolling SUBEB officer ${dto.email} from EnrollmentModule by ${enrolledByUserId}`));
        try {
            const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
            if (existing) {
                this.logger.warn(`Attempt to enroll SUBEB officer with existing email: ${dto.email}`);
                throw new common_1.ConflictException('User already exists');
            }
            const enrollingUser = await this.prisma.user.findUnique({
                where: { id: enrolledByUserId },
                select: { stateId: true },
            });
            if (!enrollingUser?.stateId) {
                this.logger.warn('Enrolling user has no stateId. stateId is required.');
                throw new common_1.BadRequestException('Enrolling user must be associated with a state to enroll a SUBEB officer');
            }
            const stateId = enrollingUser.stateId;
            const tempPassword = Math.random().toString(36).slice(-10);
            const hashed = await bcrypt.hash(tempPassword, 10);
            const randomDigits = Math.floor(Math.random() * 90000) + 10000;
            const officerId = `OFF${randomDigits}`;
            const result = await this.prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        email: dto.email,
                        username: dto.email,
                        password: hashed,
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        role: client_1.UserRole.SUBEB_OFFICER,
                        stateId,
                    },
                });
                await tx.subebOfficer.create({
                    data: {
                        userId: user.id,
                        officerId,
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        email: dto.email,
                        phone: dto.phone,
                        address: dto.address || "",
                        designation: dto.designation || "",
                        stateId,
                        enrolledBy: enrolledByUserId,
                    },
                });
                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                };
            });
            if (result?.email && result?.firstName && result?.lastName) {
                (0, send_mail_1.sendSubebOfficerWelcomeEmail)(result.email, {
                    firstName: result.firstName ?? '',
                    lastName: result.lastName ?? '',
                    email: result.email,
                    password: tempPassword,
                }).catch(() => {
                });
            }
            this.logger.log(`Created SUBEB officer ${result.email} (${result.id}) via EnrollmentModule`);
            return response_helper_1.ResponseHelper.created('SUBEB officer registered', result);
        }
        catch (error) {
            if (error instanceof common_1.ConflictException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to register SUBEB officer ${dto.email} via EnrollmentModule: ${error?.message ?? error}`);
            throw new common_1.InternalServerErrorException('Failed to register SUBEB officer');
        }
    }
};
exports.EnrollmentService = EnrollmentService;
exports.EnrollmentService = EnrollmentService = EnrollmentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnrollmentService);
//# sourceMappingURL=enrollment.service.js.map