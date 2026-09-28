import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class UpdateProfessionalProfileDto {
  @IsOptional()
  @IsString()
  @Length(20, 2000)
  biography?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  yearsOfExperience?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000000)
  pricePerSession?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({
    each: true,
  })
  specialties?: string[];

  @IsOptional()
  @IsString()
  @Length(2, 200)
  workplaceName?: string;

  @IsOptional()
  @IsString()
  @Length(5, 300)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  qualificationType?: string;

  @IsOptional()
  @IsString()
  @Length(2, 200)
  qualificationName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 200)
  issuingInstitution?: string;

  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(new Date().getFullYear())
  qualificationYear?: number;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  credentialNumber?: string;
}