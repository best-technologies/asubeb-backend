import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterSubebOfficerDto {
  @ApiProperty({
    description: 'Email address of the SUBEB officer',
    example: 'officer@subeb.gov.ng',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

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
}


