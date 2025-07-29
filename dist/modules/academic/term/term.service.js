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
var TermService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let TermService = TermService_1 = class TermService {
    prisma;
    logger = new common_1.Logger(TermService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllTerms(page, limit, sessionId, isActive) {
        this.logger.log(`Fetching terms - page: ${page}, limit: ${limit}, sessionId: ${sessionId}, isActive: ${isActive}`);
        try {
            const whereConditions = {};
            if (sessionId) {
                whereConditions.sessionId = sessionId;
            }
            if (isActive !== undefined) {
                whereConditions.isActive = isActive;
            }
            const [terms, total] = await Promise.all([
                this.prisma.term.findMany({
                    where: whereConditions,
                    include: {
                        session: {
                            select: {
                                id: true,
                                name: true,
                                school: {
                                    select: {
                                        id: true,
                                        name: true,
                                        code: true,
                                    },
                                },
                            },
                        },
                        _count: {
                            select: {
                                assessments: true,
                            },
                        },
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { name: 'asc' },
                }),
                this.prisma.term.count({ where: whereConditions }),
            ]);
            this.logger.log(`Successfully fetched ${terms.length} terms`);
            return {
                data: terms,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            this.logger.error(`Error fetching terms: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getCurrentTerm() {
        this.logger.log('Fetching current active term');
        try {
            const currentTerm = await this.prisma.term.findFirst({
                where: { isCurrent: true },
                include: {
                    session: {
                        select: {
                            id: true,
                            name: true,
                            school: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!currentTerm) {
                this.logger.warn('No current active term found');
                throw new common_1.NotFoundException('No current active term found');
            }
            this.logger.log(`Current term: ${currentTerm.name}`);
            return currentTerm;
        }
        catch (error) {
            this.logger.error(`Error fetching current term: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getTermById(id) {
        this.logger.log(`Fetching term by ID: ${id}`);
        try {
            const term = await this.prisma.term.findUnique({
                where: { id },
                include: {
                    session: {
                        select: {
                            id: true,
                            name: true,
                            school: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                },
                            },
                        },
                    },
                    assessments: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                },
            });
            if (!term) {
                this.logger.warn(`Term with ID ${id} not found`);
                throw new common_1.NotFoundException(`Term with ID ${id} not found`);
            }
            this.logger.log(`Successfully fetched term: ${term.name}`);
            return term;
        }
        catch (error) {
            this.logger.error(`Error fetching term by ID: ${error.message}`, error.stack);
            throw error;
        }
    }
    async createTerm(createTermDto) {
        this.logger.log(`Creating new term: ${createTermDto.name} for session: ${createTermDto.sessionId}`);
        try {
            const session = await this.prisma.session.findUnique({
                where: { id: createTermDto.sessionId },
            });
            if (!session) {
                this.logger.warn(`Session with ID ${createTermDto.sessionId} not found`);
                throw new common_1.BadRequestException(`Session with ID ${createTermDto.sessionId} not found`);
            }
            const existingTerm = await this.prisma.term.findFirst({
                where: {
                    name: createTermDto.name,
                    sessionId: createTermDto.sessionId,
                },
            });
            if (existingTerm) {
                this.logger.warn(`Term with name ${createTermDto.name} already exists for this session`);
                throw new common_1.BadRequestException(`Term with name ${createTermDto.name} already exists for this session`);
            }
            if (createTermDto.isCurrent) {
                await this.prisma.term.updateMany({
                    where: { sessionId: createTermDto.sessionId, isCurrent: true },
                    data: { isCurrent: false },
                });
            }
            const newTerm = await this.prisma.term.create({
                data: {
                    name: createTermDto.name,
                    sessionId: createTermDto.sessionId,
                    startDate: new Date(createTermDto.startDate),
                    endDate: new Date(createTermDto.endDate),
                    isActive: createTermDto.isActive ?? true,
                    isCurrent: createTermDto.isCurrent ?? false,
                },
                include: {
                    session: {
                        select: {
                            id: true,
                            name: true,
                            school: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                },
                            },
                        },
                    },
                },
            });
            this.logger.log(`Successfully created term: ${newTerm.name}`);
            return newTerm;
        }
        catch (error) {
            this.logger.error(`Error creating term: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateTerm(id, updateTermDto) {
        this.logger.log(`Updating term: ${id}`);
        try {
            const existingTerm = await this.prisma.term.findUnique({
                where: { id },
            });
            if (!existingTerm) {
                this.logger.warn(`Term with ID ${id} not found`);
                throw new common_1.NotFoundException(`Term with ID ${id} not found`);
            }
            if (updateTermDto.name && updateTermDto.name !== existingTerm.name) {
                const duplicateTerm = await this.prisma.term.findFirst({
                    where: {
                        name: updateTermDto.name,
                        sessionId: existingTerm.sessionId,
                        id: { not: id },
                    },
                });
                if (duplicateTerm) {
                    this.logger.warn(`Term with name ${updateTermDto.name} already exists for this session`);
                    throw new common_1.BadRequestException(`Term with name ${updateTermDto.name} already exists for this session`);
                }
            }
            if (updateTermDto.isCurrent) {
                await this.prisma.term.updateMany({
                    where: { sessionId: existingTerm.sessionId, isCurrent: true, id: { not: id } },
                    data: { isCurrent: false },
                });
            }
            const updatedTerm = await this.prisma.term.update({
                where: { id },
                data: {
                    name: updateTermDto.name,
                    startDate: updateTermDto.startDate ? new Date(updateTermDto.startDate) : undefined,
                    endDate: updateTermDto.endDate ? new Date(updateTermDto.endDate) : undefined,
                    isActive: updateTermDto.isActive,
                    isCurrent: updateTermDto.isCurrent,
                },
                include: {
                    session: {
                        select: {
                            id: true,
                            name: true,
                            school: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                },
                            },
                        },
                    },
                },
            });
            this.logger.log(`Successfully updated term: ${updatedTerm.name}`);
            return updatedTerm;
        }
        catch (error) {
            this.logger.error(`Error updating term: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteTerm(id) {
        this.logger.log(`Deleting term: ${id}`);
        try {
            const term = await this.prisma.term.findUnique({
                where: { id },
                include: {
                    assessments: true,
                },
            });
            if (!term) {
                this.logger.warn(`Term with ID ${id} not found`);
                throw new common_1.NotFoundException(`Term with ID ${id} not found`);
            }
            if (term.assessments.length > 0) {
                this.logger.warn(`Cannot delete term with existing assessments`);
                throw new common_1.BadRequestException('Cannot delete term with existing assessments. Delete assessments first.');
            }
            await this.prisma.term.delete({
                where: { id },
            });
            this.logger.log(`Successfully deleted term: ${term.name}`);
            return { message: 'Term deleted successfully', deletedTerm: term };
        }
        catch (error) {
            this.logger.error(`Error deleting term: ${error.message}`, error.stack);
            throw error;
        }
    }
    async activateTerm(id) {
        this.logger.log(`Activating term: ${id}`);
        try {
            const term = await this.prisma.term.findUnique({
                where: { id },
                include: {
                    session: true,
                },
            });
            if (!term) {
                this.logger.warn(`Term with ID ${id} not found`);
                throw new common_1.NotFoundException(`Term with ID ${id} not found`);
            }
            await this.prisma.term.updateMany({
                where: { sessionId: term.sessionId, isCurrent: true },
                data: { isCurrent: false },
            });
            const activatedTerm = await this.prisma.term.update({
                where: { id },
                data: { isCurrent: true, isActive: true },
                include: {
                    session: {
                        select: {
                            id: true,
                            name: true,
                            school: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                },
                            },
                        },
                    },
                },
            });
            this.logger.log(`Successfully activated term: ${activatedTerm.name}`);
            return activatedTerm;
        }
        catch (error) {
            this.logger.error(`Error activating term: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deactivateTerm(id) {
        this.logger.log(`Deactivating term: ${id}`);
        try {
            const term = await this.prisma.term.findUnique({
                where: { id },
            });
            if (!term) {
                this.logger.warn(`Term with ID ${id} not found`);
                throw new common_1.NotFoundException(`Term with ID ${id} not found`);
            }
            const deactivatedTerm = await this.prisma.term.update({
                where: { id },
                data: { isCurrent: false, isActive: false },
                include: {
                    session: {
                        select: {
                            id: true,
                            name: true,
                            school: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                },
                            },
                        },
                    },
                },
            });
            this.logger.log(`Successfully deactivated term: ${deactivatedTerm.name}`);
            return deactivatedTerm;
        }
        catch (error) {
            this.logger.error(`Error deactivating term: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getTermAssessments(id) {
        this.logger.log(`Fetching assessments for term: ${id}`);
        try {
            const term = await this.prisma.term.findUnique({
                where: { id },
                include: {
                    assessments: {
                        include: {
                            student: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    studentId: true,
                                },
                            },
                            subject: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                },
                            },
                        },
                        orderBy: { createdAt: 'desc' },
                    },
                },
            });
            if (!term) {
                this.logger.warn(`Term with ID ${id} not found`);
                throw new common_1.NotFoundException(`Term with ID ${id} not found`);
            }
            this.logger.log(`Successfully fetched ${term.assessments.length} assessments for term: ${term.name}`);
            return term.assessments;
        }
        catch (error) {
            this.logger.error(`Error fetching term assessments: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.TermService = TermService;
exports.TermService = TermService = TermService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TermService);
//# sourceMappingURL=term.service.js.map