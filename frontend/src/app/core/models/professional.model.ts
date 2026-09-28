import {
  User,
  UserRole,
} from './user.model';

export interface Professional {
  id: number;
  user: User;

  biography: string;
  yearsOfExperience: number;
  pricePerSession: number;
  specialties: string[];

  workplaceName: string | null;
  address: string | null;

  qualificationType:
    string | null;

  qualificationName:
    string | null;

  issuingInstitution:
    string | null;

  qualificationYear:
    number | null;

  credentialNumber?:
    string | null;

  isVerified: boolean;

  verificationNote?:
    string | null;

  verifiedAt:
    string | null;

  verifiedBy?:
    User | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateProfessionalProfileRequest {
  biography: string;
  yearsOfExperience: number;
  pricePerSession: number;
  specialties: string[];

  workplaceName?: string;
  address: string;

  qualificationType: string;
  qualificationName: string;
  issuingInstitution: string;
  qualificationYear: number;
  credentialNumber: string;
}

export interface UpdateProfessionalProfileRequest {
  biography?: string;
  yearsOfExperience?: number;
  pricePerSession?: number;
  specialties?: string[];

  workplaceName?: string;
  address?: string;

  qualificationType?: string;
  qualificationName?: string;
  issuingInstitution?: string;
  qualificationYear?: number;
  credentialNumber?: string;
}

export interface UpdateProfessionalVerificationRequest {
  isVerified: boolean;
  verificationNote?: string;
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