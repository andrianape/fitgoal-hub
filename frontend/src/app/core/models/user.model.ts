import { City } from './city.model';

export type UserRole =
  | 'client'
  | 'trainer'
  | 'nutritionist'
  | 'admin';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  profileImageUrl: string | null;
  phoneNumber: string | null;
  isActive: boolean;
  city: City | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  cityId?: number | null;
}