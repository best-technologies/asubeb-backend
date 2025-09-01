import { Controller, Post, Get, Body, Logger, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
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

  @Get()
  @ApiOperation({ summary: 'Get all schools with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page (default: 10)', example: 10 })
  @ApiResponse({ status: 200, description: 'Schools retrieved successfully' })
  async getAllSchools(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    this.logger.log(colors.cyan(`Received request to fetch schools - page: ${page}, limit: ${limit}`));
    return this.schoolService.getAllSchools(page, limit);
  }

  @Get('classes')
  @ApiOperation({ summary: 'Get all classes with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page (default: 10)', example: 10 })
  @ApiResponse({ status: 200, description: 'Classes retrieved successfully' })
  async getAllClasses(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    this.logger.log(colors.cyan(`Received request to fetch classes - page: ${page}, limit: ${limit}`));
    return this.schoolService.getAllClasses(page, limit);
  }

  @Post('update-student-counts')
  @ApiOperation({ summary: 'Update all schools student counts' })
  @ApiResponse({ status: 200, description: 'Student counts updated successfully' })
  async updateAllStudentCounts() {
    this.logger.log(colors.cyan('Received request to update all school student counts'));
    return this.schoolService.updateAllSchoolsStudentCounts();
  }
} 