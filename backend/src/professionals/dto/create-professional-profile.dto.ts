import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
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
  @Max(50)
  yearsOfExperience!: number;

  @IsInt()
  @Min(0)
  @Max(10000)
  pricePerSession!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  specialties!: string[];
}
