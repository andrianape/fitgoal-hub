import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AvailabilitySlot } from '../../core/models/availability-slot.model';

export const AvailabilityActions =
  createActionGroup({
    source: 'Availability',
    events: {
      'Load Available Slots': props<{
        professionalId: number;
      }>(),

      'Load Available Slots Success': props<{
        slots: AvailabilitySlot[];
      }>(),

      'Load Available Slots Failure': props<{
        error: string;
      }>(),

      'Clear Available Slots': emptyProps(),
    },
  });