import { UserRole } from '../../users/enums/user-role.enum';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: UserRole;
}
