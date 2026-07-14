import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createLog(userId: string, action: string, details: any) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          details: JSON.stringify(details),
          entity: 'General',
          entityId: 'N/A',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`);
    }
  }

  async getLogs(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count(),
    ]);

    const userIds = [...new Set(logs.map(l => l.userId))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true },
    });

    const userMap = users.reduce((acc, user) => {
      acc[user.id] = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';
      return acc;
    }, {} as Record<string, string>);

    const enrichedLogs = logs.map(log => ({
      ...log,
      userName: userMap[log.userId] || 'System',
    }));

    return {
      data: enrichedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
