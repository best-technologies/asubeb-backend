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
exports.StudentExplorerResponseDto = exports.TotalsDto = exports.StudentDto = exports.ClassDto = exports.SchoolDto = exports.LgaDto = exports.SessionDto = exports.TermDto = exports.SelectionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class SelectionDto {
    id;
    name;
}
exports.SelectionDto = SelectionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Selection ID', example: 'session-uuid-123' }),
    __metadata("design:type", String)
], SelectionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Selection name', example: '2024/2025' }),
    __metadata("design:type", String)
], SelectionDto.prototype, "name", void 0);
class TermDto {
    id;
    name;
    isCurrent;
}
exports.TermDto = TermDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Term ID', example: 'term-uuid-123' }),
    __metadata("design:type", String)
], TermDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Term name', example: 'FIRST_TERM' }),
    __metadata("design:type", String)
], TermDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this is the current term', example: true }),
    __metadata("design:type", Boolean)
], TermDto.prototype, "isCurrent", void 0);
class SessionDto {
    id;
    name;
    isCurrent;
    terms;
}
exports.SessionDto = SessionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session ID', example: 'session-uuid-123' }),
    __metadata("design:type", String)
], SessionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session name', example: '2024/2025' }),
    __metadata("design:type", String)
], SessionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this is the current session', example: true }),
    __metadata("design:type", Boolean)
], SessionDto.prototype, "isCurrent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session terms', type: [TermDto] }),
    __metadata("design:type", Array)
], SessionDto.prototype, "terms", void 0);
class LgaDto {
    id;
    name;
    code;
    state;
}
exports.LgaDto = LgaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'LGA ID', example: 'lga-uuid-123' }),
    __metadata("design:type", String)
], LgaDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'LGA name', example: 'Umuahia North' }),
    __metadata("design:type", String)
], LgaDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'LGA code', example: 'UMN' }),
    __metadata("design:type", String)
], LgaDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'LGA state', example: 'Abia' }),
    __metadata("design:type", String)
], LgaDto.prototype, "state", void 0);
class SchoolDto {
    id;
    name;
    code;
    level;
}
exports.SchoolDto = SchoolDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School ID', example: 'school-uuid-123' }),
    __metadata("design:type", String)
], SchoolDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School name', example: 'Central Primary School' }),
    __metadata("design:type", String)
], SchoolDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School code', example: 'CPS' }),
    __metadata("design:type", String)
], SchoolDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School level', example: 'PRIMARY' }),
    __metadata("design:type", String)
], SchoolDto.prototype, "level", void 0);
class ClassDto {
    id;
    name;
    grade;
    section;
}
exports.ClassDto = ClassDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class ID', example: 'class-uuid-123' }),
    __metadata("design:type", String)
], ClassDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class name', example: 'Primary 5' }),
    __metadata("design:type", String)
], ClassDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class grade', example: 5 }),
    __metadata("design:type", Number)
], ClassDto.prototype, "grade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class section', example: 'A' }),
    __metadata("design:type", String)
], ClassDto.prototype, "section", void 0);
class StudentDto {
    id;
    firstName;
    lastName;
    studentId;
    gender;
    email;
    school;
    class;
    assessments;
}
exports.StudentDto = StudentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student ID', example: 'student-uuid-123' }),
    __metadata("design:type", String)
], StudentDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student first name', example: 'John' }),
    __metadata("design:type", String)
], StudentDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student last name', example: 'Doe' }),
    __metadata("design:type", String)
], StudentDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student ID number', example: 'STU123456' }),
    __metadata("design:type", String)
], StudentDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student gender', example: 'MALE' }),
    __metadata("design:type", String)
], StudentDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student email', example: 'john.doe@example.com' }),
    __metadata("design:type", String)
], StudentDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student school information' }),
    __metadata("design:type", Object)
], StudentDto.prototype, "school", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student class information' }),
    __metadata("design:type", Object)
], StudentDto.prototype, "class", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student assessments', required: false }),
    __metadata("design:type", Array)
], StudentDto.prototype, "assessments", void 0);
class TotalsDto {
    schools;
    classes;
    students;
}
exports.TotalsDto = TotalsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of schools', example: 1000 }),
    __metadata("design:type", Number)
], TotalsDto.prototype, "schools", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of classes', example: 9 }),
    __metadata("design:type", Number)
], TotalsDto.prototype, "classes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of students', example: 57 }),
    __metadata("design:type", Number)
], TotalsDto.prototype, "students", void 0);
class StudentExplorerResponseDto {
    selections;
    sessions;
    lgas;
    schools;
    classes;
    students;
    pagination;
    totals;
    lastUpdated;
}
exports.StudentExplorerResponseDto = StudentExplorerResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current selections' }),
    __metadata("design:type", Object)
], StudentExplorerResponseDto.prototype, "selections", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Available sessions', type: [SessionDto] }),
    __metadata("design:type", Array)
], StudentExplorerResponseDto.prototype, "sessions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Available LGAs', type: [LgaDto] }),
    __metadata("design:type", Array)
], StudentExplorerResponseDto.prototype, "lgas", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Available schools', type: [SchoolDto], required: false }),
    __metadata("design:type", Array)
], StudentExplorerResponseDto.prototype, "schools", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Available classes', type: [ClassDto], required: false }),
    __metadata("design:type", Array)
], StudentExplorerResponseDto.prototype, "classes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Available students', type: [StudentDto], required: false }),
    __metadata("design:type", Array)
], StudentExplorerResponseDto.prototype, "students", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student pagination information', required: false }),
    __metadata("design:type", Object)
], StudentExplorerResponseDto.prototype, "pagination", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Totals for current selections' }),
    __metadata("design:type", TotalsDto)
], StudentExplorerResponseDto.prototype, "totals", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last updated timestamp', example: '2024-09-01T10:00:00.000Z' }),
    __metadata("design:type", String)
], StudentExplorerResponseDto.prototype, "lastUpdated", void 0);
//# sourceMappingURL=student-explorer.dto.js.map