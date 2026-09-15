import {
  IsBoolean,
  IsDateString,
  IsObject,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  @Length(2, 200)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2000)
  description?: string;

  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
