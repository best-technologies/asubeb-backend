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
exports.UploadResultsResponseDto = exports.UploadResultsDataDto = exports.SuccessfulStudentResultDto = exports.FailedStudentResultDto = exports.UploadResultsDto = exports.StudentResultDto = exports.SubjectScoreDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class SubjectScoreDto {
    subjectId;
    score;
}
exports.SubjectScoreDto = SubjectScoreDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Subject ID',
        example: 'subject-uuid-123',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubjectScoreDto.prototype, "subjectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Score for this subject (must be between 0 and 100)',
        example: 85,
        minimum: 0,
        maximum: 100,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], SubjectScoreDto.prototype, "score", void 0);
class StudentResultDto {
    studentId;
    subjects;
}
exports.StudentResultDto = StudentResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Student ID',
        example: 'student-uuid-123',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StudentResultDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of subject scores for this student',
        type: [SubjectScoreDto],
        example: [
            { subjectId: 'subject-uuid-1', score: 85 },
            { subjectId: 'subject-uuid-2', score: 92 },
        ],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SubjectScoreDto),
    __metadata("design:type", Array)
], StudentResultDto.prototype, "subjects", void 0);
class UploadResultsDto {
    sessionId;
    termId;
    lgaId;
    schoolId;
    classId;
    students;
}
exports.UploadResultsDto = UploadResultsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current academic session ID',
        example: 'session-uuid-123',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UploadResultsDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current academic term ID',
        example: 'term-uuid-123',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UploadResultsDto.prototype, "termId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Local Government Area ID',
        example: 'lga-uuid-123',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UploadResultsDto.prototype, "lgaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'School ID',
        example: 'school-uuid-123',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UploadResultsDto.prototype, "schoolId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Class ID',
        example: 'class-uuid-123',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UploadResultsDto.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of students with their subject scores',
        type: [StudentResultDto],
        example: [
            {
                studentId: 'student-uuid-1',
                subjects: [
                    { subjectId: 'subject-uuid-1', score: 85 },
                    { subjectId: 'subject-uuid-2', score: 92 },
                ],
            },
        ],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => StudentResultDto),
    __metadata("design:type", Array)
], UploadResultsDto.prototype, "students", void 0);
class FailedStudentResultDto {
    studentId;
    error;
    studentName;
}
exports.FailedStudentResultDto = FailedStudentResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student ID that failed', example: 'student-uuid-123' }),
    __metadata("design:type", String)
], FailedStudentResultDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error message explaining why the upload failed', example: 'Student not found' }),
    __metadata("design:type", String)
], FailedStudentResultDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student name if available', example: 'John Doe', required: false }),
    __metadata("design:type", String)
], FailedStudentResultDto.prototype, "studentName", void 0);
class SuccessfulStudentResultDto {
    studentId;
    assessmentsCount;
    studentName;
}
exports.SuccessfulStudentResultDto = SuccessfulStudentResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student ID that was successfully uploaded', example: 'student-uuid-123' }),
    __metadata("design:type", String)
], SuccessfulStudentResultDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of assessments created/updated for this student', example: 5 }),
    __metadata("design:type", Number)
], SuccessfulStudentResultDto.prototype, "assessmentsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Student name', example: 'John Doe' }),
    __metadata("design:type", String)
], SuccessfulStudentResultDto.prototype, "studentName", void 0);
class UploadResultsDataDto {
    total;
    successful;
    failed;
    successfulStudents;
    failedStudents;
}
exports.UploadResultsDataDto = UploadResultsDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of students sent in the request', example: 10 }),
    __metadata("design:type", Number)
], UploadResultsDataDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of students successfully uploaded', example: 8 }),
    __metadata("design:type", Number)
], UploadResultsDataDto.prototype, "successful", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of students that failed to upload', example: 2 }),
    __metadata("design:type", Number)
], UploadResultsDataDto.prototype, "failed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of successfully uploaded students',
        type: [SuccessfulStudentResultDto],
    }),
    __metadata("design:type", Array)
], UploadResultsDataDto.prototype, "successfulStudents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of students that failed to upload with error details',
        type: [FailedStudentResultDto],
    }),
    __metadata("design:type", Array)
], UploadResultsDataDto.prototype, "failedStudents", void 0);
class UploadResultsResponseDto {
    success;
    message;
    data;
    statusCode;
}
exports.UploadResultsResponseDto = UploadResultsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Operation success flag', example: true }),
    __metadata("design:type", Boolean)
], UploadResultsResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Response message',
        example: 'Results upload completed. 8 successful, 2 failed out of 10 total students.',
    }),
    __metadata("design:type", String)
], UploadResultsResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Upload results data with success and failure details',
        type: UploadResultsDataDto,
    }),
    __metadata("design:type", UploadResultsDataDto)
], UploadResultsResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'HTTP status code', example: 200 }),
    __metadata("design:type", Number)
], UploadResultsResponseDto.prototype, "statusCode", void 0);
//# sourceMappingURL=upload-results.dto.js.map