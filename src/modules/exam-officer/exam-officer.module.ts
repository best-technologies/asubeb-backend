import { Module } from '@nestjs/common';
import { ExamOfficerController } from './exam-officer.controller';
import { ExamOfficerService } from './exam-officer.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditLogModule } from '../admin/audit-log/audit-log.module';
import { MailModule } from '../../common/mailer/mail.module';

@Module({
  imports: [PrismaModule, AuditLogModule, MailModule],
  controllers: [ExamOfficerController],
  providers: [ExamOfficerService]
})
export class ExamOfficerModule {}
