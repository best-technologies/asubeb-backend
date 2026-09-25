import { IsString, IsOptional, IsNumber, Min, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClassDto {
  @ApiPropertyOptional({
    description: 'Name of the class',
    example: 'Primary 1A',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    description: 'Grade level',
    example: 'Primary 1',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  grade?: string;

  @ApiPropertyOptional({
    description: 'Section identifier',
    example: 'A',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  section?: string;

  @ApiPropertyOptional({
    description: 'Class student capacity',
    example: 40,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({
    description: 'Academic year',
    example: '2024-2025',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  academicYear?: string;

  @ApiPropertyOptional({
    description: 'Assigned teacher ID',
    example: 'teacher-cuid-123',
  })
  @IsString()
  @IsOptional()
  teacherId?: string;

  @ApiPropertyOptional({
    description: 'Active status of the class',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
