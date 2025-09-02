"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BigQueryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigQueryService = void 0;
const common_1 = require("@nestjs/common");
const bigquery_1 = require("@google-cloud/bigquery");
const colors = require("colors");
let BigQueryService = BigQueryService_1 = class BigQueryService {
    logger = new common_1.Logger(BigQueryService_1.name);
    bigquery;
    constructor() {
        this.bigquery = new bigquery_1.BigQuery({
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
    async queryStudentData(query) {
        this.logger.log(colors.cyan('Executing BigQuery...'));
        try {
            const [rows] = await this.bigquery.query({
                query: query,
            });
            this.logger.log(colors.green(`BigQuery returned ${rows.length} rows`));
            return rows;
        }
        catch (error) {
            this.logger.error(colors.red(`BigQuery error: ${error.message}`));
            throw error;
        }
    }
    async getStudentDataFromTable(datasetId, tableId, limit) {
        const limitClause = limit ? `LIMIT ${limit}` : '';
        const query = `
      SELECT *
      FROM \`${this.bigquery.projectId}.${datasetId}.${tableId}\`
      ${limitClause}
    `;
        this.logger.log(colors.yellow(`Fetching from: ${datasetId}.${tableId}`));
        return this.queryStudentData(query);
    }
    async testConnection() {
        try {
            const query = 'SELECT 1 as test';
            await this.bigquery.query(query);
            this.logger.log(colors.green('BigQuery connection successful'));
            return true;
        }
        catch (error) {
            this.logger.error(colors.red(`BigQuery connection failed: ${error.message}`));
            return false;
        }
    }
};
exports.BigQueryService = BigQueryService;
exports.BigQueryService = BigQueryService = BigQueryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BigQueryService);
//# sourceMappingURL=bigquery.service.js.map