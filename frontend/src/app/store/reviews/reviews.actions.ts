import {
  createActionGroup,
  emptyProps,
  props,
} from '@ngrx/store';
import {
  CreateReviewRequest,
  ProfessionalReviewsResponse,
  Review,
  UpdateReviewRequest,
} from '../../core/models/review.model';

export const ReviewsActions =
  createActionGroup({
    source: 'Reviews',

    events: {
      'Load Professional Reviews':
        props<{
          professionalId: number;
        }>(),

      'Load Professional Reviews Success':
        props<{
          response:
            ProfessionalReviewsResponse;
        }>(),

      'Load Professional Reviews Failure':
        props<{
          error: string;
        }>(),

      'Create Review':
        props<{
          data: CreateReviewRequest;
        }>(),

      'Create Review Success':
        props<{
          review: Review;
          appointmentId: number;
        }>(),

      'Create Review Failure':
        props<{
          error: string;
        }>(),

      'Update Review':
        props<{
          reviewId: number;
          data: UpdateReviewRequest;
        }>(),

      'Update Review Success':
        props<{
          review: Review;
        }>(),

      'Update Review Failure':
        props<{
          error: string;
        }>(),

      'Delete Review':
        props<{
          reviewId: number;
        }>(),

      'Delete Review Success':
        props<{
          reviewId: number;
        }>(),

      'Delete Review Failure':
        props<{
          error: string;
        }>(),

      'Clear Reviews':
        emptyProps(),

      'Clear Review Mutation State':
        emptyProps(),
    },
  });