"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigQueryImportModule = void 0;
const common_1 = require("@nestjs/common");
const bigquery_import_controller_1 = require("./bigquery-import.controller");
const bigquery_import_service_1 = require("./bigquery-import.service");
const bigquery_service_1 = require("./bigquery.service");
let BigQueryImportModule = class BigQueryImportModule {
};
exports.BigQueryImportModule = BigQueryImportModule;
exports.BigQueryImportModule = BigQueryImportModule = __decorate([
    (0, common_1.Module)({
        controllers: [bigquery_import_controller_1.BigQueryImportController],
        providers: [bigquery_import_service_1.BigQueryImportService, bigquery_service_1.BigQueryService],
        exports: [bigquery_import_service_1.BigQueryImportService, bigquery_service_1.BigQueryService],
    })
], BigQueryImportModule);
//# sourceMappingURL=bigquery-import.module.js.map