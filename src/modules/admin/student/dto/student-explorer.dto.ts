import { ApiProperty } from '@nestjs/swagger';

export class SelectionDto {
  @ApiProperty({ description: 'Selection ID', example: 'session-uuid-123' })
  id: string;

  @ApiProperty({ description: 'Selection name', example: '2024/2025' })
  name: string;
}

export class TermDto {
  @ApiProperty({ description: 'Term ID', example: 'term-uuid-123' })
  id: string;

  @ApiProperty({ description: 'Term name', example: 'FIRST_TERM' })
  name: string;

  @ApiProperty({ description: 'Whether this is the current term', example: true })
  isCurrent: boolean;
}

export class SessionDto {
  @ApiProperty({ description: 'Session ID', example: 'session-uuid-123' })
  id: string;

  @ApiProperty({ description: 'Session name', example: '2024/2025' })
  name: string;

  @ApiProperty({ description: 'Whether this is the current session', example: true })
  isCurrent: boolean;

  @ApiProperty({ description: 'Session terms', type: [TermDto] })
  terms: TermDto[];
}

export class LgaDto {
  @ApiProperty({ description: 'LGA ID', example: 'lga-uuid-123' })
  id: string;

  @ApiProperty({ description: 'LGA name', example: 'Umuahia North' })
  name: string;

  @ApiProperty({ description: 'LGA code', example: 'UMN' })
  code: string;

  @ApiProperty({ description: 'LGA state', example: 'Abia' })
  state: string;
}

export class SchoolDto {
  @ApiProperty({ description: 'School ID', example: 'school-uuid-123' })
  id: string;

  @ApiProperty({ description: 'School name', example: 'Central Primary School' })
  name: string;

  @ApiProperty({ description: 'School code', example: 'CPS' })
  code: string;

  @ApiProperty({ description: 'School level', example: 'PRIMARY' })
  level: string;
}

export class ClassDto {
  @ApiProperty({ description: 'Class ID', example: 'class-uuid-123' })
  id: string;

  @ApiProperty({ description: 'Class name', example: 'Primary 5' })
  name: string;

  @ApiProperty({ description: 'Class grade', example: 5 })
  grade: number;

  @ApiProperty({ description: 'Class section', example: 'A' })
  section: string;
}

export class StudentDto {
  @ApiProperty({ description: 'Student ID', example: 'student-uuid-123' })
  id: string;

  @ApiProperty({ description: 'Student first name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'Student last name', example: 'Doe' })
  lastName: string;

  @ApiProperty({ description: 'Student ID number', example: 'STU123456' })
  studentId: string;

  @ApiProperty({ description: 'Student gender', example: 'MALE' })
  gender: string;

  @ApiProperty({ description: 'Student email', example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ description: 'Student school information' })
  school: {
    id: string;
    name: string;
  };

  @ApiProperty({ description: 'Student class information' })
  class: {
    id: string;
    name: string;
  };

  @ApiProperty({ description: 'Student assessments', required: false })
  assessments?: any[];
}

export class TotalsDto {
  @ApiProperty({ description: 'Total number of schools', example: 1000 })
  schools: number;

  @ApiProperty({ description: 'Total number of classes', example: 9 })
  classes?: number;

  @ApiProperty({ description: 'Total number of students', example: 57 })
  students?: number;
}

export class StudentExplorerResponseDto {
  @ApiProperty({ description: 'Current selections' })
  selections: {
    session?: SelectionDto;
    term?: SelectionDto;
    lga?: SelectionDto;
    school?: SelectionDto;
    class?: SelectionDto;
    student?: SelectionDto;
  };

  @ApiProperty({ description: 'Available sessions', type: [SessionDto] })
  sessions: SessionDto[];

  @ApiProperty({ description: 'Available LGAs', type: [LgaDto] })
  lgas: LgaDto[];

  @ApiProperty({ description: 'Available schools', type: [SchoolDto], required: false })
  schools?: SchoolDto[];

  @ApiProperty({ description: 'Available classes', type: [ClassDto], required: false })
  classes?: ClassDto[];

  @ApiProperty({ description: 'Available students', type: [StudentDto], required: false })
  students?: StudentDto[];

  @ApiProperty({ description: 'Student pagination information', required: false })
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  @ApiProperty({ description: 'Totals for current selections' })
  totals: TotalsDto;

  @ApiProperty({ description: 'Last updated timestamp', example: '2024-09-01T10:00:00.000Z' })
  lastUpdated: string;
}
