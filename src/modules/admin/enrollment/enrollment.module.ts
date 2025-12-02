import { Module } from '@nestjs/common';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AcademicModule } from '../../academic/academic.module';

@Module({
  imports: [PrismaModule, AcademicModule],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}


