import { Module } from '@nestjs/common';
import { DashboardModule } from './dashboard/dashboard.module';
import { SchoolModule } from './school/school.module';
import { StudentModule } from './student/student.module';
import { ClassModule } from './class/class.module';
import { LgaModule } from './lga/lga.module';
import { ExcelUploadModule } from './excel-upload/excel-upload.module';

@Module({
  imports: [
    DashboardModule,
    SchoolModule,
    StudentModule,
    ClassModule,
    LgaModule,
    ExcelUploadModule,
  ],
  exports: [
    DashboardModule,
    SchoolModule,
    StudentModule,
    ClassModule,
    LgaModule,
    ExcelUploadModule,
  ],
})
export class AdminModule {} 