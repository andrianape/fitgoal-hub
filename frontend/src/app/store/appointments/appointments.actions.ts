import {
  createActionGroup,
  emptyProps,
  props,
} from '@ngrx/store';
import {
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentStatusRequest,
} from '../../core/models/appointment.model';

export const AppointmentsActions =
  createActionGroup({
    source: 'Appointments',

    events: {
      'Create Appointment': props<{
        data: CreateAppointmentRequest;
      }>(),

      'Create Appointment Success': props<{
        appointment: Appointment;
      }>(),

      'Create Appointment Failure': props<{
        error: string;
      }>(),

      'Clear Create Appointment State':
        emptyProps(),

      'Load My Appointments': emptyProps(),

      'Load My Appointments Success': props<{
        appointments: Appointment[];
      }>(),

      'Load My Appointments Failure': props<{
        error: string;
      }>(),

      'Cancel Appointment': props<{
        appointmentId: number;
      }>(),

      'Cancel Appointment Success': props<{
        appointment: Appointment;
      }>(),

      'Cancel Appointment Failure': props<{
        error: string;
      }>(),

      'Update Appointment Status': props<{
        appointmentId: number;
        data: UpdateAppointmentStatusRequest;
      }>(),

      'Update Appointment Status Success':
        props<{
          appointment: Appointment;
        }>(),

      'Update Appointment Status Failure':
        props<{
          error: string;
        }>(),
    },
  });