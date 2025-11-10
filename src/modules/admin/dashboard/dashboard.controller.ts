import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto';
import { TermType } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('admin-dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get admin dashboard data with pagination, search, and filters',
    description: 'Returns dashboard data for the current session and term by default. Users can specify session and term to switch between different academic periods.'
  })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiResponse({ status: 404, description: 'Session or term not found' })
  async getAdminDashboard(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getAdminDashboard(query);
  }

  @Get('performance-table')
  @ApiOperation({ summary: 'Get student performance table' })
  @ApiQuery({ name: 'session', required: true, description: 'Academic session' })
  @ApiQuery({ name: 'term', required: true, description: 'Academic term' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Records per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by student name or ID' })
  @ApiQuery({ name: 'schoolId', required: false, description: 'Filter by school ID' })
  @ApiQuery({ name: 'classId', required: false, description: 'Filter by class ID' })
  @ApiQuery({ name: 'gender', required: false, description: 'Filter by gender (MALE, FEMALE, OTHER)' })
  @ApiResponse({ status: 200, description: 'Performance table retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid session or term' })
  async fetchDashboardPerformanceTable(
    @Query('session') session: string,
    @Query('term') term: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('schoolId') schoolId?: string,
    @Query('classId') classId?: string,
    @Query('gender') gender?: string,
  ) {
    return this.dashboardService.fetchDashboardPerformanceTable(
      session,
      term as TermType,
      page,
      limit,
      search,
      schoolId,
      classId,
      gender,
    );
  }
} 