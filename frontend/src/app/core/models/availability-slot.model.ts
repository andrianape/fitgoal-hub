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