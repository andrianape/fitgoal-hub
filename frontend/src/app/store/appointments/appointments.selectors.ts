import {
  selectAppointments,
  selectCancellingId,
  selectCreateError,
  selectCreateSuccessful,
  selectCreating,
  selectError,
  selectLoading,
  selectUpdatingStatusId,
} from './appointments.reducer';

export const selectMyAppointments =
  selectAppointments;

export const selectAppointmentsLoading =
  selectLoading;

export const selectAppointmentsError =
  selectError;

export const selectIsCreatingAppointment =
  selectCreating;

export const selectWasAppointmentCreated =
  selectCreateSuccessful;

export const selectCreateAppointmentError =
  selectCreateError;

export const selectAppointmentCancellingId =
  selectCancellingId;

export const selectAppointmentUpdatingStatusId =
  selectUpdatingStatusId;