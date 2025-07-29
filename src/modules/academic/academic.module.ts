import { Module } from '@nestjs/common';
import { SessionModule } from './session/session.module';
import { TermModule } from './term/term.module';

@Module({
  imports: [SessionModule, TermModule],
  exports: [SessionModule, TermModule],
})
export class AcademicModule {} 