import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TermService } from './term.service';

@ApiTags('academic-term')
@Controller('academic/terms')
export class TermController {
  constructor(private readonly termService: TermService) {}

  @Get()
  @ApiOperation({ summary: 'Get all terms' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sessionId', required: false, description: 'Filter by session ID' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'Terms retrieved successfully' })
  async getAllTerms(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sessionId') sessionId?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.termService.getAllTerms(page, limit, sessionId, isActive);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current active term' })
  @ApiResponse({ status: 200, description: 'Current term retrieved successfully' })
  async getCurrentTerm() {
    return this.termService.getCurrentTerm();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get term by ID' })
  @ApiParam({ name: 'id', description: 'Term ID' })
  @ApiResponse({ status: 200, description: 'Term retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Term not found' })
  async getTermById(@Param('id') id: string) {
    return this.termService.getTermById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new term' })
  @ApiResponse({ status: 201, description: 'Term created successfully' })
  async createTerm(@Body() createTermDto: any) {
    return this.termService.createTerm(createTermDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update term' })
  @ApiParam({ name: 'id', description: 'Term ID' })
  @ApiResponse({ status: 200, description: 'Term updated successfully' })
  @ApiResponse({ status: 404, description: 'Term not found' })
  async updateTerm(@Param('id') id: string, @Body() updateTermDto: any) {
    return this.termService.updateTerm(id, updateTermDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete term' })
  @ApiParam({ name: 'id', description: 'Term ID' })
  @ApiResponse({ status: 200, description: 'Term deleted successfully' })
  @ApiResponse({ status: 404, description: 'Term not found' })
  async deleteTerm(@Param('id') id: string) {
    return this.termService.deleteTerm(id);
  }

  @Put(':id/activate')
  @ApiOperation({ summary: 'Activate term' })
  @ApiParam({ name: 'id', description: 'Term ID' })
  @ApiResponse({ status: 200, description: 'Term activated successfully' })
  async activateTerm(@Param('id') id: string) {
    return this.termService.activateTerm(id);
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate term' })
  @ApiParam({ name: 'id', description: 'Term ID' })
  @ApiResponse({ status: 200, description: 'Term deactivated successfully' })
  async deactivateTerm(@Param('id') id: string) {
    return this.termService.deactivateTerm(id);
  }

  @Get(':id/assessments')
  @ApiOperation({ summary: 'Get assessments for a term' })
  @ApiParam({ name: 'id', description: 'Term ID' })
  @ApiResponse({ status: 200, description: 'Term assessments retrieved successfully' })
  async getTermAssessments(@Param('id') id: string) {
    return this.termService.getTermAssessments(id);
  }
} 