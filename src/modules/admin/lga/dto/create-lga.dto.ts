import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLgaDto {
  @ApiProperty({
    description: 'Name of the Local Government Area (will be converted to lowercase)',
    example: 'Ikeja',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the Local Government Area (will be converted to lowercase)',
    example: 'Ikeja Local Government Area in Lagos State',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  description?: string;
} 