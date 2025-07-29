import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  Logger,
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { ExcelUploadService } from './excel-upload.service';
import * as colors from 'colors';

@ApiTags('admin-excel-upload')
@Controller('admin/excel-upload')
export class ExcelUploadController {
  private readonly logger = new Logger(ExcelUploadController.name);

  constructor(private readonly excelUploadService: ExcelUploadService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload Excel file with student data' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ 
    status: 201, 
    description: 'Excel file processed successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid file or processing error' 
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcelFile(@UploadedFile() file: Express.Multer.File) {
    this.logger.log(colors.cyan('Received Excel file upload request'));
    
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.excelUploadService.uploadExcelFile(file);
  }
} 