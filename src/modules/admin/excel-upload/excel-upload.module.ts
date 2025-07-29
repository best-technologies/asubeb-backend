import { Module } from '@nestjs/common';
import { ExcelUploadController } from './excel-upload.controller';
import { ExcelUploadService } from './excel-upload.service';

@Module({
  controllers: [ExcelUploadController],
  providers: [ExcelUploadService],
  exports: [ExcelUploadService],
})
export class ExcelUploadModule {} 