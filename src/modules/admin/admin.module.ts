import { Module } from '@nestjs/common';
import { DashboardModule } from './dashboard/dashboard.module';
import { SchoolModule } from './school/school.module';
import { StudentModule } from './student/student.module';
import { ClassModule } from './class/class.module';
import { LgaModule } from './lga/lga.module';
import { ExcelUploadModule } from './excel-upload/excel-upload.module';
import { BigQueryImportModule } from './bigquery-import/bigquery-import.module';

@Module({
  imports: [
    DashboardModule,
    SchoolModule,
    StudentModule,
    ClassModule,
    LgaModule,
    ExcelUploadModule,
    BigQueryImportModule,
  ],
  exports: [
    DashboardModule,
    SchoolModule,
    StudentModule,
    ClassModule,
    LgaModule,
    ExcelUploadModule,
    BigQueryImportModule,
  ],
})
export class AdminModule {} 