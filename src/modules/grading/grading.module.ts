import { Module } from '@nestjs/common';
import { GradingController } from './grading.controller';
import { GradingService } from './grading.service';
import { AcademicModule } from '../academic/academic.module';

@Module({
  imports: [AcademicModule],
  controllers: [GradingController],
  providers: [GradingService],
  exports: [GradingService],
})
export class GradingModule {} 