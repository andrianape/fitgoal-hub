import { plansFeature } from './plans.reducer';

export const {
  selectPlansState,
  selectPlans,
  selectLoading,
  selectLoaded,
  selectError,
  selectSaving,
  selectSaveSuccessful,
  selectSaveError,
  selectDeletingId,
} = plansFeature;

export const selectMyPlans =
  selectPlans;

export const selectPlansLoading =
  selectLoading;

export const selectPlansLoaded =
  selectLoaded;

export const selectPlansError =
  selectError;

export const selectIsSavingPlan =
  selectSaving;

export const selectWasPlanSaved =
  selectSaveSuccessful;

export const selectPlanSaveError =
  selectSaveError;

export const selectDeletingPlanId =
  selectDeletingId;