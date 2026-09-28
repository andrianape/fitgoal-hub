import {
  createFeature,
  createReducer,
  on,
} from '@ngrx/store';
import { Appointment } from '../../core/models/appointment.model';
import { AppointmentsActions } from './appointments.actions';

export interface AppointmentsState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  createSuccessful: boolean;
  createError: string | null;
  cancellingId: number | null;
  updatingStatusId: number | null;
}

const initialState: AppointmentsState = {
  appointments: [],
  loading: false,
  error: null,
  creating: false,
  createSuccessful: false,
  createError: null,
  cancellingId: null,
  updatingStatusId: null,
};

export const appointmentsFeature =
  createFeature({
    name: 'appointments',

    reducer: createReducer(
      initialState,

      on(
        AppointmentsActions
          .createAppointment,
        (state) => ({
          ...state,
          creating: true,
          createSuccessful: false,
          createError: null,
        }),
      ),

      on(
        AppointmentsActions
          .createAppointmentSuccess,
        (state, { appointment }) => ({
          ...state,
          appointments: [
            appointment,
            ...state.appointments,
          ],
          creating: false,
          createSuccessful: true,
          createError: null,
        }),
      ),

      on(
        AppointmentsActions
          .createAppointmentFailure,
        (state, { error }) => ({
          ...state,
          creating: false,
          createSuccessful: false,
          createError: error,
        }),
      ),

      on(
        AppointmentsActions
          .clearCreateAppointmentState,
        (state) => ({
          ...state,
          creating: false,
          createSuccessful: false,
          createError: null,
        }),
      ),

      on(
        AppointmentsActions
          .loadMyAppointments,
        (state) => ({
          ...state,
          loading: true,
          error: null,
        }),
      ),

      on(
        AppointmentsActions
          .loadMyAppointmentsSuccess,
        (state, { appointments }) => ({
          ...state,
          appointments,
          loading: false,
          error: null,
        }),
      ),

      on(
        AppointmentsActions
          .loadMyAppointmentsFailure,
        (state, { error }) => ({
          ...state,
          loading: false,
          error,
        }),
      ),

      on(
        AppointmentsActions
          .cancelAppointment,
        (state, { appointmentId }) => ({
          ...state,
          cancellingId: appointmentId,
          error: null,
        }),
      ),

      on(
        AppointmentsActions
          .cancelAppointmentSuccess,
        (state, { appointment }) => ({
          ...state,
          appointments:
            replaceAppointment(
              state.appointments,
              appointment,
            ),
          cancellingId: null,
          error: null,
        }),
      ),

      on(
        AppointmentsActions
          .cancelAppointmentFailure,
        (state, { error }) => ({
          ...state,
          cancellingId: null,
          error,
        }),
      ),

      on(
        AppointmentsActions
          .updateAppointmentStatus,
        (state, { appointmentId }) => ({
          ...state,
          updatingStatusId: appointmentId,
          error: null,
        }),
      ),

      on(
        AppointmentsActions
          .updateAppointmentStatusSuccess,
        (state, { appointment }) => ({
          ...state,
          appointments:
            replaceAppointment(
              state.appointments,
              appointment,
            ),
          updatingStatusId: null,
          error: null,
        }),
      ),

      on(
        AppointmentsActions
          .updateAppointmentStatusFailure,
        (state, { error }) => ({
          ...state,
          updatingStatusId: null,
          error,
        }),
      ),
    ),
  });

function replaceAppointment(
  appointments: Appointment[],
  updatedAppointment: Appointment,
): Appointment[] {
  return appointments.map(
    (appointment) =>
      appointment.id === updatedAppointment.id
        ? updatedAppointment
        : appointment,
  );
}

export const {
  name: appointmentsFeatureKey,
  reducer: appointmentsReducer,
  selectAppointments,
  selectLoading,
  selectError,
  selectCreating,
  selectCreateSuccessful,
  selectCreateError,
  selectCancellingId,
  selectUpdatingStatusId,
} = appointmentsFeature;