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
var SessionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let SessionService = SessionService_1 = class SessionService {
    prisma;
    logger = new common_1.Logger(SessionService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllSessions(page, limit, isActive) {
        this.logger.log(`Fetching sessions - page: ${page}, limit: ${limit}, isActive: ${isActive}`);
        try {
            const whereConditions = {};
            if (isActive !== undefined) {
                whereConditions.isActive = isActive;
            }
            const [sessions, total] = await Promise.all([
                this.prisma.session.findMany({
                    where: whereConditions,
                    include: {
                        _count: {
                            select: {
                                terms: true,
                            },
                        },
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                this.prisma.session.count({ where: whereConditions }),
            ]);
            this.logger.log(`Successfully fetched ${sessions.length} sessions`);
            return {
                data: sessions,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            this.logger.error(`Error fetching sessions: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getCurrentSession() {
        this.logger.log('Fetching current active session');
        try {
            const currentSession = await this.prisma.session.findFirst({
                where: { isCurrent: true },
                include: {
                    terms: {
                        where: { isCurrent: true },
                        take: 1,
                    },
                },
            });
            if (!currentSession) {
                this.logger.warn('No current active session found');
                throw new common_1.NotFoundException('No current active session found');
            }
            this.logger.log(`Current session: ${currentSession.name}`);
            return currentSession;
        }
        catch (error) {
            this.logger.error(`Error fetching current session: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getSessionById(id) {
        this.logger.log(`Fetching session by ID: ${id}`);
        try {
            const session = await this.prisma.session.findUnique({
                where: { id },
                include: {
                    terms: {
                        orderBy: { name: 'asc' },
                    },
                },
            });
            if (!session) {
                this.logger.warn(`Session with ID ${id} not found`);
                throw new common_1.NotFoundException(`Session with ID ${id} not found`);
            }
            this.logger.log(`Successfully fetched session: ${session.name}`);
            return session;
        }
        catch (error) {
            this.logger.error(`Error fetching session by ID: ${error.message}`, error.stack);
            throw error;
        }
    }
    async createSession(createSessionDto) {
        this.logger.log(`Creating new session: ${createSessionDto.name}`);
        try {
            const abiaState = await this.prisma.state.findFirst({
                where: { stateId: 'ABIA' },
            });
            if (!abiaState) {
                throw new common_1.BadRequestException('Abia State not found. Please run the migration first.');
            }
            const stateId = abiaState.id;
            const existingSession = await this.prisma.session.findFirst({
                where: {
                    name: createSessionDto.name,
                    stateId: stateId,
                },
            });
            if (existingSession) {
                this.logger.warn(`Session with name ${createSessionDto.name} already exists`);
                throw new common_1.BadRequestException(`Session with name ${createSessionDto.name} already exists`);
            }
            if (createSessionDto.isCurrent) {
                await this.prisma.session.updateMany({
                    where: { isCurrent: true, stateId: stateId },
                    data: { isCurrent: false },
                });
            }
            const newSession = await this.prisma.session.create({
                data: {
                    name: createSessionDto.name,
                    startDate: new Date(createSessionDto.startDate),
                    endDate: new Date(createSessionDto.endDate),
                    isActive: createSessionDto.isActive ?? true,
                    isCurrent: createSessionDto.isCurrent ?? false,
                    stateId: stateId,
                },
            });
            this.logger.log(`Successfully created session: ${newSession.name}`);
            return newSession;
        }
        catch (error) {
            this.logger.error(`Error creating session: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateSession(id, updateSessionDto) {
        this.logger.log(`Updating session: ${id}`);
        try {
            const existingSession = await this.prisma.session.findUnique({
                where: { id },
            });
            if (!existingSession) {
                this.logger.warn(`Session with ID ${id} not found`);
                throw new common_1.NotFoundException(`Session with ID ${id} not found`);
            }
            if (updateSessionDto.name && updateSessionDto.name !== existingSession.name) {
                const duplicateSession = await this.prisma.session.findFirst({
                    where: {
                        name: updateSessionDto.name,
                        id: { not: id },
                    },
                });
                if (duplicateSession) {
                    this.logger.warn(`Session with name ${updateSessionDto.name} already exists`);
                    throw new common_1.BadRequestException(`Session with name ${updateSessionDto.name} already exists`);
                }
            }
            if (updateSessionDto.isCurrent) {
                await this.prisma.session.updateMany({
                    where: { isCurrent: true, id: { not: id } },
                    data: { isCurrent: false },
                });
            }
            const updatedSession = await this.prisma.session.update({
                where: { id },
                data: {
                    name: updateSessionDto.name,
                    startDate: updateSessionDto.startDate ? new Date(updateSessionDto.startDate) : undefined,
                    endDate: updateSessionDto.endDate ? new Date(updateSessionDto.endDate) : undefined,
                    isActive: updateSessionDto.isActive,
                    isCurrent: updateSessionDto.isCurrent,
                },
            });
            this.logger.log(`Successfully updated session: ${updatedSession.name}`);
            return updatedSession;
        }
        catch (error) {
            this.logger.error(`Error updating session: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteSession(id) {
        this.logger.log(`Deleting session: ${id}`);
        try {
            const session = await this.prisma.session.findUnique({
                where: { id },
                include: {
                    terms: true,
                },
            });
            if (!session) {
                this.logger.warn(`Session with ID ${id} not found`);
                throw new common_1.NotFoundException(`Session with ID ${id} not found`);
            }
            if (session.terms.length > 0) {
                this.logger.warn(`Cannot delete session with existing terms`);
                throw new common_1.BadRequestException('Cannot delete session with existing terms. Delete terms first.');
            }
            await this.prisma.session.delete({
                where: { id },
            });
            this.logger.log(`Successfully deleted session: ${session.name}`);
            return { message: 'Session deleted successfully', deletedSession: session };
        }
        catch (error) {
            this.logger.error(`Error deleting session: ${error.message}`, error.stack);
            throw error;
        }
    }
    async activateSession(id) {
        this.logger.log(`Activating session: ${id}`);
        try {
            const session = await this.prisma.session.findUnique({
                where: { id },
            });
            if (!session) {
                this.logger.warn(`Session with ID ${id} not found`);
                throw new common_1.NotFoundException(`Session with ID ${id} not found`);
            }
            await this.prisma.session.updateMany({
                where: { isCurrent: true },
                data: { isCurrent: false },
            });
            const activatedSession = await this.prisma.session.update({
                where: { id },
                data: { isCurrent: true, isActive: true },
            });
            this.logger.log(`Successfully activated session: ${activatedSession.name}`);
            return activatedSession;
        }
        catch (error) {
            this.logger.error(`Error activating session: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deactivateSession(id) {
        this.logger.log(`Deactivating session: ${id}`);
        try {
            const session = await this.prisma.session.findUnique({
                where: { id },
            });
            if (!session) {
                this.logger.warn(`Session with ID ${id} not found`);
                throw new common_1.NotFoundException(`Session with ID ${id} not found`);
            }
            const deactivatedSession = await this.prisma.session.update({
                where: { id },
                data: { isCurrent: false, isActive: false },
            });
            this.logger.log(`Successfully deactivated session: ${deactivatedSession.name}`);
            return deactivatedSession;
        }
        catch (error) {
            this.logger.error(`Error deactivating session: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getSessionTerms(id) {
        this.logger.log(`Fetching terms for session: ${id}`);
        try {
            const session = await this.prisma.session.findUnique({
                where: { id },
                include: {
                    terms: {
                        orderBy: { name: 'asc' },
                    },
                },
            });
            if (!session) {
                this.logger.warn(`Session with ID ${id} not found`);
                throw new common_1.NotFoundException(`Session with ID ${id} not found`);
            }
            this.logger.log(`Successfully fetched ${session.terms.length} terms for session: ${session.name}`);
            return session.terms;
        }
        catch (error) {
            this.logger.error(`Error fetching session terms: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = SessionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionService);
//# sourceMappingURL=session.service.js.map