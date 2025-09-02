import { Injectable, Logger } from '@nestjs/common';
import { BigQuery } from '@google-cloud/bigquery';
import * as colors from 'colors';

@Injectable()
export class BigQueryService {
  private readonly logger = new Logger(BigQueryService.name);
  private bigquery: BigQuery;

  constructor() {
    // // Log environment variables for debugging
    // this.logger.log(colors.yellow('BigQuery Configuration:'));
    // this.logger.log(colors.yellow(`Project ID: ${process.env.GOOGLE_CLOUD_PROJECT_ID}`));
    // this.logger.log(colors.yellow(`Client Email: ${process.env.GOOGLE_CLOUD_CLIENT_EMAIL}`));
    // this.logger.log(colors.yellow(`Location: ${process.env.BIGQUERY_LOCATION}`));
    // this.logger.log(colors.yellow(`Private Key ID: ${process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID}`));
    
    // Initialize BigQuery client with environment variables
    this.bigquery = new BigQuery({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
        private_key_id: process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLOUD_CLIENT_ID,
      },
    });
  }

  async queryStudentData(query: string): Promise<any[]> {
    this.logger.log(colors.cyan('Executing BigQuery...'));
    
    try {
      const [rows] = await this.bigquery.query({
        query: query,
        // Don't specify location - let BigQuery use the dataset's default location
      });

      this.logger.log(colors.green(`BigQuery returned ${rows.length} rows`));
      return rows;
    } catch (error) {
      this.logger.error(colors.red(`BigQuery error: ${error.message}`));
      throw error;
    }
  }

  async getStudentDataFromTable(
    datasetId: string, 
    tableId: string, 
    limit?: number
  ): Promise<any[]> {
    const limitClause = limit ? `LIMIT ${limit}` : '';
    
    // Use SELECT * to avoid column name issues
    const query = `
      SELECT *
      FROM \`${this.bigquery.projectId}.${datasetId}.${tableId}\`
      ${limitClause}
    `;

    this.logger.log(colors.yellow(`Fetching from: ${datasetId}.${tableId}`));
    return this.queryStudentData(query);
  }

  // Helper method to test connection
  async testConnection(): Promise<boolean> {
    try {
      const query = 'SELECT 1 as test';
      await this.bigquery.query(query);
      this.logger.log(colors.green('BigQuery connection successful'));
      return true;
    } catch (error) {
      this.logger.error(colors.red(`BigQuery connection failed: ${error.message}`));
      return false;
    }
  }
}
