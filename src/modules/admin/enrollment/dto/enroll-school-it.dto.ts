import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EnrollSchoolItDto {
  @ApiProperty({ description: 'First name of the School-IT person' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name of the School-IT person' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Email address (will be used for login)' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'School ID they are assigned to' })
  @IsString()
  @IsNotEmpty()
  schoolId: string;

  @ApiProperty({ description: 'LGA ID they are assigned to' })
  @IsString()
  @IsNotEmpty()
  lgaId: string;

  @ApiPropertyOptional({ description: 'URL of the profile picture' })
  @IsString()
  @IsOptional()
  profilePicture?: string;
}
