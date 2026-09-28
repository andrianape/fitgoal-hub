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
          .loadAdminProfessionals,
        (state) => ({
          ...state,
          adminProfessionalsLoading:
            true,
          adminProfessionalsLoaded:
            false,
          adminProfessionalsError:
            null,
          verificationUpdateSuccessful:
            false,
          verificationUpdateError:
            null,
        }),
      ),

      on(
        ProfessionalsActions
          .loadAdminProfessionalsSuccess,
        (
          state,
          { professionals },
        ) => ({
          ...state,
          adminProfessionals:
            professionals,
          adminProfessionalsLoading:
            false,
          adminProfessionalsLoaded:
            true,
          adminProfessionalsError:
            null,
        }),
      ),

      on(
        ProfessionalsActions
          .loadAdminProfessionalsFailure,
        (
          state,
          { error },
        ) => ({
          ...state,
          adminProfessionals:
            [],
          adminProfessionalsLoading:
            false,
          adminProfessionalsLoaded:
            false,
          adminProfessionalsError:
            error,
        }),
      ),

      on(
        ProfessionalsActions
          .updateProfessionalVerification,
        (
          state,
          { professionalId },
        ) => ({
          ...state,
          verificationUpdatingId:
            professionalId,
          verificationUpdateSuccessful:
            false,
          verificationUpdateError:
            null,
        }),
      ),

      on(
        ProfessionalsActions
          .updateProfessionalVerificationSuccess,
        (
          state,
          { professional },
        ) => ({
          ...state,

          adminProfessionals:
            state.adminProfessionals.map(
              (currentProfessional) =>
                currentProfessional.id ===
                professional.id
                  ? professional
                  : currentProfessional,
            ),

          verificationUpdatingId:
            null,
          verificationUpdateSuccessful:
            true,
          verificationUpdateError:
            null,
        }),
      ),

      on(
        ProfessionalsActions
          .updateProfessionalVerificationFailure,
        (
          state,
          { error },
        ) => ({
          ...state,
          verificationUpdatingId:
            null,
          verificationUpdateSuccessful:
            false,
          verificationUpdateError:
            error,
        }),
      ),

      on(
        ProfessionalsActions
          .clearAdminProfessionals,
        (state) => ({
          ...state,
          adminProfessionals:
            [],
          adminProfessionalsLoading:
            false,
          adminProfessionalsLoaded:
            false,
          adminProfessionalsError:
            null,
          verificationUpdatingId:
            null,
          verificationUpdateSuccessful:
            false,
          verificationUpdateError:
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