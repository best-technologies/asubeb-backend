import { Controller, Post, Get, Patch, Body, Query, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SubebOfficersService } from './subeb-officers.service';
import { EnrollOfficerDto, UpdateOfficerDto } from './dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { ApiEnrollOfficer, ApiGetAllOfficers, ApiUpdateOfficer } from './subeb-officers.api.decorators';

@ApiTags('admin-subeb-officers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/subeb-officers')
export class SubebOfficersController {
  constructor(private readonly subebOfficersService: SubebOfficersService) {}

  // @Post('enroll-officer')
  // @Roles('subeb-admin', 'admin')
  // @ApiEnrollOfficer()
  // async enrollOfficer(@Body() dto: EnrollOfficerDto, @Request() req) {
  //   const enrolledByUserId = req.user?.id;
  //   if (!enrolledByUserId) {
  //     throw new UnauthorizedException('User ID not found in request. Please ensure JWT authentication is working correctly.');
  //   }
  //   return this.subebOfficersService.enrollOfficer(dto, enrolledByUserId);
  // }

  @Get()
  @Roles('SUBEB_ADMIN', 'ADMIN', 'SUPER_ADMIN')
  @ApiGetAllOfficers()
  async getAllOfficers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Request() req,
  ) {
    // Get the current user's stateId to filter officers by state
    const userStateId = req.user?.stateId;
    return this.subebOfficersService.getAllOfficers(page, limit, userStateId);
  }

  @Patch(':id')
  @Roles('subeb-admin', 'admin')
  @ApiUpdateOfficer()
  async updateOfficer(
    @Param('id') id: string,
    @Body() dto: UpdateOfficerDto,
  ) {
    return this.subebOfficersService.updateOfficer(id, dto);
  }
}

