import { ApiProperty } from '@nestjs/swagger';

export class GradeEntrySchoolDto {
  @ApiProperty({ description: 'School ID', example: 'school-uuid-123' })
  id: string;

  @ApiProperty({ description: 'School name', example: 'Central Primary School' })
  name: string;

  @ApiProperty({ description: 'School code', example: 'CPS' })
  code: string;

  @ApiProperty({ description: 'School level', example: 'PRIMARY' })
  level: string;

  @ApiProperty({ description: 'Whether the school is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Total number of classes in this school', example: 8 })
  totalClasses: number;
}

export class GradeEntrySchoolsDataDto {
  @ApiProperty({ description: 'State ID', example: 'state-uuid-123' })
  stateId: string;

  @ApiProperty({ description: 'LGA ID', example: 'lga-uuid-123' })
  lgaId: string;

  @ApiProperty({ description: 'Total number of schools in this LGA', example: 5 })
  total: number;

  @ApiProperty({ type: [GradeEntrySchoolDto], description: 'List of schools in the LGA' })
  schools: GradeEntrySchoolDto[];
}

export class GradeEntrySchoolsResponseDto {
  @ApiProperty({ description: 'Operation success flag', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'Schools in LGA retrieved successfully' })
  message: string;

  @ApiProperty({ type: GradeEntrySchoolsDataDto, description: 'Response data payload' })
  data: GradeEntrySchoolsDataDto;

  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;
}

export class GradeEntryClassDto {
  @ApiProperty({ description: 'Class ID', example: 'class-uuid-123' })
  id: string;

  @ApiProperty({ description: 'Class name', example: 'Primary 5A' })
  name: string;

  @ApiProperty({ description: 'Class grade', example: '5' })
  grade: string;

  @ApiProperty({ description: 'Class section', example: 'A' })
  section: string;

  @ApiProperty({ description: 'Whether the class is active', example: true })
  isActive: boolean;

   @ApiProperty({ description: 'Total number of students in this class', example: 30 })
   totalStudents: number;
}

export class GradeEntryClassesDataDto {
  @ApiProperty({ description: 'State ID', example: 'state-uuid-123' })
  stateId: string;

  @ApiProperty({ description: 'School ID', example: 'school-uuid-123' })
  schoolId: string;

  @ApiProperty({ description: 'Total number of classes in this school', example: 10 })
  total: number;

  @ApiProperty({ type: [GradeEntryClassDto], description: 'List of classes in the school' })
  classes: GradeEntryClassDto[];
}

export class GradeEntryClassesResponseDto {
  @ApiProperty({ description: 'Operation success flag', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'Classes in school retrieved successfully' })
  message: string;

  @ApiProperty({ type: GradeEntryClassesDataDto, description: 'Response data payload' })
  data: GradeEntryClassesDataDto;

  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;
}

export class GradeEntryStudentDto {
  @ApiProperty({ description: 'Student ID', example: 'student-uuid-123' })
  id: string;

