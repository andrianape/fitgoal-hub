import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilitySlot } from '../availability/entities/availability-slot.entity';
import { ProfessionalProfile } from '../professionals/entities/professional-profile.entity';
import { User } from '../users/entities/user.entity';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      AvailabilitySlot,
      ProfessionalProfile,
      User,
    ]),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}