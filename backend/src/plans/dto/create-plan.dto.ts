import {
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { PlanType } from '../enums/plan-type.enum';

export class CreatePlanDto {
  @IsInt()
  @Min(1)
  clientId!: number;

  @IsEnum(PlanType)
  type!: PlanType;

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
