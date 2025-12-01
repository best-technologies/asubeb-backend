import { Module } from '@nestjs/common';
import { SubebOfficersController } from './subeb-officers.controller';
import { SubebOfficersService } from './subeb-officers.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SubebOfficersController],
  providers: [SubebOfficersService],
  exports: [SubebOfficersService],
})
export class SubebOfficersModule {}

