import {
  IsDateString,
  IsIn,
  IsOptional,
} from 'class-validator';
import {
  UserRole,
} from '../../users/enums/user-role.enum';

export class FindAvailableSlotsByDateDto {
  @IsDateString()
  date!: string;

  @IsOptional()
  @IsIn([
    UserRole.TRAINER,
    UserRole.NUTRITIONIST,
  ])
  role?: UserRole.TRAINER |
    UserRole.NUTRITIONIST;
}