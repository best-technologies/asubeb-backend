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
exports.EnrollStudentsResponseDto = exports.EnrollSubebOfficerResponseDto = exports.EnrolledSubebOfficerUserDto = exports.StudentEnrollmentClassesResponseDto = exports.StudentEnrollmentClassesDataDto = exports.StudentEnrollmentSchoolsResponseDto = exports.StudentEnrollmentSchoolsDataDto = exports.StudentEnrollmentMetadataResponseDto = exports.StudentEnrollmentMetadataDataDto = exports.EnrollmentClassDto = exports.EnrollmentSchoolsDto = exports.EnrollmentLgaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class EnrollmentLgaDto {
    id;
    name;
    code;
    state;
    totalSchools;
}
exports.EnrollmentLgaDto = EnrollmentLgaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'LGA ID', example: 'lga-uuid-123' }),
    __metadata("design:type", String)
], EnrollmentLgaDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'LGA name', example: 'Umuahia North' }),
    __metadata("design:type", String)
], EnrollmentLgaDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'LGA code', example: 'UMN' }),
    __metadata("design:type", String)
], EnrollmentLgaDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'LGA state name', example: 'Abia' }),
    __metadata("design:type", String)
], EnrollmentLgaDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of schools in this LGA', example: 12 }),
    __metadata("design:type", Number)
], EnrollmentLgaDto.prototype, "totalSchools", void 0);
class EnrollmentSchoolsDto {
    id;
    name;
    code;
    level;
    isActive;
    totalClasses;
}
exports.EnrollmentSchoolsDto = EnrollmentSchoolsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School ID', example: 'school-uuid-123' }),
    __metadata("design:type", String)
], EnrollmentSchoolsDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School name', example: 'Central Primary School' }),
    __metadata("design:type", String)
], EnrollmentSchoolsDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School code', example: 'CPS' }),
    __metadata("design:type", String)
], EnrollmentSchoolsDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School level', example: 'PRIMARY' }),
    __metadata("design:type", String)
], EnrollmentSchoolsDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the school is active', example: true }),
    __metadata("design:type", Boolean)
], EnrollmentSchoolsDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of classes in this school', example: 8 }),
    __metadata("design:type", Number)
], EnrollmentSchoolsDto.prototype, "totalClasses", void 0);
class EnrollmentClassDto {
    id;
    name;
    grade;
    section;
    isActive;
    totalStudents;
}
exports.EnrollmentClassDto = EnrollmentClassDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class ID', example: 'class-uuid-123' }),
    __metadata("design:type", String)
], EnrollmentClassDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class name', example: 'Primary 5A' }),
    __metadata("design:type", String)
], EnrollmentClassDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class grade', example: '5' }),
    __metadata("design:type", String)
], EnrollmentClassDto.prototype, "grade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Class section', example: 'A' }),
    __metadata("design:type", String)
], EnrollmentClassDto.prototype, "section", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the class is active', example: true }),
    __metadata("design:type", Boolean)
], EnrollmentClassDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of students in this class', example: 30 }),
    __metadata("design:type", Number)
], EnrollmentClassDto.prototype, "totalStudents", void 0);
class StudentEnrollmentMetadataDataDto {
    stateId;
    currentSession;
    currentTerm;
    totalLocalGovernments;
    localGovernments;
}
exports.StudentEnrollmentMetadataDataDto = StudentEnrollmentMetadataDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'State ID', example: 'state-uuid-123' }),
    __metadata("design:type", String)
], StudentEnrollmentMetadataDataDto.prototype, "stateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current academic session information',
        nullable: true,
    }),
    __metadata("design:type", Object)
], StudentEnrollmentMetadataDataDto.prototype, "currentSession", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current academic term information',
        nullable: true,
    }),
    __metadata("design:type", Object)
], StudentEnrollmentMetadataDataDto.prototype, "currentTerm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of LGAs in this state', example: 17 }),
    __metadata("design:type", Number)
], StudentEnrollmentMetadataDataDto.prototype, "totalLocalGovernments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [EnrollmentLgaDto], description: 'List of LGAs in the state' }),
    __metadata("design:type", Array)
], StudentEnrollmentMetadataDataDto.prototype, "localGovernments", void 0);
class StudentEnrollmentMetadataResponseDto {
    success;
    message;
    data;
    statusCode;
}
exports.StudentEnrollmentMetadataResponseDto = StudentEnrollmentMetadataResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Operation success flag', example: true }),
    __metadata("design:type", Boolean)
], StudentEnrollmentMetadataResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Response message',
        example: 'Student enrollment metadata retrieved successfully',
    }),
    __metadata("design:type", String)
], StudentEnrollmentMetadataResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: StudentEnrollmentMetadataDataDto, description: 'Response data payload' }),
    __metadata("design:type", StudentEnrollmentMetadataDataDto)
], StudentEnrollmentMetadataResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'HTTP status code', example: 200 }),
    __metadata("design:type", Number)
], StudentEnrollmentMetadataResponseDto.prototype, "statusCode", void 0);
class StudentEnrollmentSchoolsDataDto {
    stateId;
    lgaId;
    total;
    schools;
}
exports.StudentEnrollmentSchoolsDataDto = StudentEnrollmentSchoolsDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'State ID', example: 'state-uuid-123' }),
    __metadata("design:type", String)
], StudentEnrollmentSchoolsDataDto.prototype, "stateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'LGA ID', example: 'lga-uuid-123' }),
    __metadata("design:type", String)
], StudentEnrollmentSchoolsDataDto.prototype, "lgaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of schools in this LGA', example: 10 }),
    __metadata("design:type", Number)
], StudentEnrollmentSchoolsDataDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [EnrollmentSchoolsDto], description: 'List of schools in the LGA' }),
    __metadata("design:type", Array)
], StudentEnrollmentSchoolsDataDto.prototype, "schools", void 0);
class StudentEnrollmentSchoolsResponseDto {
    success;
    message;
    data;
    statusCode;
}
exports.StudentEnrollmentSchoolsResponseDto = StudentEnrollmentSchoolsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Operation success flag', example: true }),
    __metadata("design:type", Boolean)
], StudentEnrollmentSchoolsResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Response message',
        example: 'Schools for student enrollment retrieved successfully',
    }),
    __metadata("design:type", String)
], StudentEnrollmentSchoolsResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: StudentEnrollmentSchoolsDataDto, description: 'Response data payload' }),
    __metadata("design:type", StudentEnrollmentSchoolsDataDto)
], StudentEnrollmentSchoolsResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'HTTP status code', example: 200 }),
    __metadata("design:type", Number)
], StudentEnrollmentSchoolsResponseDto.prototype, "statusCode", void 0);
class StudentEnrollmentClassesDataDto {
    stateId;
    schoolId;
    total;
    classes;
}
exports.StudentEnrollmentClassesDataDto = StudentEnrollmentClassesDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'State ID', example: 'state-uuid-123' }),
    __metadata("design:type", String)
], StudentEnrollmentClassesDataDto.prototype, "stateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School ID', example: 'school-uuid-123' }),
    __metadata("design:type", String)
], StudentEnrollmentClassesDataDto.prototype, "schoolId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of classes in this school', example: 12 }),
    __metadata("design:type", Number)
], StudentEnrollmentClassesDataDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [EnrollmentClassDto], description: 'List of classes in the school' }),
    __metadata("design:type", Array)
], StudentEnrollmentClassesDataDto.prototype, "classes", void 0);
class StudentEnrollmentClassesResponseDto {
    success;
    message;
    data;
    statusCode;
}
exports.StudentEnrollmentClassesResponseDto = StudentEnrollmentClassesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Operation success flag', example: true }),
    __metadata("design:type", Boolean)
], StudentEnrollmentClassesResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Response message',
        example: 'Classes for student enrollment retrieved successfully',
    }),
    __metadata("design:type", String)
], StudentEnrollmentClassesResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: StudentEnrollmentClassesDataDto, description: 'Response data payload' }),
    __metadata("design:type", StudentEnrollmentClassesDataDto)
], StudentEnrollmentClassesResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'HTTP status code', example: 200 }),
    __metadata("design:type", Number)
], StudentEnrollmentClassesResponseDto.prototype, "statusCode", void 0);
class EnrolledSubebOfficerUserDto {
    id;
    email;
    role;
    firstName;
    lastName;
}
exports.EnrolledSubebOfficerUserDto = EnrolledSubebOfficerUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID', example: 'user-uuid-123' }),
    __metadata("design:type", String)
], EnrolledSubebOfficerUserDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Officer email', example: 'officer@subeb.gov.ng' }),
    __metadata("design:type", String)
], EnrolledSubebOfficerUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User role', example: 'SUBEB_OFFICER' }),
    __metadata("design:type", String)
], EnrolledSubebOfficerUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'First name', example: 'John' }),
    __metadata("design:type", String)
], EnrolledSubebOfficerUserDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last name', example: 'Doe' }),
    __metadata("design:type", String)
], EnrolledSubebOfficerUserDto.prototype, "lastName", void 0);
class EnrollSubebOfficerResponseDto {
    success;
    message;
    data;
    statusCode;
}
exports.EnrollSubebOfficerResponseDto = EnrollSubebOfficerResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Operation success flag', example: true }),
    __metadata("design:type", Boolean)
], EnrollSubebOfficerResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Response message',
        example: 'SUBEB officer registered',
    }),
    __metadata("design:type", String)
], EnrollSubebOfficerResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Created SUBEB officer user payload',
    }),
    __metadata("design:type", EnrolledSubebOfficerUserDto)
], EnrollSubebOfficerResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'HTTP status code', example: 201 }),
    __metadata("design:type", Number)
], EnrollSubebOfficerResponseDto.prototype, "statusCode", void 0);
class EnrollStudentsResponseDto {
    success;
    message;
    data;
    statusCode;
}
exports.EnrollStudentsResponseDto = EnrollStudentsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Operation success flag', example: true }),
    __metadata("design:type", Boolean)
], EnrollStudentsResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Response message',
        example: 'New student(s) enrolled successfully',
    }),
    __metadata("design:type", String)
], EnrollStudentsResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of created student records',
        isArray: true,
    }),
    __metadata("design:type", Array)
], EnrollStudentsResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'HTTP status code', example: 201 }),
    __metadata("design:type", Number)
], EnrollStudentsResponseDto.prototype, "statusCode", void 0);
//# sourceMappingURL=enrollment-metadata.dto.js.map