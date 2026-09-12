import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { AppointmentStatus } from '../enums/appointment-status.enum';

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus)
  status!: AppointmentStatus;

  @IsOptional()
  @IsString()
  @Length(2, 1000)
  professionalNote?: string;
}