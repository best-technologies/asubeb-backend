import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsEnum, IsUUID } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TermType } from '@prisma/client';

export class DashboardQueryDto {
  @ApiPropertyOptional({
    description: 'Academic session (e.g., 2023-2024). If not provided, current session will be used',
    example: '2023-2024',
  })
  @IsOptional()
  @IsString()
  session?: string;

  @ApiPropertyOptional({
    description: 'Academic term. If not provided, current term will be used',
    enum: TermType,
    example: 'FIRST_TERM',
  })
  @IsOptional()
  @IsEnum(TermType)
  term?: TermType;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of records per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search term for filtering students, schools, or classes',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by school ID',
    example: 'clx1234567890abcdef',
  })
  @IsOptional()
  @IsUUID()
  schoolId?: string;

  @ApiPropertyOptional({
    description: 'Filter by class ID',
    example: 'clx1234567890abcdef',
  })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({
    description: 'Filter by gender',
    enum: ['MALE', 'FEMALE', 'OTHER'],
    example: 'MALE',
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({
    description: 'Filter by school level',
    enum: ['PRIMARY', 'SECONDARY'],
    example: 'PRIMARY',
  })
  @IsOptional()
  @IsString()
  schoolLevel?: string;

  @ApiPropertyOptional({
    description: 'Filter by LGA ID',
    example: 'clx1234567890abcdef',
  })
  @IsOptional()
  @IsUUID()
  lgaId?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['name', 'totalStudents', 'totalTeachers', 'createdAt'],
    example: 'name',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'name';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({
    description: 'Include detailed statistics',
    example: true,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeStats?: boolean = false;

  @ApiPropertyOptional({
    description: 'Include performance data',
    example: true,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includePerformance?: boolean = false;
}
