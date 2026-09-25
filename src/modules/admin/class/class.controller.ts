import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ClassService } from './class.service';
import {
  CreateClassDto,
  UpdateClassDto,
  ClassQueryDto,
  ClassAnalyticsQueryDto,
} from './dto';
import * as colors from 'colors';

@ApiTags('admin-class')
@Controller('admin/classes')
export class ClassController {
  private readonly logger = new Logger(ClassController.name);

  constructor(private readonly classService: ClassService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Get comprehensive class analytics & demographic metrics' })
  @ApiResponse({ status: 200, description: 'Class analytics retrieved successfully' })
  async getClassAnalytics(@Query() query: ClassAnalyticsQueryDto) {
    this.logger.log(
      colors.cyan(
        `Received class analytics request - session: ${query.session}, lgaId: ${query.lgaId}, schoolId: ${query.schoolId}`,
      ),
    );
    return this.classService.getClassAnalytics(query);
  }

  @Get()
  @ApiOperation({ summary: 'Get all classes with pagination, multi-field filtering, and search' })
  @ApiResponse({ status: 200, description: 'Classes retrieved successfully' })
  async getAllClasses(@Query() query: ClassQueryDto) {
    this.logger.log(
      colors.cyan(
        `Received get all classes request - page: ${query.page}, limit: ${query.limit}, search: ${query.search}`,
      ),
    );
    return this.classService.getAllClasses(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get class by ID' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async getClassById(@Param('id') id: string) {
    this.logger.log(colors.cyan(`Received get class request for ID: ${id}`));
    return this.classService.getClassById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new class' })
  @ApiResponse({ status: 201, description: 'Class created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'School not found' })
  @ApiResponse({ status: 409, description: 'Class already exists in school' })
  async createClass(@Body() createClassDto: CreateClassDto) {
    this.logger.log(colors.cyan(`Received create class request: ${createClassDto.name}`));
    return this.classService.createClass(createClassDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update class' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class updated successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 409, description: 'Class name conflict' })
  async updateClass(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    this.logger.log(colors.cyan(`Received update class request for ID: ${id}`));
    return this.classService.updateClass(id, updateClassDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update class (PUT compatibility)' })
  async updateClassPut(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    return this.classService.updateClass(id, updateClassDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate / delete class' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class deleted successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete class with active students' })
  async deleteClass(@Param('id') id: string) {
    this.logger.log(colors.cyan(`Received delete class request for ID: ${id}`));
    return this.classService.deleteClass(id);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Get students in class' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class students retrieved successfully' })
  async getClassStudents(@Param('id') id: string) {
    this.logger.log(colors.cyan(`Received get class students request for ID: ${id}`));
    return this.classService.getClassStudents(id);
  }
}