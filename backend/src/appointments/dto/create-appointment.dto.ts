import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsInt()
  @Min(1)
  slotId!: number;

  @IsOptional()
  @IsString()
  @Length(2, 1000)
  clientNote?: string;
}