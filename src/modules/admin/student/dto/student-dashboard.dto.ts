import { ApiProperty } from '@nestjs/swagger';

export class GenderDistributionDto {
  @ApiProperty({ description: 'Gender type', example: 'MALE' })
  gender: string;

  @ApiProperty({ description: 'Count of students with this gender', example: 25 })
  _count: {
    gender: number;
  };
}

export class PerformanceTableDto {
  @ApiProperty({ description: 'Student position in class', example: 1 })
  position: number;

  @ApiProperty({ description: 'Student full name', example: 'John Doe' })
  studentName: string;

  @ApiProperty({ description: 'Student ID number', example: 'STU123456' })
  examNo: string;

  @ApiProperty({ description: 'School name', example: 'Central Primary School' })
  school: string;

  @ApiProperty({ description: 'Class name', example: 'Primary 5' })
  class: string;

  @ApiProperty({ description: 'Total score', example: 450 })
  total: number;

  @ApiProperty({ description: 'Average score', example: 85.5 })
  average: number;

  @ApiProperty({ description: 'Percentage score', example: 85.5 })
  percentage: number;

  @ApiProperty({ description: 'Student gender', example: 'MALE' })
  gender: string;
}

export class StudentDashboardResponseDto {
  @ApiProperty({ description: 'Current academic session', example: '2024/2025' })
  session: string;

  @ApiProperty({ description: 'Current academic term', example: 'FIRST_TERM' })
  term: string;

  @ApiProperty({ description: 'Available LGAs', type: 'array', items: { type: 'object' } })
  lgas: any[];

  @ApiProperty({ description: 'Available schools', type: 'array', items: { type: 'object' } })
  schools: any[];

  @ApiProperty({ description: 'Available classes', type: 'array', items: { type: 'object' } })
  classes: any[];

  @ApiProperty({ description: 'Available subjects', type: 'array', items: { type: 'object' } })
  subjects: any[];

  @ApiProperty({ description: 'Gender distribution', type: [GenderDistributionDto] })
  genders: GenderDistributionDto[];

  @ApiProperty({ description: 'Student performance table', type: [PerformanceTableDto] })
  performanceTable: PerformanceTableDto[];

  @ApiProperty({ description: 'Last updated timestamp', example: '2024-09-01T10:00:00.000Z' })
  lastUpdated: string;
}
