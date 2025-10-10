import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TermType } from '@prisma/client';

export class StudentDashboardQueryDto {
  @ApiPropertyOptional({ description: 'Session (e.g., 2024/2025)' })
  @IsOptional()
  @IsString()
  session?: string;

  @ApiPropertyOptional({ description: 'Term (FIRST_TERM, SECOND_TERM, THIRD_TERM)' })
  @IsOptional()
  @IsString()
  term?: TermType;

  @ApiPropertyOptional({ description: 'Local Government Area ID' })
  @IsOptional()
  @IsString()
  lgaId?: string;

  @ApiPropertyOptional({ description: 'School ID' })
  @IsOptional()
  @IsString()
  schoolId?: string;

  @ApiPropertyOptional({ description: 'Class ID' })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiPropertyOptional({ description: 'Page number (default: 1)', minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page (default: 10)', minimum: 1, maximum: 100, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}