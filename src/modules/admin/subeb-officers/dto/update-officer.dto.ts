import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOfficerDto {
  @ApiPropertyOptional({
    description: 'First name of the officer',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name of the officer',
    example: 'Doe',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Email address of the officer',
    example: 'officer@subeb.gov.ng',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the officer',
    example: '+234 801 234 5678',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Address of the officer',
    example: '123 Education Street, Abuja',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Designation of the officer',
    example: 'Education Officer',
  })
  @IsString()
  @IsOptional()
  designation?: string;

  @ApiPropertyOptional({
    description: 'Whether the officer is active',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}







