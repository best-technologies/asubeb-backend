import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateStudentDto {
  @ApiProperty({ description: 'Student first name', example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Student last name', example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Unique student ID', example: 'STU123456' })
  @IsString()
  studentId: string;

  @ApiProperty({ description: 'Student email address', example: 'john.doe@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Student phone number', example: '+2348012345678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Student date of birth', example: '2010-05-15', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ description: 'Student gender', enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ description: 'Student address', example: '123 Main Street, Lagos', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'School ID where student is enrolled', example: 'school-uuid-123' })
  @IsUUID()
  schoolId: string;

  @ApiProperty({ description: 'Class ID where student is enrolled', example: 'class-uuid-456' })
  @IsUUID()
  classId: string;

  @ApiProperty({ description: 'Parent ID (if parent exists)', example: 'parent-uuid-789', required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ description: 'Student enrollment date', example: '2024-09-01', required: false })
  @IsOptional()
  @IsDateString()
  enrollmentDate?: string;
}
