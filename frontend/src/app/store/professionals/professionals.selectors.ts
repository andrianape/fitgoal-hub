import {
  professionalsFeature,
} from './professionals.reducer';

export const {
  selectProfessionalsState,

  selectProfessionals,
  selectFilters,
  selectTotal,
  selectTotalPages,
  selectLoading,
  selectLoaded,
  selectError,

  selectSelectedProfessional,
  selectSelectedProfessionalLoading,
  selectSelectedProfessionalError,

  selectOwnProfessionalProfile,
  selectOwnProfessionalProfileLoading,
  selectOwnProfessionalProfileLoaded,
  selectOwnProfessionalProfileError,

  selectProfessionalProfileSaving,
  selectProfessionalProfileSaveSuccessful,
  selectProfessionalProfileSaveError,

  selectAdminProfessionals,
  selectAdminProfessionalsLoading,
  selectAdminProfessionalsLoaded,
  selectAdminProfessionalsError,

  selectVerificationUpdatingId,
  selectVerificationUpdateSuccessful,
  selectVerificationUpdateError,
} = professionalsFeature;