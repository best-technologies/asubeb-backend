import {
  Injectable,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EnrollOfficerDto, UpdateOfficerDto } from './dto';
import { ResponseHelper } from '../../../common/helpers/response.helper';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SubebOfficersService {
  private readonly logger = new Logger(SubebOfficersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate unique officer ID
   * Format: OFF + 5 random digits
   */
  private async generateUniqueOfficerId(): Promise<string> {
    let officerId: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 20;

    while (!isUnique && attempts < maxAttempts) {
      const randomDigits = Math.floor(Math.random() * 90000) + 10000; // 5 digits
      officerId = `OFF${randomDigits}`;

      const existingOfficer = await this.prisma.subebOfficer.findFirst({
        where: { officerId },
      });

      if (!existingOfficer) {
        isUnique = true;
      } else {
        attempts++;
      }
    }

    if (!isUnique) {
      throw new InternalServerErrorException('Unable to generate unique officer ID');
    }

    return officerId!;
  }

  /**
   * Enroll a new SUBEB officer.
   * Creates records in both User and SubebOfficer tables.
   * Updates the totalOfficers counter in State table.
   * Only users with role 'subeb-admin' or 'admin' can enroll officers.
   * @param data - Officer enrollment data
   * @param enrolledByUserId - ID of the user performing the enrollment
   */
  async enrollOfficer(data: EnrollOfficerDto, enrolledByUserId: string) {
    this.logger.log(`Enrolling SUBEB officer: ${data.email} by user: ${enrolledByUserId}`);
    if (!data?.email || !data?.password || !data?.firstName || !data?.lastName || !data?.phone) {
      this.logger.warn('enrollOfficer called with missing required fields');
      throw new BadRequestException('Email, password, firstName, lastName, and phone are required');
    }

    if (!enrolledByUserId) {
      this.logger.warn('enrollOfficer called without enrolledByUserId');
      throw new BadRequestException('Enrolled by user ID is required');
    }

    try {
      // Check if user with this email already exists
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        this.logger.warn(`Attempt to enroll officer with existing email: ${data.email}`);
        throw new ConflictException('User with this email already exists');
      }

      // Hash the password
      const hashed = await bcrypt.hash(data.password, 10);

      // Generate unique officer ID
      const officerId = await this.generateUniqueOfficerId();

      // Get default Abia State if stateId not provided
      let stateId = data.stateId;
      if (!stateId) {
        const abiaState = await this.prisma.state.findFirst({
          where: { stateId: 'ABIA' },
        });
        if (!abiaState) {
          throw new BadRequestException('Abia State not found. Please provide a stateId.');
        }
        stateId = abiaState.id;
      }

      // Use transaction to ensure atomicity
      const result = await this.prisma.$transaction(async (tx) => {
        // Create the officer user with role 'SUBEB_OFFICER'
        const user = await tx.user.create({
          data: {
            email: data.email,
            username: data.email,
            password: hashed,
            firstName: data.firstName,
            lastName: data.lastName,
            role: UserRole.SUBEB_OFFICER,
            stateId: stateId,
          },
        });

        // Create the SubebOfficer record
        const subebOfficer = await tx.subebOfficer.create({
          data: {
            userId: user.id,
            officerId: officerId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            designation: data.designation,
            stateId: stateId,
            enrolledBy: enrolledByUserId,
          },
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

        // Update State counter
        await tx.state.update({
          where: { id: stateId },
          data: {
            totalOfficers: {
              increment: 1,
            },
          },
        });

        return subebOfficer;
      });

      this.logger.log(`Enrolled SUBEB officer: ${result.email} (${result.id})`);
      return ResponseHelper.created('SUBEB officer enrolled successfully', result);
    } catch (error) {
      // If we already threw a known exception, rethrow it
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to enroll SUBEB officer ${data.email}: ${error?.message ?? error}`,
      );
      throw new InternalServerErrorException('Failed to enroll SUBEB officer');
    }
  }

  /**
   * Get all enrolled SUBEB officers with pagination
   * Filters by stateId if provided (to show only officers in the current user's state)
   */
  async getAllOfficers(page: number = 1, limit: number = 10, stateId?: string) {
    this.logger.log(`Fetching SUBEB officers - page: ${page}, limit: ${limit}, stateId: ${stateId || 'all'}`);

    const skip = (page - 1) * limit;

    // Build where clause - filter by state if provided
    const whereClause: any = {};
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

      return ResponseHelper.success(
        'SUBEB officers retrieved successfully',
        {
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1,
          },
        },
        officers,
      );
    } catch (error) {
      this.logger.error(`Failed to fetch SUBEB officers: ${error?.message ?? error}`);
      throw new InternalServerErrorException('Failed to fetch SUBEB officers');
    }
  }

  /**
   * Update a SUBEB officer (partial update)
   * Only updates fields that are provided in the request
   * enrolledBy cannot be updated
   */
  async updateOfficer(id: string, data: UpdateOfficerDto) {
    this.logger.log(`Updating SUBEB officer: ${id}`);

    try {
      // Check if officer exists
      const existingOfficer = await this.prisma.subebOfficer.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!existingOfficer) {
        this.logger.warn(`SUBEB officer with ID ${id} not found`);
        throw new NotFoundException(`SUBEB officer with ID ${id} not found`);
      }

      // If email is being updated, check if the new email already exists
      if (data.email && data.email !== existingOfficer.email) {
        const emailExists = await this.prisma.user.findUnique({
          where: { email: data.email },
        });

        if (emailExists && emailExists.id !== existingOfficer.userId) {
          this.logger.warn(`Attempt to update officer with existing email: ${data.email}`);
          throw new ConflictException('User with this email already exists');
        }
      }

      // Build update data for SubebOfficer (only include provided fields)
      const subebOfficerUpdateData: any = {};
      if (data.firstName !== undefined) subebOfficerUpdateData.firstName = data.firstName;
      if (data.lastName !== undefined) subebOfficerUpdateData.lastName = data.lastName;
      if (data.email !== undefined) subebOfficerUpdateData.email = data.email;
      if (data.phone !== undefined) subebOfficerUpdateData.phone = data.phone;
      if (data.address !== undefined) subebOfficerUpdateData.address = data.address;
      if (data.designation !== undefined) subebOfficerUpdateData.designation = data.designation;
      if (data.isActive !== undefined) subebOfficerUpdateData.isActive = data.isActive;

      // Build update data for User (only include fields that exist in User model)
      const userUpdateData: any = {};
      if (data.firstName !== undefined) userUpdateData.firstName = data.firstName;
      if (data.lastName !== undefined) userUpdateData.lastName = data.lastName;
      if (data.email !== undefined) {
        userUpdateData.email = data.email;
        userUpdateData.username = data.email; // Update username to match email
      }

      // Use transaction to ensure atomicity
      const result = await this.prisma.$transaction(async (tx) => {
        // Update User if there are user fields to update
        if (Object.keys(userUpdateData).length > 0) {
          await tx.user.update({
            where: { id: existingOfficer.userId },
            data: userUpdateData,
          });
        }

        // Update SubebOfficer if there are officer fields to update
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

        // If no updates, fetch and return existing officer with full relations
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
        throw new NotFoundException(`SUBEB officer with ID ${id} not found`);
      }

      this.logger.log(`Updated SUBEB officer: ${result.email} (${result.id})`);
      return ResponseHelper.success('SUBEB officer updated successfully', result);
    } catch (error) {
      // If we already threw a known exception, rethrow it
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to update SUBEB officer ${id}: ${error?.message ?? error}`,
      );
      throw new InternalServerErrorException('Failed to update SUBEB officer');
    }
  }
}

