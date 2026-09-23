import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SchoolQueryDto {
  @ApiPropertyOptional({ description: 'Page number (default: 1)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page (default: 10)', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Search by school name, code, or address' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Academic session filter' })
  @IsOptional()
  @IsString()
  session?: string;

  @ApiPropertyOptional({ description: 'Academic term filter' })
  @IsOptional()
  @IsString()
  term?: string;

  @ApiPropertyOptional({ description: 'LGA ID filter' })
  @IsOptional()
  @IsString()
  lgaId?: string;

  @ApiPropertyOptional({ description: 'Field to sort by (name, averageScore, totalStudents)', default: 'name' })
  @IsOptional()
  @IsString()
  sortBy: string = 'name';

  @ApiPropertyOptional({ description: 'Sort order (asc, desc)', default: 'asc' })
  @IsOptional()
  @IsString()
  sortOrder: 'asc' | 'desc' = 'asc';
}
