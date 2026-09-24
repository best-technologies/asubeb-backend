import { Controller, Post, Get, Patch, Body, Logger, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SchoolService } from './school.service';
import { CreateSchoolDto, UpdateSchoolDto, SchoolAnalyticsQueryDto, SchoolQueryDto } from './dto';
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

  @Get('analytics')
  @ApiOperation({ summary: 'Get comprehensive school performance and demographic analytics' })
  @ApiResponse({ status: 200, description: 'School analytics retrieved successfully' })
  async getSchoolAnalytics(@Query() query: SchoolAnalyticsQueryDto) {
    this.logger.log(colors.cyan(`Received request to fetch school analytics - session: ${query.session}, term: ${query.term}, lgaId: ${query.lgaId}`));
    return this.schoolService.getSchoolAnalytics(query);
  }

  @Get()
  @ApiOperation({ summary: 'Get all schools with pagination, search, and academic scores' })
  @ApiResponse({ status: 200, description: 'Schools retrieved successfully' })
  async getAllSchools(@Query() query: SchoolQueryDto) {
    this.logger.log(colors.cyan(`Received request to fetch schools - page: ${query.page}, limit: ${query.limit}, search: ${query.search}, lgaId: ${query.lgaId}`));
    return this.schoolService.getAllSchools(query);
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

  @Get(':id')
  @ApiOperation({ summary: 'Get school details by ID' })
  @ApiResponse({ status: 200, description: 'School retrieved successfully' })
  @ApiResponse({ status: 404, description: 'School not found' })
  async getSchoolById(@Param('id') id: string) {
    this.logger.log(colors.cyan(`Received request to fetch school details for ID: ${id}`));
    return this.schoolService.getSchoolById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update school details' })
  @ApiResponse({ status: 200, description: 'School updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'School or Local Government Area not found' })
  @ApiResponse({ status: 409, description: 'School with this name already exists' })
  async updateSchool(
    @Param('id') id: string,
    @Body() updateSchoolDto: UpdateSchoolDto,
  ) {
    this.logger.log(colors.cyan(`Received request to update school ID: ${id}`));
    return this.schoolService.updateSchool(id, updateSchoolDto);
  }
}