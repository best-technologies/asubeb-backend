import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnrollOfficerDto {
  @ApiProperty({
    description: 'Email address of the officer',
    example: 'officer@subeb.gov.ng',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password for the officer account',
    example: 'SecurePassword123!',
  })
  // Password is now generated automatically on the server side.
  // Field kept only in Swagger description for legacy docs; it is NOT required in the payload.

  @ApiProperty({
    description: 'First name of the officer',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the officer',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Phone number of the officer',
    example: '+234 801 234 5678',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

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

  // stateId is derived from the currently signed-in (enrolling) user on the server side
  // and should NOT be sent from the client.
}

