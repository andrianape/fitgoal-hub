import {
  Professional,
} from './professional.model';

export interface AvailabilitySlot {
  id: number;
  startsAt: string;
  endsAt: string;
  isBooked: boolean;
  createdAt: string;
}

export interface CreateAvailabilitySlotRequest {
  startsAt: string;
  endsAt: string;
}

export interface AvailableSlotByDate
  extends AvailabilitySlot
{
  professional: Professional;
}

export type AvailabilityRoleFilter =
  | 'trainer'
  | 'nutritionist';