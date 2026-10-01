import {
  createFeature,
  createReducer,
  on,
} from '@ngrx/store';
import {
  Review,
} from '../../core/models/review.model';
import {
  ReviewsActions,
} from './reviews.actions';

export interface ReviewsState {
  reviews: Review[];
  total: number;
  averageRating: number;

  loading: boolean;
  loaded: boolean;
  error: string | null;

  creating: boolean;
  createSuccessful: boolean;
  createError: string | null;

  reviewedAppointmentIds: number[];

  updatingId: number | null;
  updateSuccessful: boolean;
  updateError: string | null;

  deletingId: number | null;
  deleteError: string | null;
}

const initialState:
  ReviewsState = {
    reviews: [],
    total: 0,
    averageRating: 0,

    loading: false,
    loaded: false,
    error: null,

    creating: false,
    createSuccessful: false,
    createError: null,

    reviewedAppointmentIds: [],

    updatingId: null,
    updateSuccessful: false,
    updateError: null,

    deletingId: null,
    deleteError: null,
  };

export const reviewsFeature =
  createFeature({
    name: 'reviews',

    reducer: createReducer(
      initialState,

      on(
        ReviewsActions
          .loadProfessionalReviews,

        (state) => ({
          ...state,
          loading: true,
          loaded: false,
          error: null,
        }),
      ),

      on(
        ReviewsActions
          .loadProfessionalReviewsSuccess,

        (
          state,
          {
            response,
          },
        ) => ({
          ...state,

          reviews:
            response.data,

          total:
            response.total,

          averageRating:
            response.averageRating,

          loading: false,
          loaded: true,
          error: null,
        }),
      ),

      on(
        ReviewsActions
          .loadProfessionalReviewsFailure,

        (
          state,
          {
            error,
          },
        ) => ({
          ...state,
          reviews: [],
          total: 0,
          averageRating: 0,
          loading: false,
          loaded: false,
          error,
        }),
      ),

      on(
        ReviewsActions.createReview,

        (state) => ({
          ...state,
          creating: true,
          createSuccessful: false,
          createError: null,
        }),
      ),

      on(
        ReviewsActions
          .createReviewSuccess,

        (
          state,
          {
            appointmentId,
          },
        ) => ({
          ...state,
          creating: false,
          createSuccessful: true,
          createError: null,

          reviewedAppointmentIds:
            state.reviewedAppointmentIds
              .includes(
                appointmentId,
              )
              ? state.reviewedAppointmentIds
              : [
                  ...state
                    .reviewedAppointmentIds,

                  appointmentId,
                ],
        }),
      ),

      on(
        ReviewsActions
          .createReviewFailure,

        (
          state,
          {
            error,
          },
        ) => ({
          ...state,
          creating: false,
          createSuccessful: false,
          createError: error,
        }),
      ),

      on(
        ReviewsActions.updateReview,

        (
          state,
          {
            reviewId,
          },
        ) => ({
          ...state,
          updatingId: reviewId,
          updateSuccessful: false,
          updateError: null,
        }),
      ),

      on(
        ReviewsActions
          .updateReviewSuccess,

        (
          state,
          {
            review,
          },
        ) => {
          const reviews =
            state.reviews.map(
              (
                currentReview,
              ) => {
                if (
                  currentReview.id ===
                  review.id
                ) {
                  return {
                    ...currentReview,
                    ...review,
                  };
                }

                return currentReview;
              },
            );

          return {
            ...state,
            reviews,
            averageRating:
              calculateAverageRating(
                reviews,
              ),
            updatingId: null,
            updateSuccessful: true,
            updateError: null,
          };
        },
      ),

      on(
        ReviewsActions
          .updateReviewFailure,

        (
          state,
          {
            error,
          },
        ) => ({
          ...state,
          updatingId: null,
          updateSuccessful: false,
          updateError: error,
        }),
      ),

      on(
        ReviewsActions.deleteReview,

        (
          state,
          {
            reviewId,
          },
        ) => ({
          ...state,
          deletingId: reviewId,
          deleteError: null,
        }),
      ),

      on(
        ReviewsActions
          .deleteReviewSuccess,

        (
          state,
          {
            reviewId,
          },
        ) => {
          const reviews =
            state.reviews.filter(
              (
                review,
              ) =>
                review.id !==
                reviewId,
            );

          return {
            ...state,
            reviews,
            total: reviews.length,
            averageRating:
              calculateAverageRating(
                reviews,
              ),
            deletingId: null,
            deleteError: null,
          };
        },
      ),

      on(
        ReviewsActions
          .deleteReviewFailure,

        (
          state,
          {
            error,
          },
        ) => ({
          ...state,
          deletingId: null,
          deleteError: error,
        }),
      ),

      on(
        ReviewsActions
          .clearReviewMutationState,

        (state) => ({
          ...state,
          creating: false,
          createSuccessful: false,
          createError: null,
          updatingId: null,
          updateSuccessful: false,
          updateError: null,
          deletingId: null,
          deleteError: null,
        }),
      ),

      on(
        ReviewsActions.clearReviews,

        () => initialState,
      ),
    ),
  });

function calculateAverageRating(
  reviews: Review[],
): number {
  if (reviews.length === 0) {
    return 0;
  }

  const ratingSum =
    reviews.reduce(
      (
        sum,
        review,
      ) =>
        sum + review.rating,

      0,
    );

  const average =
    ratingSum /
    reviews.length;

  return (
    Math.round(
      average * 10,
    ) / 10
  );
}

export const {
  name: reviewsFeatureKey,
  reducer: reviewsReducer,

  selectReviews,
  selectTotal,
  selectAverageRating,

  selectLoading,
  selectLoaded,
  selectError,

  selectCreating,
  selectCreateSuccessful,
  selectCreateError,

  selectReviewedAppointmentIds,

  selectUpdatingId,
  selectUpdateSuccessful,
  selectUpdateError,

  selectDeletingId,
  selectDeleteError,
} = reviewsFeature;