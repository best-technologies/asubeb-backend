import { Module } from '@nestjs/common';
import { SessionModule } from './session/session.module';
import { TermModule } from './term/term.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AcademicContextService } from './academic-context.service';

@Module({
  imports: [SessionModule, TermModule, PrismaModule],
  providers: [AcademicContextService],
  exports: [SessionModule, TermModule, AcademicContextService],
})
export class AcademicModule {} 