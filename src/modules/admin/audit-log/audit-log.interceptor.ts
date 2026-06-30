import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, method, originalUrl, body } = request;

    return next.handle().pipe(
      tap(() => {
        if (user && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
          this.auditLogService.createLog(user.id, `${method} ${originalUrl}`, body);
        }
      }),
    );
  }
}
