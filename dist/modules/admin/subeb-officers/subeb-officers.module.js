"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubebOfficersModule = void 0;
const common_1 = require("@nestjs/common");
const subeb_officers_controller_1 = require("./subeb-officers.controller");
const subeb_officers_service_1 = require("./subeb-officers.service");
const auth_module_1 = require("../../auth/auth.module");
let SubebOfficersModule = class SubebOfficersModule {
};
exports.SubebOfficersModule = SubebOfficersModule;
exports.SubebOfficersModule = SubebOfficersModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [subeb_officers_controller_1.SubebOfficersController],
        providers: [subeb_officers_service_1.SubebOfficersService],
        exports: [subeb_officers_service_1.SubebOfficersService],
    })
], SubebOfficersModule);
//# sourceMappingURL=subeb-officers.module.js.map