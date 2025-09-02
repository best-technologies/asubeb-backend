"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const school_module_1 = require("./school/school.module");
const student_module_1 = require("./student/student.module");
const class_module_1 = require("./class/class.module");
const lga_module_1 = require("./lga/lga.module");
const excel_upload_module_1 = require("./excel-upload/excel-upload.module");
const bigquery_import_module_1 = require("./bigquery-import/bigquery-import.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            dashboard_module_1.DashboardModule,
            school_module_1.SchoolModule,
            student_module_1.StudentModule,
            class_module_1.ClassModule,
            lga_module_1.LgaModule,
            excel_upload_module_1.ExcelUploadModule,
            bigquery_import_module_1.BigQueryImportModule,
        ],
        exports: [
            dashboard_module_1.DashboardModule,
            school_module_1.SchoolModule,
            student_module_1.StudentModule,
            class_module_1.ClassModule,
            lga_module_1.LgaModule,
            excel_upload_module_1.ExcelUploadModule,
            bigquery_import_module_1.BigQueryImportModule,
        ],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map