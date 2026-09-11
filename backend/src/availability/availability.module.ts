import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessionalProfile } from '../professionals/entities/professional-profile.entity';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { AvailabilitySlot } from './entities/availability-slot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AvailabilitySlot,
      ProfessionalProfile,
    ]),
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}