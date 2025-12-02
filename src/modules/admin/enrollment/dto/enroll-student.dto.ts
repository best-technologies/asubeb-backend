import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '@prisma/client';

export class EnrollStudentDto {
  @ApiProperty({ description: 'Student first name', example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Student last name', example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({
    description: 'Student email address',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Student phone number',
    example: '+2348012345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Student date of birth',
    example: '2010-05-15',
  })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ description: 'Student gender', enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiPropertyOptional({
    description: 'Student address',
    example: '123 Main Street, Lagos',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'School ID where student is to be enrolled',
    example: 'school-uuid-123',
  })
  @IsString()
  schoolId: string;

  @ApiProperty({
    description: 'Class ID where student is to be enrolled',
    example: 'class-uuid-456',
  })
  @IsString()
  classId: string;
}

export class EnrollSingleOrBulkStudentsDto {
  @ApiProperty({
    description: 'List of students to enroll. Can be single or multiple.',
    type: [EnrollStudentDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EnrollStudentDto)
  students: EnrollStudentDto[];
}



