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
var ExcelUploadController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelUploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const excel_upload_service_1 = require("./excel-upload.service");
const colors = require("colors");
let ExcelUploadController = ExcelUploadController_1 = class ExcelUploadController {
    excelUploadService;
    logger = new common_1.Logger(ExcelUploadController_1.name);
    constructor(excelUploadService) {
        this.excelUploadService = excelUploadService;
    }
    async uploadExcelFile(file) {
        this.logger.log(colors.cyan('Received Excel file upload request'));
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        return this.excelUploadService.uploadExcelFile(file);
    }
};
exports.ExcelUploadController = ExcelUploadController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload Excel file with student data' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Excel file processed successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid file or processing error'
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExcelUploadController.prototype, "uploadExcelFile", null);
exports.ExcelUploadController = ExcelUploadController = ExcelUploadController_1 = __decorate([
    (0, swagger_1.ApiTags)('admin-excel-upload'),
    (0, common_1.Controller)('admin/excel-upload'),
    __metadata("design:paramtypes", [excel_upload_service_1.ExcelUploadService])
], ExcelUploadController);
//# sourceMappingURL=excel-upload.controller.js.map