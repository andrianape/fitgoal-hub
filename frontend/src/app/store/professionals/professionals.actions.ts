import {
  createActionGroup,
  emptyProps,
  props,
} from '@ngrx/store';
import {
  Professional,
  ProfessionalFilters,
} from '../../core/models/professional.model';
import { PaginatedResponse } from '../../core/models/paginated-response.model';

export const ProfessionalsActions =
  createActionGroup({
    source: 'Professionals',

    events: {
      'Load Professionals': props<{
        filters: ProfessionalFilters;
      }>(),

      'Load Professionals Success': props<{
        response:
          PaginatedResponse<Professional>;
      }>(),

      'Load Professionals Failure': props<{
        error: string;
      }>(),

      'Load Professional': props<{
        id: number;
      }>(),

      'Load Professional Success': props<{
        professional: Professional;
      }>(),

      'Load Professional Failure': props<{
        error: string;
      }>(),

      'Clear Selected Professional':
        emptyProps(),

      'Clear Professionals': emptyProps(),
    },
  });