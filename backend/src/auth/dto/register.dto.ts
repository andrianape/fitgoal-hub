import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(2, 100)
  firstName!: string;

  @IsString()
  @Length(2, 100)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(8, 72)
  @Matches(/[a-z]/, {
    message: 'Lozinka mora da sadrži malo slovo.',
  })
  @Matches(/[A-Z]/, {
    message: 'Lozinka mora da sadrži veliko slovo.',
  })
  @Matches(/[0-9]/, {
    message: 'Lozinka mora da sadrži cifru.',
  })
  password!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\s()-]{6,30}$/, {
    message: 'Broj telefona nije u ispravnom formatu.',
  })
  phoneNumber?: string;
}