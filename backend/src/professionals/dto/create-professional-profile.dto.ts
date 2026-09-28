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

export class CreateProfessionalProfileDto {
  @IsString()
  @Length(20, 2000)
  biography!: string;

  @IsInt()
  @Min(0)
  @Max(60)
  yearsOfExperience!: number;

  @IsInt()
  @Min(0)
  @Max(1000000)
  pricePerSession!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({
    each: true,
  })
  specialties!: string[];

  @IsOptional()
  @IsString()
  @Length(2, 200)
  workplaceName?: string;

  @IsString()
  @Length(5, 300)
  address!: string;

  @IsString()
  @Length(2, 100)
  qualificationType!: string;

  @IsString()
  @Length(2, 200)
  qualificationName!: string;

  @IsString()
  @Length(2, 200)
  issuingInstitution!: string;

  @IsInt()
  @Min(1950)
  @Max(new Date().getFullYear())
  qualificationYear!: number;

  @IsString()
  @Length(2, 100)
  credentialNumber!: string;
}