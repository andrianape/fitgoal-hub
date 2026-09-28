import {
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreatePlanDto {
  @IsInt()
  @Min(1)
  clientId!: number;

  @IsString()
  @Length(2, 200)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(2, 2000)
  description?: string;

  @IsObject()
  content!: Record<string, unknown>;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}