import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SchoolService } from './school.service';
import { CreateSchoolDto } from './dto';
import * as colors from 'colors';

@ApiTags('admin-school')
@Controller('admin/schools')
export class SchoolController {
  private readonly logger = new Logger(SchoolController.name);

  constructor(private readonly schoolService: SchoolService) {}

  @Post()
  @ApiOperation({ summary: 'Create new school' })
  @ApiResponse({ 
    status: 201, 
    description: 'School created successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Local Government Area not found' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'School with this name already exists' 
  })
  async createSchool(@Body() createSchoolDto: CreateSchoolDto) {
    this.logger.log(colors.cyan('Received school creation request'));
    return this.schoolService.createSchool(createSchoolDto);
  }

  @Post('update-student-counts')
  @ApiOperation({ summary: 'Update all schools student counts' })
  @ApiResponse({ status: 200, description: 'Student counts updated successfully' })
  async updateAllStudentCounts() {
    this.logger.log(colors.cyan('Received request to update all school student counts'));
    return this.schoolService.updateAllSchoolsStudentCounts();
  }
} 