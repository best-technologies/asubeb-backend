import { Module } from '@nestjs/common';
import { SchoolItDashboardController } from './dashboard/dashboard.controller';
import { SchoolItDashboardService } from './dashboard/dashboard.service';
import { SchoolItStudentController } from './student/student.controller';
import { SchoolItStudentService } from './student/student.service';
import { SchoolItResultController } from './result/result.controller';
import { SchoolItResultService } from './result/result.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditLogModule } from '../admin/audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [
    SchoolItDashboardController,
    SchoolItStudentController,
    SchoolItResultController,
  ],
  providers: [
    SchoolItDashboardService,
    SchoolItStudentService,
    SchoolItResultService,
  ],
})
export class SchoolItModule {}
