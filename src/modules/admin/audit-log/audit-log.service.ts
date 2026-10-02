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
        if (lower.includes('login') || lower.includes('logout') || lower.includes('auth')) determinedEntity = 'Authentication';
        else if (lower.includes('class')) determinedEntity = 'Class';
        else if (lower.includes('session')) determinedEntity = 'Academic Session';
        else if (lower.includes('term')) determinedEntity = 'Academic Term';
        else if (lower.includes('school')) determinedEntity = 'School Management';
        else if (lower.includes('student') || lower.includes('enrollment')) determinedEntity = 'Student Enrollment';
        else if (lower.includes('profile')) determinedEntity = 'User Profile';
        else if (lower.includes('officer') || lower.includes('register-officer')) determinedEntity = 'SUBEB Officer';
        else if (lower.includes('result')) determinedEntity = 'Results';
      }

      if (determinedEntityId === 'N/A' && details && typeof details === 'object') {
        determinedEntityId = details.id || details.userId || details.classId || details.schoolId || details.sessionId || details.termId || details.studentId || 'N/A';
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

      let parsedDetails = sanitizedDetails;
      if (typeof sanitizedDetails === 'string') {
        try {
          parsedDetails = JSON.parse(sanitizedDetails);
        } catch (e) {
          parsedDetails = { message: sanitizedDetails };
        }
      }

      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          details: parsedDetails || {},
          entity: determinedEntity,
          entityId: String(determinedEntityId),
        },
      });
    } catch (error: any) {
      this.logger.error(`Failed to create audit log: ${error?.message || error}`);
    }
  }

  async getLogs(page: number = 1, limit: number = 20, userRole?: string, userId?: string) {
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (userId) {
      // Users can see all of their own activities (including sign in / sign out)
      whereClause.userId = userId;
    } else {
      // System-wide view: only admins can see sign-in / sign-out logs of everyone
      const isAdmin = !userRole || ['SUPER_ADMIN', 'SUBEB_ADMIN', 'ADMIN'].includes(userRole.toUpperCase());
      if (!isAdmin) {
        whereClause.action = { notIn: ['USER_LOGIN', 'USER_LOGOUT', 'LOGIN', 'LOGOUT'] };
      }
    }
    
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where: whereClause }),
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
