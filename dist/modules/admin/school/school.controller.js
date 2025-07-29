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
var SchoolController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const school_service_1 = require("./school.service");
const dto_1 = require("./dto");
const colors = require("colors");
let SchoolController = SchoolController_1 = class SchoolController {
    schoolService;
    logger = new common_1.Logger(SchoolController_1.name);
    constructor(schoolService) {
        this.schoolService = schoolService;
    }
    async createSchool(createSchoolDto) {
        this.logger.log(colors.cyan('Received school creation request'));
        return this.schoolService.createSchool(createSchoolDto);
    }
    async updateAllStudentCounts() {
        this.logger.log(colors.cyan('Received request to update all school student counts'));
        return this.schoolService.updateAllSchoolsStudentCounts();
    }
};
exports.SchoolController = SchoolController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new school' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'School created successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid input data'
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Local Government Area not found'
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'School with this name already exists'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateSchoolDto]),
    __metadata("design:returntype", Promise)
], SchoolController.prototype, "createSchool", null);
__decorate([
    (0, common_1.Post)('update-student-counts'),
    (0, swagger_1.ApiOperation)({ summary: 'Update all schools student counts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Student counts updated successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchoolController.prototype, "updateAllStudentCounts", null);
exports.SchoolController = SchoolController = SchoolController_1 = __decorate([
    (0, swagger_1.ApiTags)('admin-school'),
    (0, common_1.Controller)('admin/schools'),
    __metadata("design:paramtypes", [school_service_1.SchoolService])
], SchoolController);
//# sourceMappingURL=school.controller.js.map