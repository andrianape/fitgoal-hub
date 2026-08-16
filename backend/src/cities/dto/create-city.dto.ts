import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateCityDto {
  @IsString()
  @Length(2, 100)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(5, 20)
  @Matches(/^[0-9]+$/, {
    message: 'Poštanski broj sme da sadrži samo cifre.',
  })
  postalCode?: string;
}