import {
  AvailabilitySlot,
} from './availability-slot.model';
import {
  Professional,
} from './professional.model';
import {
  Review,
} from './review.model';
import {
  User,
} from './user.model';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export interface Appointment {
  id: number;

  client: User;

  professional: Professional;

  slot: AvailabilitySlot;

  review: Review | null;

  status: AppointmentStatus;

  priceAtBooking: number;

  clientNote: string | null;

  professionalNote: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface CreateAppointmentRequest {
  slotId: number;

  clientNote?: string;
}

export interface UpdateAppointmentStatusRequest {
  status:
    | 'confirmed'
    | 'rejected'
    | 'completed';

  professionalNote?: string;
}