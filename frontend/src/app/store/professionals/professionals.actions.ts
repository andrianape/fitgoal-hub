import {
  createActionGroup,
  emptyProps,
  props,
} from '@ngrx/store';
import {
  CreateProfessionalProfileRequest,
  Professional,
  ProfessionalFilters,
  UpdateProfessionalProfileRequest,
} from '../../core/models/professional.model';
import {
  PaginatedResponse,
} from '../../core/models/paginated-response.model';

export const ProfessionalsActions =
  createActionGroup({
    source: 'Professionals',

    events: {
      'Load Professionals': props<{
        filters: ProfessionalFilters;
      }>(),

      'Load Professionals Success':
        props<{
          response:
            PaginatedResponse<Professional>;
        }>(),

      'Load Professionals Failure':
        props<{
          error: string;
        }>(),

      'Load Professional': props<{
        id: number;
      }>(),

      'Load Professional Success':
        props<{
          professional: Professional;
        }>(),

      'Load Professional Failure':
        props<{
          error: string;
        }>(),

      'Clear Selected Professional':
        emptyProps(),

      'Load Own Professional Profile':
        emptyProps(),

      'Load Own Professional Profile Success':
        props<{
          professional: Professional;
        }>(),

      'Load Own Professional Profile Failure':
        props<{
          error: string;
        }>(),

      'Create Professional Profile':
        props<{
          data:
            CreateProfessionalProfileRequest;
        }>(),

      'Create Professional Profile Success':
        props<{
          professional: Professional;
        }>(),

      'Create Professional Profile Failure':
        props<{
          error: string;
        }>(),

      'Update Professional Profile':
        props<{
          data:
            UpdateProfessionalProfileRequest;
        }>(),

      'Update Professional Profile Success':
        props<{
          professional: Professional;
        }>(),

      'Update Professional Profile Failure':
        props<{
          error: string;
        }>(),

      'Clear Own Professional Profile State':
        emptyProps(),

      'Clear Professionals':
        emptyProps(),
    },
  });