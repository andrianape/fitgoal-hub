import {
  createFeature,
  createReducer,
  on,
} from '@ngrx/store';
import { ProfessionalsActions } from './professionals.actions';
import { initialProfessionalsState } from './professionals.state';

export const professionalsFeature =
  createFeature({
    name: 'professionals',

    reducer: createReducer(
      initialProfessionalsState,

      on(
        ProfessionalsActions.loadProfessionals,
        (state, { filters }) => ({
          ...state,
          filters,
          loading: true,
          error: null,
        }),
      ),

      on(
        ProfessionalsActions
          .loadProfessionalsSuccess,
        (state, { response }) => ({
          ...state,
          professionals: response.data,
          total: response.total,
          totalPages: response.totalPages,
          loading: false,
          loaded: true,
          error: null,
        }),
      ),

      on(
        ProfessionalsActions
          .loadProfessionalsFailure,
        (state, { error }) => ({
          ...state,
          loading: false,
          loaded: false,
          error,
        }),
      ),

      on(
        ProfessionalsActions.loadProfessional,
        (state) => ({
          ...state,
          selectedProfessional: null,
          selectedProfessionalLoading: true,
          selectedProfessionalError: null,
        }),
      ),

      on(
        ProfessionalsActions
          .loadProfessionalSuccess,
        (state, { professional }) => ({
          ...state,
          selectedProfessional: professional,
          selectedProfessionalLoading: false,
          selectedProfessionalError: null,
        }),
      ),

      on(
        ProfessionalsActions
          .loadProfessionalFailure,
        (state, { error }) => ({
          ...state,
          selectedProfessional: null,
          selectedProfessionalLoading: false,
          selectedProfessionalError: error,
        }),
      ),

      on(
        ProfessionalsActions
          .clearSelectedProfessional,
        (state) => ({
          ...state,
          selectedProfessional: null,
          selectedProfessionalLoading: false,
          selectedProfessionalError: null,
        }),
      ),

      on(
        ProfessionalsActions.clearProfessionals,
        () => initialProfessionalsState,
      ),
    ),
  });