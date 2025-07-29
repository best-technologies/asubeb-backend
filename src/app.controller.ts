import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AppService } from './app.service';
import { DatabaseHealthService } from './health/database-health.service';

@ApiTags('default')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly databaseHealthService: DatabaseHealthService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get hello message' })
  @ApiResponse({ status: 200, description: 'Returns a hello message' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Server is healthy' })
  async getHealth(): Promise<{ status: string; timestamp: string; database: any }> {
    const dbHealth = await this.databaseHealthService.checkHealth();
    
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbHealth,
    };
  }

  @Post('echo')
  @ApiOperation({ summary: 'Echo endpoint' })
  @ApiResponse({ status: 201, description: 'Returns the sent data' })
  echo(@Body() data: any): any {
    return {
      message: 'Data received successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUser(@Param('id') id: string): { id: string; name: string; email: string } {
    return {
      id,
      name: 'John Doe',
      email: 'john@example.com',
    };
  }
}
