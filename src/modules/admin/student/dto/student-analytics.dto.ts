import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { TermType } from '@prisma/client';

export class StudentAnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Academic session (e.g., 2024/2025)' })
  @IsOptional()
  @IsString()
  session?: string;

  @ApiPropertyOptional({ description: 'Academic term (FIRST_TERM, SECOND_TERM, THIRD_TERM, ALL_TERMS)' })
  @IsOptional()
  @IsString()
  term?: string;

  @ApiPropertyOptional({ description: 'Optional LGA filter' })
  @IsOptional()
  @IsString()
  lgaId?: string;

  @ApiPropertyOptional({ description: 'Optional School filter' })
  @IsOptional()
  @IsString()
  schoolId?: string;
}

export interface ClassPerformanceItem {
  className: string;
  studentCount: number;
  averageScore: number;
  averagePercentage: number;
  maleAverage: number;
  femaleAverage: number;
}

export interface SchoolPerformanceItem {
  schoolId: string;
  schoolName: string;
  lgaName: string;
  studentCount: number;
  averagePercentage: number;
  totalScore: number;
}

export interface LgaPerformanceItem {
  lgaId: string;
  lgaName: string;
  lgaCode: string;
  schoolCount: number;
  studentCount: number;
  averagePercentage: number;
  passRate: number;
  previousAverage?: number | null;
  change?: number | null;
}

export interface GenderPerformanceItem {
  gender: string;
  studentCount: number;
  averagePercentage: number;
  passRate: number;
  sharePercentage: number;
}

export interface AgeRangePerformanceItem {
  range: string;
  studentCount: number;
  averagePercentage: number;
  passRate: number;
}

export interface AnalyticsSummary {
  overallAverage: number;
  totalStudentsAssessed: number;
  totalEnrollment: number;
  topPerformingLga: string;
  topPerformingClass: string;
  genderParityIndex: number;
}

export interface StudentAnalyticsResponse {
  session: string;
  term: string;
  summary: AnalyticsSummary;
  byClass: ClassPerformanceItem[];
  bySchool: SchoolPerformanceItem[];
  byLga: LgaPerformanceItem[];
  byGender: GenderPerformanceItem[];
  byAgeRange: AgeRangePerformanceItem[];
}
