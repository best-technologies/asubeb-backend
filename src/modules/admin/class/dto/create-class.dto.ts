import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({
    description: 'Name of the class (e.g., Primary 1A, JSS 1B)',
    example: 'Primary 1A',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Grade level (e.g., Primary 1, JSS 1, Basic 1)',
    example: 'Primary 1',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  grade: string;

  @ApiPropertyOptional({
    description: 'Section identifier (e.g., A, B, C, Gold)',
    example: 'A',
    default: 'A',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim() || 'A')
  section?: string = 'A';

  @ApiProperty({
    description: 'ID of the school this class belongs to',
    example: 'school-cuid-123',
  })
  @IsString()
  @IsNotEmpty()
  schoolId: string;

  @ApiPropertyOptional({
    description: 'Class student capacity',
    example: 35,
    default: 35,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  capacity?: number = 35;

  @ApiPropertyOptional({
    description: 'Academic year (e.g., 2024-2025 or 2024/2025)',
    example: '2024-2025',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  academicYear?: string;

  @ApiPropertyOptional({
    description: 'Optional ID of the assigned class teacher',
    example: 'teacher-cuid-123',
  })
  @IsString()
  @IsOptional()
  teacherId?: string;
}
