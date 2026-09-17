import { inject, Injectable } from '@angular/core';
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
import { ProfessionalsService } from '../../core/services/professionals.service';
import { ProfessionalsActions } from './professionals.actions';

@Injectable()
export class ProfessionalsEffects {
  private readonly actions$ = inject(Actions);

  private readonly professionalsService =
    inject(ProfessionalsService);

  readonly loadProfessionals$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          ProfessionalsActions.loadProfessionals,
        ),

        switchMap(({ filters }) =>
          this.professionalsService
            .getAll(filters)
            .pipe(
              map((response) =>
                ProfessionalsActions
                  .loadProfessionalsSuccess({
                    response,
                  }),
              ),

              catchError(() =>
                of(
                  ProfessionalsActions
                    .loadProfessionalsFailure({
                      error:
                        'Profesionalci trenutno ne mogu da se učitaju.',
                    }),
                ),
              ),
            ),
        ),
      ),
  );
}