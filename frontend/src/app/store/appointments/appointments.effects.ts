import { HttpErrorResponse } from '@angular/common/http';
import {
  inject,
  Injectable,
} from '@angular/core';
import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';
import {
  catchError,
  map,
  mergeMap,
  of,
  switchMap,
} from 'rxjs';
import { AppointmentsService } from '../../core/services/appointments.service';
import { AvailabilityActions } from '../availability/availability.actions';
import { AppointmentsActions } from './appointments.actions';

@Injectable()
export class AppointmentsEffects {
  private readonly actions$ = inject(Actions);

  private readonly appointmentsService =
    inject(AppointmentsService);

  readonly createAppointment$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          AppointmentsActions
            .createAppointment,
        ),

        switchMap(({ data }) =>
          this.appointmentsService
            .create(data)
            .pipe(
              mergeMap((appointment) => [
                AppointmentsActions
                  .createAppointmentSuccess({
                    appointment,
                  }),

                AvailabilityActions
                  .loadAvailableSlots({
                    professionalId:
                      appointment.professional.id,
                  }),
              ]),

              catchError((error: unknown) =>
                of(
                  AppointmentsActions
                    .createAppointmentFailure({
                      error:
                        this.getErrorMessage(error),
                    }),
                ),
              ),
            ),
        ),
      ),
  );

  readonly loadMyAppointments$ =
    createEffect(() =>
      this.actions$.pipe(
        ofType(
          AppointmentsActions
            .loadMyAppointments,
        ),

        switchMap(() =>
          this.appointmentsService
            .findMine()
            .pipe(
              map((appointments) =>
                AppointmentsActions
                  .loadMyAppointmentsSuccess({
                    appointments,
                  }),
              ),

              catchError((error: unknown) =>
                of(
                  AppointmentsActions
                    .loadMyAppointmentsFailure({
                      error:
                        this.getErrorMessage(error),
                    }),
                ),
              ),
            ),
        ),
      ),
    );

  readonly cancelAppointment$ =
    createEffect(() =>
      this.actions$.pipe(
        ofType(
          AppointmentsActions
            .cancelAppointment,
        ),

        switchMap(({ appointmentId }) =>
          this.appointmentsService
            .cancel(appointmentId)
            .pipe(
              map((appointment) =>
                AppointmentsActions
                  .cancelAppointmentSuccess({
                    appointment,
                  }),
              ),

              catchError((error: unknown) =>
                of(
                  AppointmentsActions
                    .cancelAppointmentFailure({
                      error:
                        this.getErrorMessage(error),
                    }),
                ),
              ),
            ),
        ),
      ),
    );

  readonly updateAppointmentStatus$ =
    createEffect(() =>
      this.actions$.pipe(
        ofType(
          AppointmentsActions
            .updateAppointmentStatus,
        ),

        switchMap(
          ({
            appointmentId,
            data,
          }) =>
            this.appointmentsService
              .updateStatus(
                appointmentId,
                data,
              )
              .pipe(
                map((appointment) =>
                  AppointmentsActions
                    .updateAppointmentStatusSuccess({
                      appointment,
                    }),
                ),

                catchError((error: unknown) =>
                  of(
                    AppointmentsActions
                      .updateAppointmentStatusFailure({
                        error:
                          this.getErrorMessage(
                            error,
                          ),
                      }),
                  ),
                ),
              ),
        ),
      ),
    );

  private getErrorMessage(
    error: unknown,
  ): string {
    if (error instanceof HttpErrorResponse) {
      const message: unknown =
        error.error?.message;

      if (typeof message === 'string') {
        return message;
      }

      if (Array.isArray(message)) {
        return message.join(' ');
      }
    }

    return 'Operaciju trenutno nije moguće izvršiti.';
  }
}