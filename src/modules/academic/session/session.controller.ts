import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SessionService } from './session.service';
import { CreateSessionDto, UpdateSessionDto } from './dto';

@ApiTags('academic-session')
@Controller('academic/sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sessions' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  async getAllSessions(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.sessionService.getAllSessions(page, limit, isActive);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current active session' })
  @ApiResponse({ status: 200, description: 'Current session retrieved successfully' })
  async getCurrentSession() {
    return this.sessionService.getCurrentSession();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session by ID' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getSessionById(@Param('id') id: string) {
    return this.sessionService.getSessionById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new session' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createSession(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionService.createSession(createSessionDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session updated successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async updateSession(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
    return this.sessionService.updateSession(id, updateSessionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session deleted successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async deleteSession(@Param('id') id: string) {
    return this.sessionService.deleteSession(id);
  }

  @Put(':id/activate')
  @ApiOperation({ summary: 'Activate session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session activated successfully' })
  async activateSession(@Param('id') id: string) {
    return this.sessionService.activateSession(id);
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session deactivated successfully' })
  async deactivateSession(@Param('id') id: string) {
    return this.sessionService.deactivateSession(id);
  }

  @Get(':id/terms')
  @ApiOperation({ summary: 'Get terms for a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session terms retrieved successfully' })
  async getSessionTerms(@Param('id') id: string) {
    return this.sessionService.getSessionTerms(id);
  }
} 