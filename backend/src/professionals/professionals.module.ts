import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { ProfessionalProfile } from './entities/professional-profile.entity';
import { ProfessionalsController } from './professionals.controller';
import { ProfessionalsService } from './professionals.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfessionalProfile,
      User,
    ]),
  ],
  controllers: [ProfessionalsController],
  providers: [ProfessionalsService],
  exports: [ProfessionalsService],
})
export class ProfessionalsModule {}