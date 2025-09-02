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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BigQueryImportController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigQueryImportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bigquery_import_service_1 = require("./bigquery-import.service");
const colors = require("colors");
let BigQueryImportController = BigQueryImportController_1 = class BigQueryImportController {
    bigQueryImportService;
    logger = new common_1.Logger(BigQueryImportController_1.name);
    constructor(bigQueryImportService) {
        this.bigQueryImportService = bigQueryImportService;
    }
    async importFromBigQuery(bigQueryData) {
        this.logger.log(colors.cyan('Received BigQuery data import request'));
        if (!bigQueryData || !Array.isArray(bigQueryData)) {
            throw new common_1.BadRequestException('Invalid data format. Expected an array of student records.');
        }
        if (bigQueryData.length === 0) {
            throw new common_1.BadRequestException('No data provided for import.');
        }
        return this.bigQueryImportService.importFromBigQuery(bigQueryData);
    }
    async importFromBigQueryBatch(body) {
        this.logger.log(colors.cyan('Received BigQuery batch import request'));
        const { data, batchSize = 100 } = body;
        if (!data || !Array.isArray(data)) {
            throw new common_1.BadRequestException('Invalid data format. Expected an array of student records.');
        }
        if (data.length === 0) {
            throw new common_1.BadRequestException('No data provided for import.');
        }
        const results = {
            totalBatches: Math.ceil(data.length / batchSize),
            processedBatches: 0,
            totalRows: data.length,
            processedRows: 0,
            createdSchools: 0,
            createdLgas: 0,
            createdStudents: 0,
            createdAssessments: 0,
            errors: [],
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
            }
            catch (error) {
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
    async importFromBigQueryTable(body) {
        this.logger.log(colors.cyan('Received BigQuery table import request'));
        const { datasetId, tableId, limit } = body;
        if (!datasetId || !tableId) {
            throw new common_1.BadRequestException('datasetId and tableId are required');
        }
        return this.bigQueryImportService.importFromBigQueryTable(datasetId, tableId, limit);
    }
    async testBigQueryConnection() {
        this.logger.log(colors.cyan('Testing BigQuery connection...'));
        const isConnected = await this.bigQueryImportService.testConnection();
        return {
            success: true,
            message: isConnected ? 'BigQuery connection successful' : 'BigQuery connection failed',
            connected: isConnected
        };
    }
};
exports.BigQueryImportController = BigQueryImportController;
__decorate([
    (0, common_1.Post)('import'),
    (0, swagger_1.ApiOperation)({ summary: 'Import student data from BigQuery' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], BigQueryImportController.prototype, "importFromBigQuery", null);
__decorate([
    (0, common_1.Post)('import-batch'),
    (0, swagger_1.ApiOperation)({ summary: 'Import student data from BigQuery in batches' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BigQueryImportController.prototype, "importFromBigQueryBatch", null);
__decorate([
    (0, common_1.Post)('import-from-table'),
    (0, swagger_1.ApiOperation)({ summary: 'Import student data directly from BigQuery table' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BigQueryImportController.prototype, "importFromBigQueryTable", null);
__decorate([
    (0, common_1.Get)('test-connection'),
    (0, swagger_1.ApiOperation)({ summary: 'Test BigQuery connection' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BigQueryImportController.prototype, "testBigQueryConnection", null);
exports.BigQueryImportController = BigQueryImportController = BigQueryImportController_1 = __decorate([
    (0, swagger_1.ApiTags)('admin-bigquery-import'),
    (0, common_1.Controller)('admin/bigquery-import'),
    __metadata("design:paramtypes", [bigquery_import_service_1.BigQueryImportService])
], BigQueryImportController);
//# sourceMappingURL=bigquery-import.controller.js.map