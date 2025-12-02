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
exports.EnrollSingleOrBulkStudentsDto = exports.EnrollStudentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class EnrollStudentDto {
    firstName;
    lastName;
    email;
    phone;
    dateOfBirth;
    gender;
    address;
    schoolId;
    classId;
}
exports.EnrollStudentDto = EnrollStudentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student first name', example: 'John' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnrollStudentDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student last name', example: 'Doe' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnrollStudentDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Student email address',
        example: 'john.doe@example.com',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], EnrollStudentDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Student phone number',
        example: '+2348012345678',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnrollStudentDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Student date of birth',
        example: '2010-05-15',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], EnrollStudentDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student gender', enum: client_1.Gender, example: client_1.Gender.MALE }),
    (0, class_validator_1.IsEnum)(client_1.Gender),
    __metadata("design:type", String)
], EnrollStudentDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Student address',
        example: '123 Main Street, Lagos',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnrollStudentDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'School ID where student is to be enrolled',
        example: 'school-uuid-123',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], EnrollStudentDto.prototype, "schoolId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Class ID where student is to be enrolled',
        example: 'class-uuid-456',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], EnrollStudentDto.prototype, "classId", void 0);
class EnrollSingleOrBulkStudentsDto {
    students;
}
exports.EnrollSingleOrBulkStudentsDto = EnrollSingleOrBulkStudentsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of students to enroll. Can be single or multiple.',
        type: [EnrollStudentDto],
    }),
    __metadata("design:type", Array)
], EnrollSingleOrBulkStudentsDto.prototype, "students", void 0);
//# sourceMappingURL=enroll-student.dto.js.map