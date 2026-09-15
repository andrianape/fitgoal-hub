import {
  createFeature,
  createReducer,
  on,
} from '@ngrx/store';
import { CitiesActions } from './cities.actions';
import { initialCitiesState } from './cities.state';

export const citiesFeature = createFeature({
  name: 'cities',

  reducer: createReducer(
    initialCitiesState,

    on(
      CitiesActions.loadCities,
      (state) => ({
        ...state,
        loading: true,
        error: null,
      }),
    ),

    on(
      CitiesActions.loadCitiesSuccess,
      (state, { cities }) => ({
        ...state,
        cities,
        loading: false,
        loaded: true,
        error: null,
      }),
    ),

    on(
      CitiesActions.loadCitiesFailure,
      (state, { error }) => ({
        ...state,
        loading: false,
        loaded: false,
        error,
      }),
    ),
  ),
});