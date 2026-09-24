import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SchoolAnalyticsQueryDto {
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
}

export interface SchoolLgaPerformanceItem {
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

export interface TopSchoolRankingItem {
  schoolId: string;
  schoolName: string;
  lgaName: string;
  averagePercentage: number;
  studentCount: number;
  passRate: number;
}

export interface SchoolPerformanceBandItem {
  band: string;
  key: 'distinction' | 'good' | 'average' | 'needsImprovement';
  count: number;
  percentage: number;
  color: string;
}

export interface SchoolSizeDistributionItem {
  cohort: string;
  key: 'small' | 'medium' | 'large' | 'mega';
  count: number;
  percentage: number;
  averagePercentage: number;
  color: string;
}

export interface SchoolAnalyticsSummary {
  totalSchools: number;
  primarySchoolsCount?: number;
  secondarySchoolsCount?: number;
  statewideSchoolAverage: number;
  totalStudents: number;
  totalAssessedStudents: number;
  averageSchoolSize: number;
  topPerformingSchool: string;
  topPerformingLga: string;
}

export interface SchoolAnalyticsResponse {
  session: string;
  term: string;
  summary: SchoolAnalyticsSummary;
  byLga: SchoolLgaPerformanceItem[];
  topSchools: TopSchoolRankingItem[];
  performanceBands: SchoolPerformanceBandItem[];
  sizeDistribution: SchoolSizeDistributionItem[];
}
