import { User, UserRole } from './user.model';

export interface Professional {
  id: number;
  user: User;
  biography: string;
  yearsOfExperience: number;
  pricePerSession: number;
  specialties: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalFilters {
  role?: UserRole;
  cityId?: number;
  specialty?: string;
  maxPrice?: number;
  search?: string;
  page: number;
  limit: number;
}