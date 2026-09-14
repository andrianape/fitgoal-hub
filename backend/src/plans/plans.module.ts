import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { ProfessionalProfile } from '../professionals/entities/professional-profile.entity';
import { User } from '../users/entities/user.entity';
import { Plan } from './entities/plan.entity';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Plan,
      User,
      ProfessionalProfile,
      Appointment,
    ]),
  ],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}