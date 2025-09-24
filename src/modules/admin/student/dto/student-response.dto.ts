import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class SchoolInfoDto {
  @ApiProperty({ description: 'School ID', example: 'school-uuid-123' })
  id: string;

  @ApiProperty({ description: 'School name', example: 'Central Primary School' })
  name: string;

  @ApiProperty({ description: 'School code', example: 'CPS' })
  code: string;

  @ApiProperty({ description: 'School level', example: 'PRIMARY' })
  level: string;
}

export class ClassInfoDto {
  @ApiProperty({ description: 'Class ID', example: 'class-uuid-456' })
  id: string;

  @ApiProperty({ description: 'Class name', example: 'Primary 5' })
  name: string;

  @ApiProperty({ description: 'Class grade', example: 5 })
  grade: number;

  @ApiProperty({ description: 'Class section', example: 'A' })
  section: string;
}

export class ParentInfoDto {
  @ApiProperty({ description: 'Parent ID', example: 'parent-uuid-789' })
  id: string;

  @ApiProperty({ description: 'Parent first name', example: 'Jane' })
  firstName: string;

  @ApiProperty({ description: 'Parent last name', example: 'Doe' })
  lastName: string;

  @ApiProperty({ description: 'Parent email', example: 'jane.doe@example.com' })
  email: string;

  @ApiProperty({ description: 'Parent phone', example: '+2348012345678' })
  phone: string;
}

export class AssessmentDto {
  @ApiProperty({ description: 'Assessment ID', example: 'assessment-uuid-123' })
  id: string;

  @ApiProperty({ description: 'Assessment score', example: 85 })
  score: number;

  @ApiProperty({ description: 'Maximum possible score', example: 100 })
  maxScore: number;

  @ApiProperty({ description: 'Assessment percentage', example: 85.0 })
  percentage: number;

  @ApiProperty({ description: 'Assessment type', example: 'EXAM' })
  type: string;

  @ApiProperty({ description: 'Assessment title', example: 'Mathematics Test' })
  title: string;

  @ApiProperty({ description: 'Subject information' })
  subject: {
    id: string;
    name: string;
    code: string;
  };

  @ApiProperty({ description: 'Term information' })
  term: {
    id: string;
    name: string;
    session: {
      id: string;
      name: string;
    };
  };
}

export class StudentResponseDto {
  @ApiProperty({ description: 'Student ID', example: 'student-uuid-123' })
  id: string;

  @ApiProperty({ description: 'Student first name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'Student last name', example: 'Doe' })
  lastName: string;

  @ApiProperty({ description: 'Unique student ID', example: 'STU123456' })
  studentId: string;

  @ApiProperty({ description: 'Student email', example: 'john.doe@example.com', required: false })
  email?: string;

  @ApiProperty({ description: 'Student phone', example: '+2348012345678', required: false })
  phone?: string;

  @ApiProperty({ description: 'Student date of birth', example: '2010-05-15', required: false })
  dateOfBirth?: string;

  @ApiProperty({ description: 'Student gender', enum: Gender, example: Gender.MALE })
  gender: Gender;

  @ApiProperty({ description: 'Student address', example: '123 Main Street, Lagos', required: false })
  address?: string;

  @ApiProperty({ description: 'Student enrollment date', example: '2024-09-01', required: false })
  enrollmentDate?: string;

  @ApiProperty({ description: 'Student school information' })
  school: SchoolInfoDto;

  @ApiProperty({ description: 'Student class information' })
  class: ClassInfoDto;

  @ApiProperty({ description: 'Student parent information', required: false })
  parent?: ParentInfoDto;

  @ApiProperty({ description: 'Student assessments', type: [AssessmentDto], required: false })
  assessments?: AssessmentDto[];

  @ApiProperty({ description: 'Student creation date', example: '2024-09-01T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Student last update date', example: '2024-09-01T10:00:00.000Z' })
  updatedAt: Date;
}

export class StudentPerformanceDto {
  @ApiProperty({ description: 'Student ID', example: 'student-uuid-123' })
  id: string;

  @ApiProperty({ description: 'Student full name', example: 'John Doe' })
  studentName: string;

  @ApiProperty({ description: 'Student ID number', example: 'STU123456' })
  studentId: string;

  @ApiProperty({ description: 'Student email', example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ description: 'Student phone', example: '+2348012345678' })
  phone: string;

  @ApiProperty({ description: 'Student date of birth', example: '2010-05-15' })
  dateOfBirth: string;

  @ApiProperty({ description: 'Student gender', enum: Gender, example: Gender.MALE })
  gender: Gender;

  @ApiProperty({ description: 'Student address', example: '123 Main Street, Lagos' })
  address: string;

  @ApiProperty({ description: 'Student enrollment date', example: '2024-09-01' })
  enrollmentDate: string;

  @ApiProperty({ description: 'Student school information' })
  school: SchoolInfoDto;

  @ApiProperty({ description: 'Student class information' })
  class: ClassInfoDto;

  @ApiProperty({ description: 'Student parent information', required: false })
  parent?: ParentInfoDto;

  @ApiProperty({ description: 'Student performance metrics' })
  performance: {
    totalScore: number;
    average: number;
    percentage: number;
    assessmentCount: number;
    assessments: AssessmentDto[];
  };
}

export class PaginationDto {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of items', example: 100 })
  total: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages: number;
}

export class StudentListResponseDto {
  @ApiProperty({ description: 'List of students', type: [StudentPerformanceDto] })
  data: StudentPerformanceDto[];

  @ApiProperty({ description: 'Pagination information' })
  pagination: PaginationDto;

  @ApiProperty({ description: 'Last updated timestamp', example: '2024-09-01T10:00:00.000Z' })
  lastUpdated: string;
}
