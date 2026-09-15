import { IsString, Length, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @Length(8, 72)
  currentPassword!: string;

  @IsString()
  @Length(8, 72)
  @Matches(/[a-z]/, {
    message: 'Nova lozinka mora da sadrži malo slovo.',
  })
  @Matches(/[A-Z]/, {
    message: 'Nova lozinka mora da sadrži veliko slovo.',
  })
  @Matches(/[0-9]/, {
    message: 'Nova lozinka mora da sadrži cifru.',
  })
  newPassword!: string;
}
