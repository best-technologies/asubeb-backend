import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ClassService } from './class.service';

@ApiTags('admin-class')
@Controller('admin/classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get()
  @ApiOperation({ summary: 'Get all classes' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'schoolId', required: false, description: 'Filter by school ID' })
  @ApiResponse({ status: 200, description: 'Classes retrieved successfully' })
  async getAllClasses(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('schoolId') schoolId?: string,
  ) {
    return this.classService.getAllClasses(page, limit, schoolId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get class by ID' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async getClassById(@Param('id') id: string) {
    return this.classService.getClassById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new class' })
  @ApiResponse({ status: 201, description: 'Class created successfully' })
  async createClass(@Body() createClassDto: any) {
    return this.classService.createClass(createClassDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update class' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class updated successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async updateClass(@Param('id') id: string, @Body() updateClassDto: any) {
    return this.classService.updateClass(id, updateClassDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete class' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class deleted successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async deleteClass(@Param('id') id: string) {
    return this.classService.deleteClass(id);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Get students in class' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class students retrieved successfully' })
  async getClassStudents(@Param('id') id: string) {
    return this.classService.getClassStudents(id);
  }

  @Get(':id/schedule')
  @ApiOperation({ summary: 'Get class schedule' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class schedule retrieved successfully' })
  async getClassSchedule(@Param('id') id: string) {
    return this.classService.getClassSchedule(id);
  }
} 