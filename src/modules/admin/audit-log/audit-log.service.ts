import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createLog(userId: string, action: string, details: any, entity?: string, entityId?: string) {
    try {
      let determinedEntity = entity || 'General';
      let determinedEntityId = entityId || 'N/A';

      if (determinedEntity === 'General' && action) {
        const lower = action.toLowerCase();
        if (lower.includes('classes')) determinedEntity = 'Class';
        else if (lower.includes('sessions')) determinedEntity = 'Academic Session';
        else if (lower.includes('terms')) determinedEntity = 'Academic Term';
        else if (lower.includes('schools')) determinedEntity = 'School Management';
        else if (lower.includes('students') || lower.includes('enrollment')) determinedEntity = 'Student Enrollment';
        else if (lower.includes('profile')) determinedEntity = 'User Profile';
        else if (lower.includes('officers') || lower.includes('register-officer')) determinedEntity = 'SUBEB Officer';
        else if (lower.includes('results')) determinedEntity = 'Results';
      }

      if (determinedEntityId === 'N/A' && details && typeof details === 'object') {
        determinedEntityId = details.id || details.classId || details.schoolId || details.sessionId || details.termId || details.studentId || 'N/A';
      }

      let sanitizedDetails = details;
      if (details && typeof details === 'object') {
        const copy = { ...details };
        delete copy.password;
        delete copy.confirmPassword;
        delete copy.currentPassword;
        delete copy.newPassword;
        delete copy.token;
        sanitizedDetails = copy;
      }

      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          details: typeof sanitizedDetails === 'string' ? sanitizedDetails : JSON.stringify(sanitizedDetails || {}),
          entity: determinedEntity,
          entityId: String(determinedEntityId),
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
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    const userMap = users.reduce((acc, user) => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      acc[user.id] = fullName ? `${fullName} (${user.email})` : user.email;
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
