import { Module } from '@nestjs/common';
import { BigQueryImportController } from './bigquery-import.controller';
import { BigQueryImportService } from './bigquery-import.service';
import { BigQueryService } from './bigquery.service';

@Module({
  controllers: [BigQueryImportController],
  providers: [BigQueryImportService, BigQueryService],
  exports: [BigQueryImportService, BigQueryService],
})
export class BigQueryImportModule {}
