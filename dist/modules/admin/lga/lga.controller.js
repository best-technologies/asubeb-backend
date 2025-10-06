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
var LgaController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LgaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const lga_service_1 = require("./lga.service");
const dto_1 = require("./dto");
const colors = require("colors");
let LgaController = LgaController_1 = class LgaController {
    lgaService;
    logger = new common_1.Logger(LgaController_1.name);
    constructor(lgaService) {
        this.lgaService = lgaService;
    }
    async createLga(createLgaDto) {
        this.logger.log(colors.cyan('Received LGA creation request'));
        return this.lgaService.createLga(createLgaDto);
    }
    async getAllLga() {
        this.logger.log(colors.cyan('Received request to list LGAs'));
        return this.lgaService.getAllLga();
    }
};
exports.LgaController = LgaController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new Local Government Area' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Local Government Area created successfully'
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid input data'
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Local Government Area with this name or code already exists'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateLgaDto]),
    __metadata("design:returntype", Promise)
], LgaController.prototype, "createLga", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all Local Government Areas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of LGAs retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LgaController.prototype, "getAllLga", null);
exports.LgaController = LgaController = LgaController_1 = __decorate([
    (0, swagger_1.ApiTags)('admin-lga'),
    (0, common_1.Controller)('admin/lga'),
    __metadata("design:paramtypes", [lga_service_1.LgaService])
], LgaController);
//# sourceMappingURL=lga.controller.js.map