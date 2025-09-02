import { 
  Controller, 
  Post, 
  Get,
  Body,
  Logger,
  BadRequestException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { BigQueryImportService } from './bigquery-import.service';
import * as colors from 'colors';

// DTO for BigQuery data
interface BigQueryRow {
  school_name: string;
  lga: string;
  student_name: string;
  class: string;
  gender: string;
  english_language?: number;
  mathematics?: number;
  number_work?: number;
  general_norms?: number;
  letter_work?: number;
  rhyme?: number;
  national_values?: number;
  prevocational?: number;
  crs?: number;
  history?: number;
  igbo_language?: number;
  cca?: number;
  basic_science_technology?: number;
  total_score?: number;
}

@ApiTags('admin-bigquery-import')
@Controller('admin/bigquery-import')
export class BigQueryImportController {
  private readonly logger = new Logger(BigQueryImportController.name);

  constructor(private readonly bigQueryImportService: BigQueryImportService) {}

  @Post('import')
  @ApiOperation({ summary: 'Import student data from BigQuery' })
  async importFromBigQuery(@Body() bigQueryData: BigQueryRow[]) {
    this.logger.log(colors.cyan('Received BigQuery data import request'));
    
    if (!bigQueryData || !Array.isArray(bigQueryData)) {
      throw new BadRequestException('Invalid data format. Expected an array of student records.');
    }

    if (bigQueryData.length === 0) {
      throw new BadRequestException('No data provided for import.');
    }

    return this.bigQueryImportService.importFromBigQuery(bigQueryData);
  }

  @Post('import-batch')
  @ApiOperation({ summary: 'Import student data from BigQuery in batches' })
  async importFromBigQueryBatch(@Body() body: { data: BigQueryRow[], batchSize?: number }) {
    this.logger.log(colors.cyan('Received BigQuery batch import request'));
    
    const { data, batchSize = 100 } = body;
    
    if (!data || !Array.isArray(data)) {
      throw new BadRequestException('Invalid data format. Expected an array of student records.');
    }

    if (data.length === 0) {
      throw new BadRequestException('No data provided for import.');
    }

    // Process in batches
    const results = {
      totalBatches: Math.ceil(data.length / batchSize),
      processedBatches: 0,
      totalRows: data.length,
      processedRows: 0,
      createdSchools: 0,
      createdLgas: 0,
      createdStudents: 0,
      createdAssessments: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      this.logger.log(colors.yellow(`Processing batch ${batchNumber}/${results.totalBatches} (${batch.length} records)`));
      
      try {
        const batchResult = await this.bigQueryImportService.importFromBigQuery(batch);
        results.processedBatches++;
        results.processedRows += batchResult.data.processedRows;
        results.createdSchools += batchResult.data.createdSchools || 0;
        results.createdLgas += batchResult.data.createdLgas || 0;
        results.createdStudents += batchResult.data.createdStudents || 0;
        results.createdAssessments += batchResult.data.createdAssessments || 0;
        results.errors.push(...(batchResult.data.errors || []));
      } catch (error) {
        const errorMsg = `Batch ${batchNumber}: ${error.message}`;
        results.errors.push(errorMsg);
        this.logger.error(colors.red(errorMsg));
      }
    }

    this.logger.log(colors.green(`Batch import completed: ${results.processedBatches}/${results.totalBatches} batches processed`));
    
    return {
      success: true,
      message: 'BigQuery batch import completed',
      data: results
    };
  }

  @Post('import-from-table')
  @ApiOperation({ summary: 'Import student data directly from BigQuery table' })
  async importFromBigQueryTable(@Body() body: { datasetId: string, tableId: string, limit?: number }) {
    this.logger.log(colors.cyan('Received BigQuery table import request'));
    
    const { datasetId, tableId, limit } = body;
    
    if (!datasetId || !tableId) {
      throw new BadRequestException('datasetId and tableId are required');
    }

    return this.bigQueryImportService.importFromBigQueryTable(datasetId, tableId, limit);
  }

  @Get('test-connection')
  @ApiOperation({ summary: 'Test BigQuery connection' })
  async testBigQueryConnection() {
    this.logger.log(colors.cyan('Testing BigQuery connection...'));
    
    const isConnected = await this.bigQueryImportService.testConnection();
    
    return {
      success: true,
      message: isConnected ? 'BigQuery connection successful' : 'BigQuery connection failed',
      connected: isConnected
    };
  }
}
