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
exports.GradeEntryStudentsResponseDto = exports.GradeEntryStudentsDataDto = exports.GradeEntryStudentDto = exports.GradeEntryClassesResponseDto = exports.GradeEntryClassesDataDto = exports.GradeEntryClassDto = exports.GradeEntrySchoolsResponseDto = exports.GradeEntrySchoolsDataDto = exports.GradeEntrySchoolDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class GradeEntrySchoolDto {
    id;
    name;
    code;
    level;
    isActive;
    totalClasses;
}
exports.GradeEntrySchoolDto = GradeEntrySchoolDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School ID', example: 'school-uuid-123' }),
    __metadata("design:type", String)
], GradeEntrySchoolDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School name', example: 'Central Primary School' }),
    __metadata("design:type", String)
], GradeEntrySchoolDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School code', example: 'CPS' }),
    __metadata("design:type", String)
], GradeEntrySchoolDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School level', example: 'PRIMARY' }),
    __metadata("design:type", String)
], GradeEntrySchoolDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the school is active', example: true }),
    __metadata("design:type", Boolean)
], GradeEntrySchoolDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of classes in this school', example: 8 }),
    __metadata("design:type", Number)
], GradeEntrySchoolDto.prototype, "totalClasses", void 0);
class GradeEntrySchoolsDataDto {
    stateId;
    lgaId;
    total;
    schools;
}
exports.GradeEntrySchoolsDataDto = GradeEntrySchoolsDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'State ID', example: 'state-uuid-123' }),
    __metadata("design:type", String)
], GradeEntrySchoolsDataDto.prototype, "stateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'LGA ID', example: 'lga-uuid-123' }),
    __metadata("design:type", String)
], GradeEntrySchoolsDataDto.prototype, "lgaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of schools in this LGA', example: 5 }),
    __metadata("design:type", Number)
], GradeEntrySchoolsDataDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [GradeEntrySchoolDto], description: 'List of schools in the LGA' }),
    __metadata("design:type", Array)
], GradeEntrySchoolsDataDto.prototype, "schools", void 0);
class GradeEntrySchoolsResponseDto {
    success;
    message;
    data;
    statusCode;
}
exports.GradeEntrySchoolsResponseDto = GradeEntrySchoolsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Operation success flag', example: true }),
    __metadata("design:type", Boolean)
], GradeEntrySchoolsResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response message', example: 'Schools in LGA retrieved successfully' }),
    __metadata("design:type", String)
], GradeEntrySchoolsResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: GradeEntrySchoolsDataDto, description: 'Response data payload' }),
    __metadata("design:type", GradeEntrySchoolsDataDto)
], GradeEntrySchoolsResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'HTTP status code', example: 200 }),
    __metadata("design:type", Number)
], GradeEntrySchoolsResponseDto.prototype, "statusCode", void 0);
class GradeEntryClassDto {
    id;
    name;
    grade;
    section;
    isActive;
    totalStudents;
}
exports.GradeEntryClassDto = GradeEntryClassDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class ID', example: 'class-uuid-123' }),
    __metadata("design:type", String)
], GradeEntryClassDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class name', example: 'Primary 5A' }),
    __metadata("design:type", String)
], GradeEntryClassDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class grade', example: '5' }),
    __metadata("design:type", String)
], GradeEntryClassDto.prototype, "grade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class section', example: 'A' }),
    __metadata("design:type", String)
], GradeEntryClassDto.prototype, "section", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the class is active', example: true }),
    __metadata("design:type", Boolean)
], GradeEntryClassDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of students in this class', example: 30 }),
    __metadata("design:type", Number)
], GradeEntryClassDto.prototype, "totalStudents", void 0);
class GradeEntryClassesDataDto {
    stateId;
    schoolId;
    total;
    classes;
}
exports.GradeEntryClassesDataDto = GradeEntryClassesDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'State ID', example: 'state-uuid-123' }),
    __metadata("design:type", String)
], GradeEntryClassesDataDto.prototype, "stateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School ID', example: 'school-uuid-123' }),
    __metadata("design:type", String)
], GradeEntryClassesDataDto.prototype, "schoolId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of classes in this school', example: 10 }),
    __metadata("design:type", Number)
], GradeEntryClassesDataDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [GradeEntryClassDto], description: 'List of classes in the school' }),
    __metadata("design:type", Array)
], GradeEntryClassesDataDto.prototype, "classes", void 0);
class GradeEntryClassesResponseDto {
    success;
    message;
    data;
    statusCode;
}
exports.GradeEntryClassesResponseDto = GradeEntryClassesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Operation success flag', example: true }),
    __metadata("design:type", Boolean)
], GradeEntryClassesResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response message', example: 'Classes in school retrieved successfully' }),
    __metadata("design:type", String)
], GradeEntryClassesResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: GradeEntryClassesDataDto, description: 'Response data payload' }),
    __metadata("design:type", GradeEntryClassesDataDto)
], GradeEntryClassesResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'HTTP status code', example: 200 }),
    __metadata("design:type", Number)
], GradeEntryClassesResponseDto.prototype, "statusCode", void 0);
class GradeEntryStudentDto {
    id;
    firstName;
    lastName;
    fullName;
    studentId;
    gender;
    email;
    isActive;
    hasResultForActiveTerm;
}
exports.GradeEntryStudentDto = GradeEntryStudentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student ID', example: 'student-uuid-123' }),
    __metadata("design:type", String)
], GradeEntryStudentDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student first name', example: 'John' }),
    __metadata("design:type", String)
], GradeEntryStudentDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student last name', example: 'Doe' }),
    __metadata("design:type", String)
], GradeEntryStudentDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Formatted full name for display', example: 'Trust Uzoma' }),
    __metadata("design:type", String)
], GradeEntryStudentDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student unique ID code', example: 'STU123456' }),
    __metadata("design:type", String)
], GradeEntryStudentDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student gender', example: 'MALE' }),
    __metadata("design:type", String)
], GradeEntryStudentDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student email', example: 'john.doe@example.com', required: false }),
    __metadata("design:type", Object)
], GradeEntryStudentDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the student is active', example: true }),
    __metadata("design:type", Boolean)
], GradeEntryStudentDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether a result has already been uploaded for this student in the active term',
        example: true,
    }),
    __metadata("design:type", Boolean)
], GradeEntryStudentDto.prototype, "hasResultForActiveTerm", void 0);
class GradeEntryStudentsDataDto {
    currentSession;
    currentTerm;
    stateId;
    schoolId;
    classId;
    total;
    students;
}
exports.GradeEntryStudentsDataDto = GradeEntryStudentsDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current academic session information', required: false }),
    __metadata("design:type", Object)
], GradeEntryStudentsDataDto.prototype, "currentSession", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current academic term information', required: false }),
    __metadata("design:type", Object)
], GradeEntryStudentsDataDto.prototype, "currentTerm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'State ID', example: 'state-uuid-123' }),
    __metadata("design:type", String)
], GradeEntryStudentsDataDto.prototype, "stateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School ID', example: 'school-uuid-123' }),
    __metadata("design:type", String)
], GradeEntryStudentsDataDto.prototype, "schoolId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class ID', example: 'class-uuid-123' }),
    __metadata("design:type", String)
], GradeEntryStudentsDataDto.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of students in this class', example: 30 }),
    __metadata("design:type", Number)
], GradeEntryStudentsDataDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [GradeEntryStudentDto], description: 'List of students in the class' }),
    __metadata("design:type", Array)
], GradeEntryStudentsDataDto.prototype, "students", void 0);
class GradeEntryStudentsResponseDto {
    success;
    message;
    data;
    statusCode;
}
exports.GradeEntryStudentsResponseDto = GradeEntryStudentsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Operation success flag', example: true }),
    __metadata("design:type", Boolean)
], GradeEntryStudentsResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response message', example: 'Students in class retrieved successfully' }),
    __metadata("design:type", String)
], GradeEntryStudentsResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: GradeEntryStudentsDataDto, description: 'Response data payload' }),
    __metadata("design:type", GradeEntryStudentsDataDto)
], GradeEntryStudentsResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'HTTP status code', example: 200 }),
    __metadata("design:type", Number)
], GradeEntryStudentsResponseDto.prototype, "statusCode", void 0);
//# sourceMappingURL=grading-metadata.dto.js.map