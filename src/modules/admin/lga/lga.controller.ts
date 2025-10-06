import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LgaService } from './lga.service';
import { CreateLgaDto } from './dto';
import * as colors from 'colors';

@ApiTags('admin-lga')
@Controller('admin/lga')
export class LgaController {
  private readonly logger = new Logger(LgaController.name);
  
  constructor(private readonly lgaService: LgaService) {}

  @Post()
  @ApiOperation({ summary: 'Create new Local Government Area' })
  @ApiResponse({ 
    status: 201, 
    description: 'Local Government Area created successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Local Government Area with this name or code already exists' 
  })
  async createLga(@Body() createLgaDto: CreateLgaDto) {
    this.logger.log(colors.cyan('Received LGA creation request'));
    return this.lgaService.createLga(createLgaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Local Government Areas' })
  @ApiResponse({ status: 200, description: 'List of LGAs retrieved successfully' })
  async getAllLga() {
    this.logger.log(colors.cyan('Received request to list LGAs'));
    return this.lgaService.getAllLga();
  }
} 