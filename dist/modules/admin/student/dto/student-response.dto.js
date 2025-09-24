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
exports.StudentListResponseDto = exports.PaginationDto = exports.StudentPerformanceDto = exports.StudentResponseDto = exports.AssessmentDto = exports.ParentInfoDto = exports.ClassInfoDto = exports.SchoolInfoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class SchoolInfoDto {
    id;
    name;
    code;
    level;
}
exports.SchoolInfoDto = SchoolInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School ID', example: 'school-uuid-123' }),
    __metadata("design:type", String)
], SchoolInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School name', example: 'Central Primary School' }),
    __metadata("design:type", String)
], SchoolInfoDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School code', example: 'CPS' }),
    __metadata("design:type", String)
], SchoolInfoDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School level', example: 'PRIMARY' }),
    __metadata("design:type", String)
], SchoolInfoDto.prototype, "level", void 0);
class ClassInfoDto {
    id;
    name;
    grade;
    section;
}
exports.ClassInfoDto = ClassInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class ID', example: 'class-uuid-456' }),
    __metadata("design:type", String)
], ClassInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class name', example: 'Primary 5' }),
    __metadata("design:type", String)
], ClassInfoDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class grade', example: 5 }),
    __metadata("design:type", Number)
], ClassInfoDto.prototype, "grade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class section', example: 'A' }),
    __metadata("design:type", String)
], ClassInfoDto.prototype, "section", void 0);
class ParentInfoDto {
    id;
    firstName;
    lastName;
    email;
    phone;
}
exports.ParentInfoDto = ParentInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Parent ID', example: 'parent-uuid-789' }),
    __metadata("design:type", String)
], ParentInfoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Parent first name', example: 'Jane' }),
    __metadata("design:type", String)
], ParentInfoDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Parent last name', example: 'Doe' }),
    __metadata("design:type", String)
], ParentInfoDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Parent email', example: 'jane.doe@example.com' }),
    __metadata("design:type", String)
], ParentInfoDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Parent phone', example: '+2348012345678' }),
    __metadata("design:type", String)
], ParentInfoDto.prototype, "phone", void 0);
class AssessmentDto {
    id;
    score;
    maxScore;
    percentage;
    type;
    title;
    subject;
    term;
}
exports.AssessmentDto = AssessmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Assessment ID', example: 'assessment-uuid-123' }),
    __metadata("design:type", String)
], AssessmentDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Assessment score', example: 85 }),
    __metadata("design:type", Number)
], AssessmentDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maximum possible score', example: 100 }),
    __metadata("design:type", Number)
], AssessmentDto.prototype, "maxScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Assessment percentage', example: 85.0 }),
    __metadata("design:type", Number)
], AssessmentDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Assessment type', example: 'EXAM' }),
    __metadata("design:type", String)
], AssessmentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Assessment title', example: 'Mathematics Test' }),
    __metadata("design:type", String)
], AssessmentDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Subject information' }),
    __metadata("design:type", Object)
], AssessmentDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Term information' }),
    __metadata("design:type", Object)
], AssessmentDto.prototype, "term", void 0);
class StudentResponseDto {
    id;
    firstName;
    lastName;
    studentId;
    email;
    phone;
    dateOfBirth;
    gender;
    address;
    enrollmentDate;
    school;
    class;
    parent;
    assessments;
    createdAt;
    updatedAt;
}
exports.StudentResponseDto = StudentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student ID', example: 'student-uuid-123' }),
    __metadata("design:type", String)
], StudentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student first name', example: 'John' }),
    __metadata("design:type", String)
], StudentResponseDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student last name', example: 'Doe' }),
    __metadata("design:type", String)
], StudentResponseDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique student ID', example: 'STU123456' }),
    __metadata("design:type", String)
], StudentResponseDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student email', example: 'john.doe@example.com', required: false }),
    __metadata("design:type", String)
], StudentResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student phone', example: '+2348012345678', required: false }),
    __metadata("design:type", String)
], StudentResponseDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student date of birth', example: '2010-05-15', required: false }),
    __metadata("design:type", String)
], StudentResponseDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student gender', enum: client_1.Gender, example: client_1.Gender.MALE }),
    __metadata("design:type", String)
], StudentResponseDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student address', example: '123 Main Street, Lagos', required: false }),
    __metadata("design:type", String)
], StudentResponseDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student enrollment date', example: '2024-09-01', required: false }),
    __metadata("design:type", String)
], StudentResponseDto.prototype, "enrollmentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student school information' }),
    __metadata("design:type", SchoolInfoDto)
], StudentResponseDto.prototype, "school", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student class information' }),
    __metadata("design:type", ClassInfoDto)
], StudentResponseDto.prototype, "class", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student parent information', required: false }),
    __metadata("design:type", ParentInfoDto)
], StudentResponseDto.prototype, "parent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student assessments', type: [AssessmentDto], required: false }),
    __metadata("design:type", Array)
], StudentResponseDto.prototype, "assessments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student creation date', example: '2024-09-01T10:00:00.000Z' }),
    __metadata("design:type", Date)
], StudentResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student last update date', example: '2024-09-01T10:00:00.000Z' }),
    __metadata("design:type", Date)
], StudentResponseDto.prototype, "updatedAt", void 0);
class StudentPerformanceDto {
    id;
    studentName;
    studentId;
    email;
    phone;
    dateOfBirth;
    gender;
    address;
    enrollmentDate;
    school;
    class;
    parent;
    performance;
}
exports.StudentPerformanceDto = StudentPerformanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student ID', example: 'student-uuid-123' }),
    __metadata("design:type", String)
], StudentPerformanceDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student full name', example: 'John Doe' }),
    __metadata("design:type", String)
], StudentPerformanceDto.prototype, "studentName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student ID number', example: 'STU123456' }),
    __metadata("design:type", String)
], StudentPerformanceDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student email', example: 'john.doe@example.com' }),
    __metadata("design:type", String)
], StudentPerformanceDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student phone', example: '+2348012345678' }),
    __metadata("design:type", String)
], StudentPerformanceDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student date of birth', example: '2010-05-15' }),
    __metadata("design:type", String)
], StudentPerformanceDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student gender', enum: client_1.Gender, example: client_1.Gender.MALE }),
    __metadata("design:type", String)
], StudentPerformanceDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student address', example: '123 Main Street, Lagos' }),
    __metadata("design:type", String)
], StudentPerformanceDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student enrollment date', example: '2024-09-01' }),
    __metadata("design:type", String)
], StudentPerformanceDto.prototype, "enrollmentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student school information' }),
    __metadata("design:type", SchoolInfoDto)
], StudentPerformanceDto.prototype, "school", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student class information' }),
    __metadata("design:type", ClassInfoDto)
], StudentPerformanceDto.prototype, "class", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student parent information', required: false }),
    __metadata("design:type", ParentInfoDto)
], StudentPerformanceDto.prototype, "parent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student performance metrics' }),
    __metadata("design:type", Object)
], StudentPerformanceDto.prototype, "performance", void 0);
class PaginationDto {
    page;
    limit;
    total;
    totalPages;
}
exports.PaginationDto = PaginationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current page number', example: 1 }),
    __metadata("design:type", Number)
], PaginationDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of items per page', example: 10 }),
    __metadata("design:type", Number)
], PaginationDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of items', example: 100 }),
    __metadata("design:type", Number)
], PaginationDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of pages', example: 10 }),
    __metadata("design:type", Number)
], PaginationDto.prototype, "totalPages", void 0);
class StudentListResponseDto {
    data;
    pagination;
    lastUpdated;
}
exports.StudentListResponseDto = StudentListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'List of students', type: [StudentPerformanceDto] }),
    __metadata("design:type", Array)
], StudentListResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pagination information' }),
    __metadata("design:type", PaginationDto)
], StudentListResponseDto.prototype, "pagination", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last updated timestamp', example: '2024-09-01T10:00:00.000Z' }),
    __metadata("design:type", String)
], StudentListResponseDto.prototype, "lastUpdated", void 0);
//# sourceMappingURL=student-response.dto.js.map