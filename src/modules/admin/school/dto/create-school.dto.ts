import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SchoolLevel {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
}

export class CreateSchoolDto {
  @ApiProperty({
    description: 'Name of the school (will be converted to lowercase)',
    example: 'Asubeb Primary School',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  name: string;

  @ApiProperty({
    description: 'Address of the school (will be converted to lowercase)',
    example: '123 Education Street, Abuja',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  address: string;

  @ApiPropertyOptional({
    description: 'Phone number of the school',
    example: '+234 801 234 5678',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Email address of the school',
    example: 'info@asubeb.edu.ng',
  })
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email?: string;

  @ApiPropertyOptional({
    description: 'Website of the school',
    example: 'https://asubeb.edu.ng',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  website?: string;

  @ApiPropertyOptional({
    description: 'Name of the principal (will be converted to lowercase)',
    example: 'Dr. Sarah Johnson',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  principalName?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the principal',
    example: '+234 801 234 5678',
  })
  @IsString()
  @IsOptional()
  principalPhone?: string;

  @ApiPropertyOptional({
    description: 'Email address of the principal',
    example: 'principal@asubeb.edu.ng',
  })
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  principalEmail?: string;

  @ApiPropertyOptional({
    description: 'Year the school was established',
    example: 2010,
  })
  @IsNumber()
  @IsOptional()
  establishedYear?: number;

  @ApiPropertyOptional({
    description: 'Total number of students',
    example: 450,
  })
  @IsNumber()
  @IsOptional()
  totalStudents?: number;

  @ApiPropertyOptional({
    description: 'Total number of teachers',
    example: 25,
  })
  @IsNumber()
  @IsOptional()
  totalTeachers?: number;

  @ApiPropertyOptional({
    description: 'School capacity',
    example: 500,
  })
  @IsNumber()
  @IsOptional()
  capacity?: number;

  @ApiProperty({
    description: 'Level of the school',
    enum: SchoolLevel,
    example: SchoolLevel.PRIMARY,
  })
  @IsEnum(SchoolLevel)
  level: SchoolLevel;

  @ApiProperty({
    description: 'ID of the Local Government Area',
    example: 'clx123456789',
  })
  @IsString()
  @IsNotEmpty()
  lgaId: string;
} 