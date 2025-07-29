import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadExcelDto {
  @ApiProperty({
    description: 'Excel file to upload',
    type: 'string',
    format: 'binary',
  })
  @IsNotEmpty()
  @IsString()
  file: Express.Multer.File;
} 