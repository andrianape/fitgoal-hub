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

      'Clear Professionals': emptyProps(),
    },
  });