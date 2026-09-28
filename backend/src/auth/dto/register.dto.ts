import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';
import {
  UserRole,
} from '../../users/enums/user-role.enum';

const publicRegistrationRoles = [
  UserRole.CLIENT,
  UserRole.TRAINER,
  UserRole.NUTRITIONIST,
];

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
    message:
      'Lozinka mora da sadrži malo slovo.',
  })
  @Matches(/[A-Z]/, {
    message:
      'Lozinka mora da sadrži veliko slovo.',
  })
  @Matches(/[0-9]/, {
    message:
      'Lozinka mora da sadrži cifru.',
  })
  password!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\s()-]{6,30}$/, {
    message:
      'Broj telefona nije u ispravnom formatu.',
  })
  phoneNumber?: string;

  @IsInt()
  @Min(1)
  cityId!: number;

  @IsEnum(UserRole)
  role!: UserRole;

  static isPublicRole(
    role: UserRole,
  ): boolean {
    return publicRegistrationRoles.includes(
      role,
    );
  }
}