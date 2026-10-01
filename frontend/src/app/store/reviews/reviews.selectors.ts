import {
  createSelector,
} from '@ngrx/store';
import {
  reviewsFeature,
} from './reviews.reducer';

export const {
  selectReviewsState,
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

export const selectProfessionalReviews =
  selectReviews;

export const selectProfessionalReviewsTotal =
  selectTotal;

export const selectProfessionalAverageRating =
  selectAverageRating;

export const selectProfessionalReviewsLoading =
  selectLoading;

export const selectProfessionalReviewsLoaded =
  selectLoaded;

export const selectProfessionalReviewsError =
  selectError;

export const selectIsCreatingReview =
  selectCreating;

export const selectWasReviewCreated =
  selectCreateSuccessful;

export const selectCreateReviewError =
  selectCreateError;

export const selectReviewUpdatingId =
  selectUpdatingId;

export const selectWasReviewUpdated =
  selectUpdateSuccessful;

export const selectUpdateReviewError =
  selectUpdateError;

export const selectReviewDeletingId =
  selectDeletingId;

export const selectDeleteReviewError =
  selectDeleteError;

export const selectHasReviewedAppointment =
  (
    appointmentId: number,
  ) =>
    createSelector(
      selectReviewedAppointmentIds,

      (
        reviewedAppointmentIds,
      ) =>
        reviewedAppointmentIds.includes(
          appointmentId,
        ),
    );