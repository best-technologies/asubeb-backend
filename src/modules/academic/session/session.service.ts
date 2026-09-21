import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSessionDto, UpdateSessionDto } from './dto';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAllSessions(page: number, limit: number, isActive?: boolean) {
    this.logger.log(`Fetching sessions - page: ${page}, limit: ${limit}, isActive: ${isActive}`);

    try {
      const whereConditions: any = {};
      
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
    } catch (error) {
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
        throw new NotFoundException('No current active session found');
      }

      this.logger.log(`Current session: ${currentSession.name}`);
      return currentSession;
    } catch (error) {
      this.logger.error(`Error fetching current session: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSessionById(id: string) {
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
        throw new NotFoundException(`Session with ID ${id} not found`);
      }

      this.logger.log(`Successfully fetched session: ${session.name}`);
      return session;
    } catch (error) {
      this.logger.error(`Error fetching session by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createSession(createSessionDto: CreateSessionDto) {
    this.logger.log(`Creating new session: ${createSessionDto.name}`);

    try {
      // Get Abia State ID
      const abiaState = await this.prisma.state.findFirst({
        where: { stateId: 'ABIA' },
      });
      if (!abiaState) {
        throw new BadRequestException('Abia State not found. Please run the migration first.');
      }
      const stateId = abiaState.id;

      // Check if session name already exists for this state
      const existingSession = await this.prisma.session.findFirst({
        where: {
          name: createSessionDto.name,
          stateId: stateId,
        },
      });

      if (existingSession) {
        this.logger.warn(`Session with name ${createSessionDto.name} already exists`);
        throw new BadRequestException(`Session with name ${createSessionDto.name} already exists`);
      }

      // If this session is being set as current, deactivate other sessions and terms for this state
      const isCurrent = createSessionDto.isCurrent || (createSessionDto as any).status === 'OPEN';

      if (isCurrent) {
        await this.prisma.session.updateMany({
          where: { stateId: stateId },
          data: { isCurrent: false, status: 'CLOSED' as any },
        });

        await this.prisma.term.updateMany({
          where: { stateId: stateId },
          data: { isCurrent: false, status: 'CLOSED' as any },
        });
      }

      const newSession = await this.prisma.session.create({
        data: {
          name: createSessionDto.name,
          startDate: new Date(createSessionDto.startDate),
          endDate: new Date(createSessionDto.endDate),
          isActive: createSessionDto.isActive ?? true,
          isCurrent: isCurrent,
          status: (isCurrent ? 'OPEN' : 'CLOSED') as any,
          stateId: stateId,
        },
      });

      this.logger.log(`Successfully created session: ${newSession.name}`);
      return newSession;
    } catch (error) {
      this.logger.error(`Error creating session: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateSession(id: string, updateSessionDto: UpdateSessionDto) {
    this.logger.log(`Updating session: ${id}`);

    try {
      const existingSession = await this.prisma.session.findUnique({
        where: { id },
      });

      if (!existingSession) {
        this.logger.warn(`Session with ID ${id} not found`);
        throw new NotFoundException(`Session with ID ${id} not found`);
      }

      // If updating name, check for duplicates
      if (updateSessionDto.name && updateSessionDto.name !== existingSession.name) {
        const duplicateSession = await this.prisma.session.findFirst({
          where: {
            name: updateSessionDto.name,
            id: { not: id },
          },
        });

        if (duplicateSession) {
          this.logger.warn(`Session with name ${updateSessionDto.name} already exists`);
          throw new BadRequestException(`Session with name ${updateSessionDto.name} already exists`);
        }
      }

      // If setting as current, deactivate other sessions
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
    } catch (error) {
      this.logger.error(`Error updating session: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteSession(id: string) {
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
        throw new NotFoundException(`Session with ID ${id} not found`);
      }

      if (session.terms.length > 0) {
        this.logger.warn(`Cannot delete session with existing terms`);
        throw new BadRequestException('Cannot delete session with existing terms. Delete terms first.');
      }

      await this.prisma.session.delete({
        where: { id },
      });

      this.logger.log(`Successfully deleted session: ${session.name}`);
      return { message: 'Session deleted successfully', deletedSession: session };
    } catch (error) {
      this.logger.error(`Error deleting session: ${error.message}`, error.stack);
      throw error;
    }
  }

  async activateSession(id: string) {
    this.logger.log(`Activating session: ${id}`);

    try {
      const session = await this.prisma.session.findUnique({
        where: { id },
      });

      if (!session) {
        this.logger.warn(`Session with ID ${id} not found`);
        throw new NotFoundException(`Session with ID ${id} not found`);
      }

      return await this.prisma.$transaction(async (tx) => {
        // 1. Close and de-current all other sessions
        await tx.session.updateMany({
          where: { id: { not: id } },
          data: { isCurrent: false, status: 'CLOSED' as any },
        });

        // 2. Close and de-current all terms belonging to other sessions
        await tx.term.updateMany({
          where: { sessionId: { not: id } },
          data: { isCurrent: false, status: 'CLOSED' as any },
        });

        // 3. Mark target session as Current, Active, and OPEN
        const activatedSession = await tx.session.update({
          where: { id },
          data: { isCurrent: true, isActive: true, status: 'OPEN' as any },
        });

        // 4. Ensure target session has exactly one OPEN & Current term
        const openTerm = await tx.term.findFirst({
          where: { sessionId: id, status: 'OPEN' as any },
        });

        if (openTerm) {
          await tx.term.updateMany({
            where: { sessionId: id, id: { not: openTerm.id } },
            data: { isCurrent: false, status: 'CLOSED' as any },
          });
          await tx.term.update({
            where: { id: openTerm.id },
            data: { isCurrent: true, isActive: true, status: 'OPEN' as any },
          });
        } else {
          const firstTerm = await tx.term.findFirst({
            where: { sessionId: id },
            orderBy: { name: 'asc' },
          });
          if (firstTerm) {
            await tx.term.updateMany({
              where: { sessionId: id, id: { not: firstTerm.id } },
              data: { isCurrent: false, status: 'CLOSED' as any },
            });
            await tx.term.update({
              where: { id: firstTerm.id },
              data: { isCurrent: true, isActive: true, status: 'OPEN' as any },
            });
          }
        }

        this.logger.log(`Successfully activated session: ${activatedSession.name}`);
        return activatedSession;
      });
    } catch (error) {
      this.logger.error(`Error activating session: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deactivateSession(id: string) {
    this.logger.log(`Deactivating session: ${id}`);

    try {
      const session = await this.prisma.session.findUnique({
        where: { id },
      });

      if (!session) {
        this.logger.warn(`Session with ID ${id} not found`);
        throw new NotFoundException(`Session with ID ${id} not found`);
      }

      if (session.isCurrent) {
        throw new BadRequestException(
          'Cannot deactivate the currently active session. At least one session must remain active. To switch, activate another session.'
        );
      }

      const deactivatedSession = await this.prisma.session.update({
        where: { id },
        data: { isCurrent: false, isActive: false, status: 'CLOSED' as any },
      });

      this.logger.log(`Successfully deactivated session: ${deactivatedSession.name}`);
      return deactivatedSession;
    } catch (error) {
      this.logger.error(`Error deactivating session: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateSessionStatus(id: string, status: any) {
    this.logger.log(`Updating session status to ${status} for session: ${id}`);
    
    try {
      const session = await this.prisma.session.findUnique({
        where: { id },
      });

      if (!session) {
        this.logger.warn(`Session with ID ${id} not found`);
        throw new NotFoundException(`Session with ID ${id} not found`);
      }

      if (status === 'OPEN') {
        return await this.activateSession(id);
      }

      if (status === 'CLOSED') {
        if (session.isCurrent || (session as any).status === 'OPEN') {
          throw new BadRequestException(
            'Cannot close the active academic session. At least one session must remain open and active. To switch, activate another session.'
          );
        }

        return await this.prisma.session.update({
          where: { id },
          data: { status: 'CLOSED' as any, isCurrent: false },
        });
      }

      const updatedSession = await this.prisma.session.update({
        where: { id },
        data: { status },
      });

      this.logger.log(`Successfully updated session status: ${updatedSession.name}`);
      return updatedSession;
    } catch (error) {
      this.logger.error(`Error updating session status: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSessionTerms(id: string) {
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
        throw new NotFoundException(`Session with ID ${id} not found`);
      }

      this.logger.log(`Successfully fetched ${session.terms.length} terms for session: ${session.name}`);
      return session.terms;
    } catch (error) {
      this.logger.error(`Error fetching session terms: ${error.message}`, error.stack);
      throw error;
    }
  }
} 