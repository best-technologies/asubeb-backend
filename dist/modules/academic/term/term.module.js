"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermModule = void 0;
const common_1 = require("@nestjs/common");
const term_controller_1 = require("./term.controller");
const term_service_1 = require("./term.service");
let TermModule = class TermModule {
};
exports.TermModule = TermModule;
exports.TermModule = TermModule = __decorate([
    (0, common_1.Module)({
        controllers: [term_controller_1.TermController],
        providers: [term_service_1.TermService],
        exports: [term_service_1.TermService],
    })
], TermModule);
//# sourceMappingURL=term.module.js.map