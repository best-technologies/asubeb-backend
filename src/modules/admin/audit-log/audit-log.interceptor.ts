import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

function decodeJwtPayload(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, body, headers } = request;

    const targetMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

    if (!targetMethods.includes(method)) {
      return next.handle();
    }

    // Skip public authentication endpoints to avoid logging raw credential payloads
    if (
      originalUrl?.includes('/auth/login') ||
      originalUrl?.includes('/auth/refresh') ||
      originalUrl?.includes('/auth/forgot-password') ||
      originalUrl?.includes('/auth/reset-password')
    ) {
      return next.handle();
    }

    // Skip endpoints that already implement rich domain-specific audit logging to prevent duplicate entries
    if (
      originalUrl?.includes('/exam-officer/results') ||
      originalUrl?.includes('/school-it/students') ||
      originalUrl?.includes('/school-it/results')
    ) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async () => {
        try {
          let userId: string | null = null;

          // 1. Check if user is attached by Passport JwtAuthGuard
          if (request.user) {
            userId = request.user.id || request.user.userId || request.user.sub || null;
          }

          // 2. Decode Authorization Bearer token header if request.user is missing
          if (!userId && headers?.authorization) {
            const authHeader = headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
              const token = authHeader.split(' ')[1];
              const decoded = decodeJwtPayload(token);
              if (decoded) {
                userId = decoded.sub || decoded.id || decoded.userId || null;
              }
            }
          }

          // 3. Fallback: Lookup default admin user
          if (!userId) {
            const adminUser = await this.prisma.user.findFirst({
              where: { role: { in: [UserRole.SUPER_ADMIN, UserRole.SUBEB_ADMIN, UserRole.ADMIN] } },
              select: { id: true },
            });
            if (adminUser) {
              userId = adminUser.id;
            }
          }

          if (userId) {
            const cleanUrl = (originalUrl || '').split('?')[0];
            const action = `${method} ${cleanUrl}`;
            await this.auditLogService.createLog(userId, action, body);
          }
        } catch (err) {
          // Log errors silently without failing client request
        }
      }),
    );
  }
}
