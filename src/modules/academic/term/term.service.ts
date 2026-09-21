import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class TermService {
  private readonly logger = new Logger(TermService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAllTerms(page: number, limit: number, sessionId?: string, isActive?: boolean) {
    this.logger.log(`Fetching terms - page: ${page}, limit: ${limit}, sessionId: ${sessionId}, isActive: ${isActive}`);

    try {
      const whereConditions: any = {};
      
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
    } catch (error) {
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
            },
          },
        },
      });

      if (!currentTerm) {
        this.logger.warn('No current active term found');
        throw new NotFoundException('No current active term found');
      }

      this.logger.log(`Current term: ${currentTerm.name}`);
      return currentTerm;
    } catch (error) {
      this.logger.error(`Error fetching current term: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTermById(id: string) {
    this.logger.log(`Fetching term by ID: ${id}`);

    try {
      const term = await this.prisma.term.findUnique({
        where: { id },
        include: {
          session: {
            select: {
              id: true,
              name: true,
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
        throw new NotFoundException(`Term with ID ${id} not found`);
      }

      this.logger.log(`Successfully fetched term: ${term.name}`);
      return term;
    } catch (error) {
      this.logger.error(`Error fetching term by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createTerm(createTermDto: any) {
    this.logger.log(`Creating new term: ${createTermDto.name} for session: ${createTermDto.sessionId}`);

    try {
      // Check if session exists
      const session = await this.prisma.session.findUnique({
        where: { id: createTermDto.sessionId },
      });

      if (!session) {
        this.logger.warn(`Session with ID ${createTermDto.sessionId} not found`);
        throw new BadRequestException(`Session with ID ${createTermDto.sessionId} not found`);
      }

      // Get stateId from session
      const stateId = session.stateId;
      if (!stateId) {
        throw new BadRequestException('Session does not have a stateId. Please update the session first.');
      }

      // Check if term name already exists for the session and state
      const existingTerm = await this.prisma.term.findFirst({
        where: {
          name: createTermDto.name,
          sessionId: createTermDto.sessionId,
          stateId: stateId,
        },
      });

      if (existingTerm) {
        this.logger.warn(`Term with name ${createTermDto.name} already exists for this session`);
        throw new BadRequestException(`Term with name ${createTermDto.name} already exists for this session`);
      }

      // If this term is being set as current, deactivate all other terms in the database
      const isCurrent = createTermDto.isCurrent || (createTermDto as any).status === 'OPEN';

      if (isCurrent) {
        // Ensure parent session is active and other sessions closed
        await this.prisma.session.updateMany({
          where: { id: { not: createTermDto.sessionId } },
          data: { isCurrent: false, status: 'CLOSED' as any },
        });
        await this.prisma.session.update({
          where: { id: createTermDto.sessionId },
          data: { isCurrent: true, isActive: true, status: 'OPEN' as any },
        });

        await this.prisma.term.updateMany({
          data: { isCurrent: false, status: 'CLOSED' as any },
        });
      }

      const newTerm = await this.prisma.term.create({
        data: {
          name: createTermDto.name,
          sessionId: createTermDto.sessionId,
          startDate: new Date(createTermDto.startDate),
          endDate: new Date(createTermDto.endDate),
          isActive: createTermDto.isActive ?? true,
          isCurrent: isCurrent,
          status: (isCurrent ? 'OPEN' : 'CLOSED') as any,
          stateId: stateId,
        },
        include: {
          session: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(`Successfully created term: ${newTerm.name}`);
      return newTerm;
    } catch (error) {
      this.logger.error(`Error creating term: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateTerm(id: string, updateTermDto: any) {
    this.logger.log(`Updating term: ${id}`);

    try {
      const existingTerm = await this.prisma.term.findUnique({
        where: { id },
      });

      if (!existingTerm) {
        this.logger.warn(`Term with ID ${id} not found`);
        throw new NotFoundException(`Term with ID ${id} not found`);
      }

      // If updating name, check for duplicates
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
          throw new BadRequestException(`Term with name ${updateTermDto.name} already exists for this session`);
        }
      }

      // If setting as current, deactivate other terms in the session
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
            },
          },
        },
      });

      this.logger.log(`Successfully updated term: ${updatedTerm.name}`);
      return updatedTerm;
    } catch (error) {
      this.logger.error(`Error updating term: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteTerm(id: string) {
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
        throw new NotFoundException(`Term with ID ${id} not found`);
      }

      if (term.assessments.length > 0) {
        this.logger.warn(`Cannot delete term with existing assessments`);
        throw new BadRequestException('Cannot delete term with existing assessments. Delete assessments first.');
      }

      await this.prisma.term.delete({
        where: { id },
      });

      this.logger.log(`Successfully deleted term: ${term.name}`);
      return { message: 'Term deleted successfully', deletedTerm: term };
    } catch (error) {
      this.logger.error(`Error deleting term: ${error.message}`, error.stack);
      throw error;
    }
  }

  async activateTerm(id: string) {
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
        throw new NotFoundException(`Term with ID ${id} not found`);
      }

      return await this.prisma.$transaction(async (tx) => {
        // 1. Ensure the parent session is also active & open, and close other sessions
        await tx.session.updateMany({
          where: { id: { not: term.sessionId } },
          data: { isCurrent: false, status: 'CLOSED' as any },
        });

        await tx.session.update({
          where: { id: term.sessionId },
          data: { isCurrent: true, isActive: true, status: 'OPEN' as any },
        });

        // 2. Close and de-current ALL other terms across the entire database
        await tx.term.updateMany({
          where: { id: { not: id } },
          data: { isCurrent: false, status: 'CLOSED' as any },
        });

        // 3. Mark target term as Current, Active, and OPEN
        const activatedTerm = await tx.term.update({
          where: { id },
          data: { isCurrent: true, isActive: true, status: 'OPEN' as any },
          include: {
            session: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        this.logger.log(`Successfully activated term: ${activatedTerm.name} for session: ${term.session?.name}`);
        return activatedTerm;
      });
    } catch (error) {
      this.logger.error(`Error activating term: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deactivateTerm(id: string) {
    this.logger.log(`Deactivating term: ${id}`);

    try {
      const term = await this.prisma.term.findUnique({
        where: { id },
      });

      if (!term) {
        this.logger.warn(`Term with ID ${id} not found`);
        throw new NotFoundException(`Term with ID ${id} not found`);
      }

      if (term.isCurrent) {
        throw new BadRequestException(
          'Cannot deactivate the currently active term. At least one term must remain active. To switch, activate another term.'
        );
      }

      const deactivatedTerm = await this.prisma.term.update({
        where: { id },
        data: { isCurrent: false, isActive: false, status: 'CLOSED' as any },
        include: {
          session: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(`Successfully deactivated term: ${deactivatedTerm.name}`);
      return deactivatedTerm;
    } catch (error) {
      this.logger.error(`Error deactivating term: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateTermStatus(id: string, status: any) {
    this.logger.log(`Updating term status to ${status} for term: ${id}`);
    
    try {
      const term = await this.prisma.term.findUnique({
        where: { id },
      });

      if (!term) {
        this.logger.warn(`Term with ID ${id} not found`);
        throw new NotFoundException(`Term with ID ${id} not found`);
      }

      if (status === 'OPEN') {
        return await this.activateTerm(id);
      }

      if (status === 'CLOSED') {
        if (term.isCurrent || (term as any).status === 'OPEN') {
          throw new BadRequestException(
            'Cannot close the active academic term. At least one term must remain open and active. To switch, activate another term.'
          );
        }

        return await this.prisma.term.update({
          where: { id },
          data: { status: 'CLOSED' as any, isCurrent: false },
        });
      }

      const updatedTerm = await this.prisma.term.update({
        where: { id },
        data: { status },
      });

      this.logger.log(`Successfully updated term status: ${updatedTerm.name}`);
      return updatedTerm;
    } catch (error) {
      this.logger.error(`Error updating term status: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTermAssessments(id: string) {
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
        throw new NotFoundException(`Term with ID ${id} not found`);
      }

      this.logger.log(`Successfully fetched ${term.assessments.length} assessments for term: ${term.name}`);
      return term.assessments;
    } catch (error) {
      this.logger.error(`Error fetching term assessments: ${error.message}`, error.stack);
      throw error;
    }
  }
} 