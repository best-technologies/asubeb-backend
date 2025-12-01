import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateLgaDto } from './dto';
import { ResponseHelper } from '../../../common/helpers';
import { Logger } from '@nestjs/common';
import * as colors from 'colors';

@Injectable()
export class LgaService {
  private readonly logger = new Logger(LgaService.name);
  constructor(private readonly prisma: PrismaService) {}

  async createLga(createLgaDto: CreateLgaDto) {
    this.logger.log(colors.magenta('Creating new LGA...'));
    
    // Convert inputs to lowercase
    const name = createLgaDto.name.toLowerCase().trim();
    const description = createLgaDto.description?.toLowerCase().trim();
    
    // Generate unique code: first 3 letters of name + 3 random digits
    const code = await this.generateUniqueCode(name);
    
    // Check if LGA with the same name already exists
    const existingLga = await this.prisma.localGovernmentArea.findFirst({
      where: {
        name: name,
      },
    });

    if (existingLga) {
      throw new ConflictException(
        'Local Government Area with this name already exists',
      );
    }

    // Get Abia State ID
    const abiaState = await this.prisma.state.findFirst({
      where: { stateId: 'ABIA' },
    });
    if (!abiaState) {
      throw new BadRequestException('Abia State not found. Please run the migration first.');
    }

    // Create new LGA with auto-generated fields
    const lga = await this.prisma.localGovernmentArea.create({
      data: {
        name: name,
        code: code,
        state: 'Abia State', // Automatically set to Abia State
        stateId: abiaState.id,
        description: description,
        isActive: true, // Automatically set to true
      },
    });

    this.logger.log(colors.america('LGA created successfully'));
    return ResponseHelper.created(
      'Local Government Area created successfully',
      lga
    );
  }

  /**
   * Generate unique code for LGA
   * Format: First 3 letters of name + 3 random digits
   */
  private async generateUniqueCode(name: string): Promise<string> {
    const firstThreeLetters = name.substring(0, 3).toUpperCase();
    let code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const randomDigits = Math.floor(Math.random() * 900) + 100; // 100-999
      code = `${firstThreeLetters}${randomDigits}`;
      
      // Check if code already exists
      const existingCode = await this.prisma.localGovernmentArea.findFirst({
        where: { code },
      });
      
      if (!existingCode) {
        isUnique = true;
      } else {
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error('Unable to generate unique code after maximum attempts');
    }

    return code!;
  }

  async getAllLga() {
    this.logger.log(colors.cyan('Fetching all LGAs...'));

    try {
      const lgas = await this.prisma.localGovernmentArea.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
        },
      });

      const formatted = lgas.map((l) => ({ id: l.id, name: l.name }));

      this.logger.log(colors.green(`Fetched ${formatted.length} LGAs`));
      return ResponseHelper.success('LGAs retrieved successfully', formatted);
    } catch (error) {
      this.logger.error(colors.red('Failed to fetch LGAs'), error as any);
      // Return a formatted error so controllers return consistent payloads
      return ResponseHelper.error('Failed to fetch LGAs', (error as any)?.message || error, 500);
    }
  }
} 