import { inject, Injectable } from '@angular/core';
import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';
import { catchError, exhaustMap, map, of } from 'rxjs';
import { CitiesService } from '../../core/services/cities.service';
import { CitiesActions } from './cities.actions';

@Injectable()
export class CitiesEffects {
  private readonly actions$ = inject(Actions);
  private readonly citiesService = inject(CitiesService);

  readonly loadCities$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CitiesActions.loadCities),

      exhaustMap(() =>
        this.citiesService.getAll().pipe(
          map((cities) =>
            CitiesActions.loadCitiesSuccess({
              cities,
            }),
          ),

          catchError(() =>
            of(
              CitiesActions.loadCitiesFailure({
                error:
                  'Gradovi trenutno ne mogu da se učitaju.',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}