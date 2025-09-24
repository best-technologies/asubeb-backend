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
exports.StudentDashboardResponseDto = exports.PerformanceTableDto = exports.GenderDistributionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class GenderDistributionDto {
    gender;
    _count;
}
exports.GenderDistributionDto = GenderDistributionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gender type', example: 'MALE' }),
    __metadata("design:type", String)
], GenderDistributionDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Count of students with this gender', example: 25 }),
    __metadata("design:type", Object)
], GenderDistributionDto.prototype, "_count", void 0);
class PerformanceTableDto {
    position;
    studentName;
    examNo;
    school;
    class;
    total;
    average;
    percentage;
    gender;
}
exports.PerformanceTableDto = PerformanceTableDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student position in class', example: 1 }),
    __metadata("design:type", Number)
], PerformanceTableDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student full name', example: 'John Doe' }),
    __metadata("design:type", String)
], PerformanceTableDto.prototype, "studentName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student ID number', example: 'STU123456' }),
    __metadata("design:type", String)
], PerformanceTableDto.prototype, "examNo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School name', example: 'Central Primary School' }),
    __metadata("design:type", String)
], PerformanceTableDto.prototype, "school", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class name', example: 'Primary 5' }),
    __metadata("design:type", String)
], PerformanceTableDto.prototype, "class", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total score', example: 450 }),
    __metadata("design:type", Number)
], PerformanceTableDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Average score', example: 85.5 }),
    __metadata("design:type", Number)
], PerformanceTableDto.prototype, "average", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Percentage score', example: 85.5 }),
    __metadata("design:type", Number)
], PerformanceTableDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student gender', example: 'MALE' }),
    __metadata("design:type", String)
], PerformanceTableDto.prototype, "gender", void 0);
class StudentDashboardResponseDto {
    session;
    term;
    lgas;
    schools;
    classes;
    subjects;
    genders;
    performanceTable;
    lastUpdated;
}
exports.StudentDashboardResponseDto = StudentDashboardResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current academic session', example: '2024/2025' }),
    __metadata("design:type", String)
], StudentDashboardResponseDto.prototype, "session", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current academic term', example: 'FIRST_TERM' }),
    __metadata("design:type", String)
], StudentDashboardResponseDto.prototype, "term", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Available LGAs', type: 'array', items: { type: 'object' } }),
    __metadata("design:type", Array)
], StudentDashboardResponseDto.prototype, "lgas", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Available schools', type: 'array', items: { type: 'object' } }),
    __metadata("design:type", Array)
], StudentDashboardResponseDto.prototype, "schools", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Available classes', type: 'array', items: { type: 'object' } }),
    __metadata("design:type", Array)
], StudentDashboardResponseDto.prototype, "classes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Available subjects', type: 'array', items: { type: 'object' } }),
    __metadata("design:type", Array)
], StudentDashboardResponseDto.prototype, "subjects", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Gender distribution', type: [GenderDistributionDto] }),
    __metadata("design:type", Array)
], StudentDashboardResponseDto.prototype, "genders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student performance table', type: [PerformanceTableDto] }),
    __metadata("design:type", Array)
], StudentDashboardResponseDto.prototype, "performanceTable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last updated timestamp', example: '2024-09-01T10:00:00.000Z' }),
    __metadata("design:type", String)
], StudentDashboardResponseDto.prototype, "lastUpdated", void 0);
//# sourceMappingURL=student-dashboard.dto.js.map