  @ApiProperty({ description: 'Student first name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'Student last name', example: 'Doe' })
  lastName: string;

  @ApiProperty({ description: 'Formatted full name for display', example: 'Trust Uzoma' })
  fullName: string;

  @ApiProperty({ description: 'Student unique ID code', example: 'STU123456' })
  studentId: string;

  @ApiProperty({ description: 'Student gender', example: 'MALE' })
  gender: string;

  @ApiProperty({ description: 'Student email', example: 'john.doe@example.com', required: false })
  email?: string | null;

  @ApiProperty({ description: 'Whether the student is active', example: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether a result has already been uploaded for this student in the active term',
    example: true,
  })
  hasResultForActiveTerm: boolean;
}

export class GradeEntryStudentsDataDto {
  @ApiProperty({ description: 'Current academic session information', required: false })
  currentSession?: {
    id: string;
    name: string;
    isCurrent: boolean;
  } | null;

  @ApiProperty({ description: 'Current academic term information', required: false })
  currentTerm?: {
    id: string;
    name: string;
    isCurrent: boolean;
  } | null;

  @ApiProperty({ description: 'State ID', example: 'state-uuid-123' })
  stateId: string;

  @ApiProperty({ description: 'School ID', example: 'school-uuid-123' })
  schoolId: string;

  @ApiProperty({ description: 'Class ID', example: 'class-uuid-123' })
  classId: string;

  @ApiProperty({ description: 'Total number of students in this class', example: 30 })
  total: number;

  @ApiProperty({ type: [GradeEntryStudentDto], description: 'List of students in the class' })
  students: GradeEntryStudentDto[];
}

export class GradeEntryStudentsResponseDto {
  @ApiProperty({ description: 'Operation success flag', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'Students in class retrieved successfully' })
  message: string;

  @ApiProperty({ type: GradeEntryStudentsDataDto, description: 'Response data payload' })
  data: GradeEntryStudentsDataDto;

  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;
}

export class GradeEntryMetadataLocalGovernmentDto {
  @ApiProperty({ description: 'Local Government Area ID', example: 'lga-uuid-123' })
  id: string;

  @ApiProperty({ description: 'Local Government Area name', example: 'Umuahia North' })
  name: string;

  @ApiProperty({
    description: 'Total number of schools in this Local Government Area',
    example: 25,
  })
  totalSchools: number;
}

export class GradeEntryMetadataSubjectDto {
  @ApiProperty({ description: 'Subject ID', example: 'subject-uuid-123' })
  id: string;

  @ApiProperty({ description: 'Subject full name', example: 'English Language' })
  name: string;

  @ApiProperty({ description: 'Subject code (short form)', example: 'ENG' })
  code: string;

  @ApiProperty({
    description: 'School level for this subject',
    example: 'PRIMARY',
    enum: ['PRIMARY', 'SECONDARY'],
  })
  level: 'PRIMARY' | 'SECONDARY';

  @ApiProperty({
    description: 'Subject description',
    example: 'English Language for Primary School',
    required: false,
    nullable: true,
  })
  description?: string | null;
}

export class GradeEntryMetadataSubjectsByLevelDto {
  @ApiProperty({
    description: 'Total number of subjects at this level',
    example: 13,
  })
  count: number;

  @ApiProperty({
    description: 'List of subjects at this level',
    type: [GradeEntryMetadataSubjectDto],
  })
  subjects: GradeEntryMetadataSubjectDto[];
}

export class GradeEntryMetadataSubjectsGroupedDto {
  @ApiProperty({
    description: 'Primary school subjects with count and list',
    type: GradeEntryMetadataSubjectsByLevelDto,
  })
  primary: GradeEntryMetadataSubjectsByLevelDto;

  @ApiProperty({
    description: 'Secondary school subjects with count and list',
    type: GradeEntryMetadataSubjectsByLevelDto,
  })
  secondary: GradeEntryMetadataSubjectsByLevelDto;
}

export class GradeEntryMetadataDataDto {
  @ApiProperty({ description: 'State ID', example: 'state-uuid-123' })
  stateId: string;

  @ApiProperty({
    description: 'Current academic session information',
    required: false,
    nullable: true,
    example: {
      id: 'session-uuid-123',
      name: '2024/2025',
      isCurrent: true,
    },
  })
  currentSession?: {
    id: string;
    name: string;
    isCurrent: boolean;
  } | null;

  @ApiProperty({
    description: 'Current academic term information',
    required: false,
    nullable: true,
    example: {
      id: 'term-uuid-123',
      name: 'SECOND_TERM',
      isCurrent: true,
    },
  })
  currentTerm?: {
    id: string;
    name: string;
    isCurrent: boolean;
  } | null;

  @ApiProperty({
    description: 'Total number of Local Government Areas in the state',
    example: 17,
  })
  totalLocalGovernments: number;

  @ApiProperty({
    description:
      'List of Local Government Areas in the state, each including school counts used for grade entry',
    type: [GradeEntryMetadataLocalGovernmentDto],
  })
  localGovernments: GradeEntryMetadataLocalGovernmentDto[];

  @ApiProperty({
    description: 'Total number of active subjects available for the state',
    example: 24,
  })
  totalSubjects: number;

  @ApiProperty({
    description:
      'Subjects organized by school level (PRIMARY and SECONDARY), each containing count and list of subjects',
    type: GradeEntryMetadataSubjectsGroupedDto,
  })
  subjects: GradeEntryMetadataSubjectsGroupedDto;
}

export class GradeEntryMetadataResponseDto {
  @ApiProperty({ description: 'Operation success flag', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Academic metadata retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description:
      'Response data payload containing session, term, LGA metadata, and available subjects for grade entry',
    type: GradeEntryMetadataDataDto,
  })
  data: GradeEntryMetadataDataDto;

  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;
}



