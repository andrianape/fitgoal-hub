import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  catchError,
  exhaustMap,
  map,
  mergeMap,
  of,
  switchMap,
} from 'rxjs';
import { ReviewsService } from '../../core/services/reviews.service';
import { AppointmentsActions } from '../appointments/appointments.actions';
import { ReviewsActions } from './reviews.actions';

@Injectable()
export class ReviewsEffects {
  private readonly actions$ = inject(Actions);
  private readonly reviewsService = inject(ReviewsService);

  readonly loadProfessionalReviews$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ReviewsActions.loadProfessionalReviews),
      switchMap(({ professionalId }) => {
        return this.reviewsService
          .getByProfessional(professionalId)
          .pipe(
            map((response) =>
              ReviewsActions.loadProfessionalReviewsSuccess({
                response,
              }),
            ),
            catchError((error: unknown) =>
              of(
                ReviewsActions.loadProfessionalReviewsFailure({
                  error: this.getErrorMessage(
                    error,
                    'Ocenu trenutno nije moguće učitati.',
                  ),
                }),
              ),
            ),
          );
      }),
    );
  });

  readonly createReview$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ReviewsActions.createReview),
      exhaustMap(({ data }) => {
        return this.reviewsService.create(data).pipe(
          map((review) =>
            ReviewsActions.createReviewSuccess({
              review,
              appointmentId: data.appointmentId,
            }),
          ),
          catchError((error: unknown) =>
            of(
              ReviewsActions.createReviewFailure({
                error: this.getErrorMessage(
                  error,
                  'Ocenu trenutno nije moguće sačuvati.',
                ),
              }),
            ),
          ),
        );
      }),
    );
  });

  readonly updateReview$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ReviewsActions.updateReview),
      exhaustMap(({ reviewId, data }) => {
        return this.reviewsService.update(reviewId, data).pipe(
          map((review) =>
            ReviewsActions.updateReviewSuccess({
              review,
            }),
          ),
          catchError((error: unknown) =>
            of(
              ReviewsActions.updateReviewFailure({
                error: this.getErrorMessage(
                  error,
                  'Ocenu trenutno nije moguće izmeniti.',
                ),
              }),
            ),
          ),
        );
      }),
    );
  });

  readonly deleteReview$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ReviewsActions.deleteReview),
      mergeMap(({ reviewId }) => {
        return this.reviewsService.remove(reviewId).pipe(
          map(() =>
            ReviewsActions.deleteReviewSuccess({
              reviewId,
            }),
          ),
          catchError((error: unknown) =>
            of(
              ReviewsActions.deleteReviewFailure({
                error: this.getErrorMessage(
                  error,
                  'Ocenu trenutno nije moguće obrisati.',
                ),
              }),
            ),
          ),
        );
      }),
    );
  });

  readonly reloadAppointmentsAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        ReviewsActions.updateReviewSuccess,
        ReviewsActions.deleteReviewSuccess,
      ),
      map(() => AppointmentsActions.loadMyAppointments()),
    ),
  );

  private getErrorMessage(
    error: unknown,
    fallbackMessage: string,
  ): string {
    if (error instanceof HttpErrorResponse) {
      const message: unknown = error.error?.message;

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