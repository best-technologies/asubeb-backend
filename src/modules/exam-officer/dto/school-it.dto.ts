import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateSchoolItDto {
  @ApiProperty({ description: 'First name of the School-IT personnel', example: 'Chinedu' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name of the School-IT personnel', example: 'Okafor' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Email address (used for login and notifications)', example: 'chinedu.okafor@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Phone number of the personnel', example: '08012345678' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'ID of the school to assign to this personnel within the LGA' })
  @IsString()
  @IsNotEmpty()
  schoolId: string;

  @ApiPropertyOptional({ description: 'Optional profile picture URL' })
  @IsString()
  @IsOptional()
  profilePicture?: string;
}

export class UpdateSchoolItDto {
  @ApiPropertyOptional({ description: 'First name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Assigned school ID within the LGA' })
  @IsString()
  @IsOptional()
  schoolId?: string;

  @ApiPropertyOptional({ description: 'Account status (active/inactive)' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
