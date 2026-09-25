import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ClassAnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Academic session name or ID',
    example: '2024/2025',
  })
  @IsOptional()
  @IsString()
  session?: string;

  @ApiPropertyOptional({
    description: 'Academic term (FIRST, SECOND, THIRD, or ALL_TERMS)',
    example: 'FIRST',
  })
  @IsOptional()
  @IsString()
  term?: string;

  @ApiPropertyOptional({
    description: 'Filter analytics by LGA ID',
    example: 'lga-cuid-123',
  })
  @IsOptional()
  @IsString()
  lgaId?: string;

  @ApiPropertyOptional({
    description: 'Filter analytics by School ID',
    example: 'school-cuid-123',
  })
  @IsOptional()
  @IsString()
  schoolId?: string;
}
