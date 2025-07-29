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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSchoolDto = exports.SchoolLevel = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var SchoolLevel;
(function (SchoolLevel) {
    SchoolLevel["PRIMARY"] = "PRIMARY";
    SchoolLevel["SECONDARY"] = "SECONDARY";
})(SchoolLevel || (exports.SchoolLevel = SchoolLevel = {}));
class CreateSchoolDto {
    name;
    address;
    phone;
    email;
    website;
    principalName;
    principalPhone;
    principalEmail;
    establishedYear;
    totalStudents;
    totalTeachers;
    capacity;
    level;
    lgaId;
}
exports.CreateSchoolDto = CreateSchoolDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the school (will be converted to lowercase)',
        example: 'Asubeb Primary School',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toLowerCase()?.trim()),
    __metadata("design:type", String)
], CreateSchoolDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Address of the school (will be converted to lowercase)',
        example: '123 Education Street, Abuja',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toLowerCase()?.trim()),
    __metadata("design:type", String)
], CreateSchoolDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Phone number of the school',
        example: '+234 801 234 5678',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSchoolDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Email address of the school',
        example: 'info@asubeb.edu.ng',
    }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toLowerCase()?.trim()),
    __metadata("design:type", String)
], CreateSchoolDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Website of the school',
        example: 'https://asubeb.edu.ng',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toLowerCase()?.trim()),
    __metadata("design:type", String)
], CreateSchoolDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Name of the principal (will be converted to lowercase)',
        example: 'Dr. Sarah Johnson',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toLowerCase()?.trim()),
    __metadata("design:type", String)
], CreateSchoolDto.prototype, "principalName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Phone number of the principal',
        example: '+234 801 234 5678',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSchoolDto.prototype, "principalPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Email address of the principal',
        example: 'principal@asubeb.edu.ng',
    }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.toLowerCase()?.trim()),
    __metadata("design:type", String)
], CreateSchoolDto.prototype, "principalEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Year the school was established',
        example: 2010,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSchoolDto.prototype, "establishedYear", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Total number of students',
        example: 450,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSchoolDto.prototype, "totalStudents", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Total number of teachers',
        example: 25,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSchoolDto.prototype, "totalTeachers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'School capacity',
        example: 500,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSchoolDto.prototype, "capacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Level of the school',
        enum: SchoolLevel,
        example: SchoolLevel.PRIMARY,
    }),
    (0, class_validator_1.IsEnum)(SchoolLevel),
    __metadata("design:type", String)
], CreateSchoolDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the Local Government Area',
        example: 'clx123456789',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSchoolDto.prototype, "lgaId", void 0);
//# sourceMappingURL=create-school.dto.js.map