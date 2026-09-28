import {
  selectCreateError,
  selectCreateSuccessful,
  selectCreating,
  selectDeleteError,
  selectDeletingId,
  selectError,
  selectLoading,
  selectMySlots,
  selectMySlotsError,
  selectMySlotsLoading,
  selectSlots,
} from './availability.reducer';

export const selectAvailableSlots =
  selectSlots;

export const selectAvailableSlotsLoading =
  selectLoading;

export const selectAvailableSlotsError =
  selectError;

export const selectProfessionalOwnSlots =
  selectMySlots;

export const selectProfessionalOwnSlotsLoading =
  selectMySlotsLoading;

export const selectProfessionalOwnSlotsError =
  selectMySlotsError;

export const selectIsCreatingSlot =
  selectCreating;

export const selectWasSlotCreated =
  selectCreateSuccessful;

export const selectCreateSlotError =
  selectCreateError;

export const selectSlotDeletingId =
  selectDeletingId;

export const selectDeleteSlotError =
  selectDeleteError;