import {
  createFeature,
  createReducer,
  on,
} from '@ngrx/store';
import {
  ProfessionalsActions,
} from './professionals.actions';
import {
  initialProfessionalsState,
} from './professionals.state';

export const professionalsFeature =
  createFeature({
    name: 'professionals',

    reducer: createReducer(
      initialProfessionalsState,

      on(
        ProfessionalsActions
          .loadProfessionals,
        (
          state,
          { filters },
        ) => ({
          ...state,
          filters,
          loading: true,
          error: null,
        }),
      ),

      on(
        ProfessionalsActions
          .loadProfessionalsSuccess,
        (
          state,
          { response },
        ) => ({
          ...state,
          professionals:
            response.data,
          total:
            response.total,
          totalPages:
            response.totalPages,
          loading: false,
          loaded: true,
          error: null,
        }),
      ),

      on(
        ProfessionalsActions
          .loadProfessionalsFailure,
        (
          state,
          { error },
        ) => ({
          ...state,
          loading: false,
          loaded: false,
          error,
        }),
      ),

      on(
        ProfessionalsActions
          .loadProfessional,
        (state) => ({
          ...state,
          selectedProfessional:
            null,
          selectedProfessionalLoading:
            true,
          selectedProfessionalError:
            null,
        }),
      ),

      on(
        ProfessionalsActions
          .loadProfessionalSuccess,
        (
          state,
          { professional },
        ) => ({
          ...state,
          selectedProfessional:
            professional,
          selectedProfessionalLoading:
            false,
          selectedProfessionalError:
            null,
        }),
      ),

      on(
        ProfessionalsActions
          .loadProfessionalFailure,
        (
          state,
          { error },
        ) => ({
          ...state,
          selectedProfessional:
            null,
          selectedProfessionalLoading:
            false,
          selectedProfessionalError:
            error,
        }),
      ),

      on(
        ProfessionalsActions
          .clearSelectedProfessional,
        (state) => ({
          ...state,
          selectedProfessional:
            null,
          selectedProfessionalLoading:
            false,
          selectedProfessionalError:
            null,
        }),
      ),

      on(
        ProfessionalsActions
          .loadOwnProfessionalProfile,
        (state) => ({
          ...state,
          ownProfessionalProfileLoading:
            true,
          ownProfessionalProfileLoaded:
            false,
          ownProfessionalProfileError:
            null,
        }),
      ),

      on(
        ProfessionalsActions
          .loadOwnProfessionalProfileSuccess,
        (
          state,
          { professional },
        ) => ({
          ...state,
          ownProfessionalProfile:
            professional,
          ownProfessionalProfileLoading:
            false,
          ownProfessionalProfileLoaded:
            true,
          ownProfessionalProfileError:
            null,
        }),
      ),

      on(
        ProfessionalsActions
          .loadOwnProfessionalProfileFailure,
        (
          state,
          { error },
        ) => ({
          ...state,
          ownProfessionalProfile:
            null,
          ownProfessionalProfileLoading:
            false,
          ownProfessionalProfileLoaded:
            true,
          ownProfessionalProfileError:
            error || null,
        }),
      ),

      on(
        ProfessionalsActions
          .createProfessionalProfile,
        ProfessionalsActions
          .updateProfessionalProfile,
        (state) => ({
          ...state,
          professionalProfileSaving:
            true,
          professionalProfileSaveSuccessful:
            false,
          professionalProfileSaveError:
            null,
        }),
      ),

      on(
        ProfessionalsActions
          .createProfessionalProfileSuccess,
        ProfessionalsActions
          .updateProfessionalProfileSuccess,
        (
          state,
          { professional },
        ) => ({
          ...state,
          ownProfessionalProfile:
            professional,
          ownProfessionalProfileLoading:
            false,
          ownProfessionalProfileLoaded:
            true,
          ownProfessionalProfileError:
            null,
          professionalProfileSaving:
            false,
          professionalProfileSaveSuccessful:
            true,
          professionalProfileSaveError:
            null,
        }),
      ),

      on(
        ProfessionalsActions
          .createProfessionalProfileFailure,
        ProfessionalsActions
          .updateProfessionalProfileFailure,
        (
          state,
          { error },
        ) => ({
          ...state,
          professionalProfileSaving:
            false,
          professionalProfileSaveSuccessful:
            false,
          professionalProfileSaveError:
            error,
        }),
      ),

      on(
        ProfessionalsActions
          .clearOwnProfessionalProfileState,
        (state) => ({
          ...state,
          ownProfessionalProfile:
            null,
          ownProfessionalProfileLoading:
            false,
          ownProfessionalProfileLoaded:
            false,
          ownProfessionalProfileError:
            null,
          professionalProfileSaving:
            false,
          professionalProfileSaveSuccessful:
            false,
          professionalProfileSaveError:
            null,
        }),
      ),

      on(
        ProfessionalsActions
          .clearProfessionals,
        () =>
          initialProfessionalsState,
      ),
    ),
  });