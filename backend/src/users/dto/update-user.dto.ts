import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\s()-]{6,30}$/, {
    message: 'Broj telefona nije u ispravnom formatu.',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  cityId?: number | null;
}
