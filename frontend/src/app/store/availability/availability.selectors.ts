import {
  selectError,
  selectLoading,
  selectSlots,
} from './availability.reducer';

export const selectAvailableSlots =
  selectSlots;

export const selectAvailableSlotsLoading =
  selectLoading;

export const selectAvailableSlotsError =
  selectError;