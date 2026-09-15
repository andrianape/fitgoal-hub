import {
  createActionGroup,
  emptyProps,
  props,
} from '@ngrx/store';
import { City } from '../../core/models/city.model';

export const CitiesActions = createActionGroup({
  source: 'Cities',
  events: {
    'Load Cities': emptyProps(),

    'Load Cities Success': props<{
      cities: City[];
    }>(),

    'Load Cities Failure': props<{
      error: string;
    }>(),
  },
});