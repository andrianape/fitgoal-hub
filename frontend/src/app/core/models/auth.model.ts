import {
  User,
  UserRole,
} from './user.model';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  cityId: number;
  role: Exclude<UserRole, 'admin'>;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}