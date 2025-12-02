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
var SubebOfficersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubebOfficersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const response_helper_1 = require("../../../common/helpers/response.helper");
let SubebOfficersService = SubebOfficersService_1 = class SubebOfficersService {
    prisma;
    logger = new common_1.Logger(SubebOfficersService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateUniqueOfficerId() {
        let officerId;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 20;
        while (!isUnique && attempts < maxAttempts) {
            const randomDigits = Math.floor(Math.random() * 90000) + 10000;
            officerId = `OFF${randomDigits}`;
            const existingOfficer = await this.prisma.subebOfficer.findFirst({
                where: { officerId },
            });
            if (!existingOfficer) {
                isUnique = true;
            }
            else {
                attempts++;
            }
        }
        if (!isUnique) {
            throw new common_1.InternalServerErrorException('Unable to generate unique officer ID');
        }
        return officerId;
    }
    async getAllOfficers(page = 1, limit = 10, stateId) {
        this.logger.log(`Fetching SUBEB officers - page: ${page}, limit: ${limit}, stateId: ${stateId || 'all'}`);
        const skip = (page - 1) * limit;
        const whereClause = {};
        if (stateId) {
            whereClause.stateId = stateId;
        }
        try {
            const [officers, total] = await Promise.all([
                this.prisma.subebOfficer.findMany({
                    where: whereClause,
                    skip,
                    take: limit,
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                                role: true,
                                isActive: true,
                                createdAt: true,
                            },
                        },
                        stateRef: {
                            select: {
                                id: true,
                                stateName: true,
                                code: true,
                            },
                        },
                        enrolledByUser: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                role: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                this.prisma.subebOfficer.count({ where: whereClause }),
            ]);
            return response_helper_1.ResponseHelper.success('SUBEB officers retrieved successfully', {
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNextPage: page < Math.ceil(total / limit),
                    hasPreviousPage: page > 1,
                },
            }, officers);
        }
        catch (error) {
            this.logger.error(`Failed to fetch SUBEB officers: ${error?.message ?? error}`);
            throw new common_1.InternalServerErrorException('Failed to fetch SUBEB officers');
        }
    }
    async updateOfficer(id, data) {
        this.logger.log(`Updating SUBEB officer: ${id}`);
        try {
            const existingOfficer = await this.prisma.subebOfficer.findUnique({
                where: { id },
                include: { user: true },
            });
            if (!existingOfficer) {
                this.logger.warn(`SUBEB officer with ID ${id} not found`);
                throw new common_1.NotFoundException(`SUBEB officer with ID ${id} not found`);
            }
            if (data.email && data.email !== existingOfficer.email) {
                const emailExists = await this.prisma.user.findUnique({
                    where: { email: data.email },
                });
                if (emailExists && emailExists.id !== existingOfficer.userId) {
                    this.logger.warn(`Attempt to update officer with existing email: ${data.email}`);
                    throw new common_1.ConflictException('User with this email already exists');
                }
            }
            const subebOfficerUpdateData = {};
            if (data.firstName !== undefined)
                subebOfficerUpdateData.firstName = data.firstName;
            if (data.lastName !== undefined)
                subebOfficerUpdateData.lastName = data.lastName;
            if (data.email !== undefined)
                subebOfficerUpdateData.email = data.email;
            if (data.phone !== undefined)
                subebOfficerUpdateData.phone = data.phone;
            if (data.address !== undefined)
                subebOfficerUpdateData.address = data.address;
            if (data.designation !== undefined)
                subebOfficerUpdateData.designation = data.designation;
            if (data.isActive !== undefined)
                subebOfficerUpdateData.isActive = data.isActive;
            const userUpdateData = {};
            if (data.firstName !== undefined)
                userUpdateData.firstName = data.firstName;
            if (data.lastName !== undefined)
                userUpdateData.lastName = data.lastName;
            if (data.email !== undefined) {
                userUpdateData.email = data.email;
                userUpdateData.username = data.email;
            }
            const result = await this.prisma.$transaction(async (tx) => {
                if (Object.keys(userUpdateData).length > 0) {
                    await tx.user.update({
                        where: { id: existingOfficer.userId },
                        data: userUpdateData,
                    });
                }
                if (Object.keys(subebOfficerUpdateData).length > 0) {
                    return await tx.subebOfficer.update({
                        where: { id },
                        data: subebOfficerUpdateData,
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    email: true,
                                    username: true,
                                    firstName: true,
                                    lastName: true,
                                    role: true,
                                    isActive: true,
                                    createdAt: true,
                                },
                            },
                            stateRef: {
                                select: {
                                    id: true,
                                    stateName: true,
                                    code: true,
                                },
                            },
                            enrolledByUser: {
                                select: {
                                    id: true,
                                    email: true,
                                    firstName: true,
                                    lastName: true,
                                    role: true,
                                },
                            },
                        },
                    });
                }
                return await tx.subebOfficer.findUnique({
                    where: { id },
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                username: true,
                                firstName: true,
                                lastName: true,
                                role: true,
                                isActive: true,
                                createdAt: true,
                            },
                        },
                        stateRef: {
                            select: {
                                id: true,
                                stateName: true,
                                code: true,
                            },
                        },
                        enrolledByUser: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                role: true,
                            },
                        },
                    },
                });
            });
            if (!result) {
                throw new common_1.NotFoundException(`SUBEB officer with ID ${id} not found`);
            }
            this.logger.log(`Updated SUBEB officer: ${result.email} (${result.id})`);
            return response_helper_1.ResponseHelper.success('SUBEB officer updated successfully', result);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to update SUBEB officer ${id}: ${error?.message ?? error}`);
            throw new common_1.InternalServerErrorException('Failed to update SUBEB officer');
        }
    }
};
exports.SubebOfficersService = SubebOfficersService;
exports.SubebOfficersService = SubebOfficersService = SubebOfficersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubebOfficersService);
//# sourceMappingURL=subeb-officers.service.js.map