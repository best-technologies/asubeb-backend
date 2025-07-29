import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AdminModule } from './modules/admin/admin.module';
import { GradingModule } from './modules/grading/grading.module';
import { AcademicModule } from './modules/academic/academic.module';
import { databaseConfig, appConfig } from './config';
import { validate } from './config/validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: ['.env.local', '.env'],
      validate,
    }),
    PrismaModule,
    HealthModule,
    AdminModule,
    GradingModule,
    AcademicModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
