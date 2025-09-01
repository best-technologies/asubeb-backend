import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({
    description: 'Session name (e.g., 2023-2024)',
    example: '2023-2024',
  })
  @IsString()
  @IsNotEmpty()
  name: string;



  @ApiProperty({
    description: 'Session start date',
    example: '2023-09-01',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'Session end date',
    example: '2024-07-31',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({
    description: 'Whether the session is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this is the current session',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
} 