import { ApiProperty } from '@nestjs/swagger';

export class EnrollmentLgaDto {
  @ApiProperty({ description: 'LGA ID', example: 'lga-uuid-123' })
  id: string;

  @ApiProperty({ description: 'LGA name', example: 'Umuahia North' })
  name: string;

  @ApiProperty({ description: 'LGA code', example: 'UMN' })
  code: string;

  @ApiProperty({ description: 'LGA state name', example: 'Abia' })
  state: string;

  @ApiProperty({ description: 'Total number of schools in this LGA', example: 12 })
  totalSchools: number;
}

export class EnrollmentSchoolsDto {
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

export class EnrollmentClassDto {
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

export class StudentEnrollmentMetadataDataDto {
  @ApiProperty({ description: 'State ID', example: 'state-uuid-123' })
  stateId: string;

  @ApiProperty({
    description: 'Current academic session information',
    nullable: true,
  })
  currentSession: {
    id: string;
    name: string;
    isCurrent: boolean;
  } | null;

  @ApiProperty({
    description: 'Current academic term information',
    nullable: true,
  })
  currentTerm: {
    id: string;
    name: string;
    isCurrent: boolean;
  } | null;

  @ApiProperty({ description: 'Total number of LGAs in this state', example: 17 })
  totalLocalGovernments: number;

  @ApiProperty({ type: [EnrollmentLgaDto], description: 'List of LGAs in the state' })
  localGovernments: EnrollmentLgaDto[];
}

export class StudentEnrollmentMetadataResponseDto {
  @ApiProperty({ description: 'Operation success flag', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Student enrollment metadata retrieved successfully',
  })
  message: string;

  @ApiProperty({ type: StudentEnrollmentMetadataDataDto, description: 'Response data payload' })
  data: StudentEnrollmentMetadataDataDto;

  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;
}

export class StudentEnrollmentSchoolsDataDto {
  @ApiProperty({ description: 'State ID', example: 'state-uuid-123' })
  stateId: string;

  @ApiProperty({ description: 'LGA ID', example: 'lga-uuid-123' })
  lgaId: string;

  @ApiProperty({ description: 'Total number of schools in this LGA', example: 10 })
  total: number;

  @ApiProperty({ type: [EnrollmentSchoolsDto], description: 'List of schools in the LGA' })
  schools: EnrollmentSchoolsDto[];
}

export class StudentEnrollmentSchoolsResponseDto {
  @ApiProperty({ description: 'Operation success flag', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Schools for student enrollment retrieved successfully',
  })
  message: string;

  @ApiProperty({ type: StudentEnrollmentSchoolsDataDto, description: 'Response data payload' })
  data: StudentEnrollmentSchoolsDataDto;

  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;
}

export class StudentEnrollmentClassesDataDto {
  @ApiProperty({ description: 'State ID', example: 'state-uuid-123' })
  stateId: string;

  @ApiProperty({ description: 'School ID', example: 'school-uuid-123' })
  schoolId: string;

  @ApiProperty({ description: 'Total number of classes in this school', example: 12 })
  total: number;

  @ApiProperty({ type: [EnrollmentClassDto], description: 'List of classes in the school' })
  classes: EnrollmentClassDto[];
}

export class StudentEnrollmentClassesResponseDto {
  @ApiProperty({ description: 'Operation success flag', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Classes for student enrollment retrieved successfully',
  })
  message: string;

  @ApiProperty({ type: StudentEnrollmentClassesDataDto, description: 'Response data payload' })
  data: StudentEnrollmentClassesDataDto;

  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;
}

// Generic wrapper for SUBEB officer enrollment response
export class EnrolledSubebOfficerUserDto {
  @ApiProperty({ description: 'User ID', example: 'user-uuid-123' })
  id: string;

  @ApiProperty({ description: 'Officer email', example: 'officer@subeb.gov.ng' })
  email: string;

  @ApiProperty({ description: 'User role', example: 'SUBEB_OFFICER' })
  role: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  lastName: string;
}

export class EnrollSubebOfficerResponseDto {
  @ApiProperty({ description: 'Operation success flag', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'SUBEB officer registered',
  })
  message: string;

  @ApiProperty({
    description: 'Created SUBEB officer user payload',
  })
  data: EnrolledSubebOfficerUserDto;

  @ApiProperty({ description: 'HTTP status code', example: 201 })
  statusCode: number;
}

// Generic wrapper for single or bulk student enrollment response
export class EnrollStudentsResponseDto {
  @ApiProperty({ description: 'Operation success flag', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'New student(s) enrolled successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Array of created student records',
    isArray: true,
    // For brevity we leave this loosely typed; Swagger will still show it as an array
  })
  data: any[];

  @ApiProperty({ description: 'HTTP status code', example: 201 })
  statusCode: number;
}



