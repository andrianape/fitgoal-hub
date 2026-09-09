import { IsEnum } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class UpdateUserRoleDto {
  @IsEnum(UserRole, {
    message:
      'Uloga mora biti client, trainer, nutritionist ili admin.',
  })
  role!: UserRole;
}