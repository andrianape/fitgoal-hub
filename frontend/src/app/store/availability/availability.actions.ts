import {
  createActionGroup,
  emptyProps,
  props,
} from '@ngrx/store';
import {
  AvailabilitySlot,
  CreateAvailabilitySlotRequest,
} from '../../core/models/availability-slot.model';

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

      'Load My Slots': emptyProps(),

      'Load My Slots Success': props<{
        slots: AvailabilitySlot[];
      }>(),

      'Load My Slots Failure': props<{
        error: string;
      }>(),

      'Create Slot': props<{
        data: CreateAvailabilitySlotRequest;
      }>(),

      'Create Slot Success': props<{
        slot: AvailabilitySlot;
      }>(),

      'Create Slot Failure': props<{
        error: string;
      }>(),

      'Delete Slot': props<{
        slotId: number;
      }>(),

      'Delete Slot Success': props<{
        slotId: number;
      }>(),

      'Delete Slot Failure': props<{
        error: string;
      }>(),

      'Clear Slot Mutation State':
        emptyProps(),
    },
  });