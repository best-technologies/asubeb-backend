import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnrollmentService } from './enrollment.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { EnrollOfficerDto } from '../subeb-officers/dto';

@ApiTags('admin-enrollment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Get('health')
  @ApiOperation({ summary: 'Enrollment module health check' })
  async healthCheck() {
    return this.enrollmentService.healthCheck();
  }

  @Post('subeb-officers/enroll')
  @Roles('SUBEB_ADMIN', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Enroll a new SUBEB officer (role forced to SUBEB_OFFICER)' })
  @ApiBody({ type: EnrollOfficerDto })
  @ApiResponse({ status: 201, description: 'SUBEB officer enrolled successfully' })
  async enrollNewSubebOfficer(@Req() req: any, @Body() dto: EnrollOfficerDto) {
    return this.enrollmentService.enrollNewSubebOfficer(dto, req.user);
  }
}
