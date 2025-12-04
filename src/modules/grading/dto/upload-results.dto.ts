import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class SubjectScoreDto {
  @ApiProperty({
    description: 'Subject ID',
    example: 'subject-uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({
    description: 'Score for this subject (must be between 0 and 100)',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;
}

export class StudentResultDto {
  @ApiProperty({
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: 'Array of subject scores for this student',
    type: [SubjectScoreDto],
    example: [
      { subjectId: 'subject-uuid-1', score: 85 },
      { subjectId: 'subject-uuid-2', score: 92 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubjectScoreDto)
  subjects: SubjectScoreDto[];
}

export class UploadResultsDto {
  @ApiProperty({
    description: 'Current academic session ID',
    example: 'session-uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: 'Current academic term ID',
    example: 'term-uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  termId: string;

  @ApiProperty({
    description: 'Local Government Area ID',
    example: 'lga-uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  lgaId: string;

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  schoolId: string;

  @ApiProperty({
    description: 'Class ID',
    example: 'class-uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({
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
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentResultDto)
  students: StudentResultDto[];
}

export class FailedStudentResultDto {
  @ApiProperty({ description: 'Student ID that failed', example: 'student-uuid-123' })
  studentId: string;

  @ApiProperty({ description: 'Error message explaining why the upload failed', example: 'Student not found' })
  error: string;

  @ApiProperty({ description: 'Student name if available', example: 'John Doe', required: false })
  studentName?: string;
}

export class SuccessfulStudentResultDto {
  @ApiProperty({ description: 'Student ID that was successfully uploaded', example: 'student-uuid-123' })
  studentId: string;

  @ApiProperty({ description: 'Number of assessments created/updated for this student', example: 5 })
  assessmentsCount: number;

  @ApiProperty({ description: 'Student name', example: 'John Doe' })
  studentName: string;
}

export class UploadResultsDataDto {
  @ApiProperty({ description: 'Total number of students sent in the request', example: 10 })
  total: number;

  @ApiProperty({ description: 'Number of students successfully uploaded', example: 8 })
  successful: number;

  @ApiProperty({ description: 'Number of students that failed to upload', example: 2 })
  failed: number;

  @ApiProperty({
    description: 'List of successfully uploaded students',
    type: [SuccessfulStudentResultDto],
  })
  successfulStudents: SuccessfulStudentResultDto[];

  @ApiProperty({
    description: 'List of students that failed to upload with error details',
    type: [FailedStudentResultDto],
  })
  failedStudents: FailedStudentResultDto[];
}

export class UploadResultsResponseDto {
  @ApiProperty({ description: 'Operation success flag', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Results upload completed. 8 successful, 2 failed out of 10 total students.',
  })
  message: string;

  @ApiProperty({
    description: 'Upload results data with success and failure details',
    type: UploadResultsDataDto,
  })
  data: UploadResultsDataDto;

  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;
}

