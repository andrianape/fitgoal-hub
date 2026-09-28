import {
  HttpErrorResponse,
} from '@angular/common/http';
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
  of,
  switchMap,
} from 'rxjs';
import {
  AvailabilityService,
} from '../../core/services/availability.service';
import {
  AvailabilityActions,
} from './availability.actions';

@Injectable()
export class AvailabilityEffects {
  private readonly actions$ =
    inject(Actions);

  private readonly availabilityService =
    inject(AvailabilityService);

  readonly loadAvailableSlots$ =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(
          AvailabilityActions
            .loadAvailableSlots,
        ),

        switchMap(({ professionalId }) => {
          return this.availabilityService
            .getAvailableByProfessional(
              professionalId,
            )
            .pipe(
              map((slots) => {
                return AvailabilityActions
                  .loadAvailableSlotsSuccess({
                    slots,
                  });
              }),

              catchError((error: unknown) => {
                return of(
                  AvailabilityActions
                    .loadAvailableSlotsFailure({
                      error:
                        this.getErrorMessage(
                          error,
                          'Slobodni termini trenutno nisu dostupni.',
                        ),
                    }),
                );
              }),
            );
        }),
      );
    });

  readonly loadMySlots$ =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(
          AvailabilityActions.loadMySlots,
        ),

        switchMap(() => {
          return this.availabilityService
            .getMine()
            .pipe(
              map((slots) => {
                return AvailabilityActions
                  .loadMySlotsSuccess({
                    slots,
                  });
              }),

              catchError((error: unknown) => {
                return of(
                  AvailabilityActions
                    .loadMySlotsFailure({
                      error:
                        this.getErrorMessage(
                          error,
                          'Tvoje termine trenutno nije moguće učitati.',
                        ),
                    }),
                );
              }),
            );
        }),
      );
    });

  readonly createSlot$ =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(
          AvailabilityActions.createSlot,
        ),

        switchMap(({ data }) => {
          return this.availabilityService
            .create(data)
            .pipe(
              map((slot) => {
                return AvailabilityActions
                  .createSlotSuccess({
                    slot,
                  });
              }),

              catchError((error: unknown) => {
                return of(
                  AvailabilityActions
                    .createSlotFailure({
                      error:
                        this.getErrorMessage(
                          error,
                          'Termin trenutno nije moguće napraviti.',
                        ),
                    }),
                );
              }),
            );
        }),
      );
    });

  readonly deleteSlot$ =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(
          AvailabilityActions.deleteSlot,
        ),

        switchMap(({ slotId }) => {
          return this.availabilityService
            .remove(slotId)
            .pipe(
              map(() => {
                return AvailabilityActions
                  .deleteSlotSuccess({
                    slotId,
                  });
              }),

              catchError((error: unknown) => {
                return of(
                  AvailabilityActions
                    .deleteSlotFailure({
                      error:
                        this.getErrorMessage(
                          error,
                          'Termin trenutno nije moguće obrisati.',
                        ),
                    }),
                );
              }),
            );
        }),
      );
    });

  private getErrorMessage(
    error: unknown,
    fallbackMessage: string,
  ): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.message;

      if (typeof message === 'string') {
        return message;
      }

      if (Array.isArray(message)) {
        return message.join(' ');
      }
    }

    return fallbackMessage;
  }
}