import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DatabaseHealthService {
  constructor(private prisma: PrismaService) {}

  async checkHealth(): Promise<{ status: string; timestamp: string; details?: any }> {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        details: {
          provider: 'postgresql',
          connection: 'established',
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        details: {
          error: error.message,
          provider: 'postgresql',
          connection: 'failed',
        },
      };
    }
  }
} 