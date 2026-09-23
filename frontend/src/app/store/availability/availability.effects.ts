import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { AvailabilityService } from '../../core/services/availability.service';
import { AvailabilityActions } from './availability.actions';

@Injectable()
export class AvailabilityEffects {
  private readonly actions$ = inject(Actions);

  private readonly availabilityService =
    inject(AvailabilityService);

  readonly loadAvailableSlots$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(
          AvailabilityActions.loadAvailableSlots,
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
                console.error(
                  'Greška pri učitavanju termina:',
                  error,
                );

                return of(
                  AvailabilityActions
                    .loadAvailableSlotsFailure({
                      error:
                        'Slobodni termini trenutno nisu dostupni.',
                    }),
                );
              }),
            );
        }),
      );
    },
  );
}