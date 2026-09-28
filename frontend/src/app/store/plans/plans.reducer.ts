import {
  createFeature,
  createReducer,
  on,
} from '@ngrx/store';
import { Plan } from '../../core/models/plan.model';
import { PlansActions } from './plans.actions';

export interface PlansState {
  plans: Plan[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  saving: boolean;
  saveSuccessful: boolean;
  saveError: string | null;
  deletingId: number | null;
}

const initialState: PlansState = {
  plans: [],
  loading: false,
  loaded: false,
  error: null,
  saving: false,
  saveSuccessful: false,
  saveError: null,
  deletingId: null,
};

export const plansFeature =
  createFeature({
    name: 'plans',

    reducer: createReducer(
      initialState,

      on(
        PlansActions.loadMyPlans,
        (state): PlansState => ({
          ...state,
          loading: true,
          error: null,
        }),
      ),

      on(
        PlansActions.loadMyPlansSuccess,
        (
          state,
          { plans },
        ): PlansState => ({
          ...state,
          plans,
          loading: false,
          loaded: true,
          error: null,
        }),
      ),

      on(
        PlansActions.loadMyPlansFailure,
        (
          state,
          { error },
        ): PlansState => ({
          ...state,
          loading: false,
          loaded: true,
          error,
        }),
      ),

      on(
        PlansActions.createPlan,
        PlansActions.updatePlan,
        (state): PlansState => ({
          ...state,
          saving: true,
          saveSuccessful: false,
          saveError: null,
        }),
      ),

      on(
        PlansActions.createPlanSuccess,
        (
          state,
          { plan },
        ): PlansState => ({
          ...state,
          plans: [
            plan,
            ...state.plans,
          ],
          saving: false,
          saveSuccessful: true,
          saveError: null,
        }),
      ),

      on(
        PlansActions.updatePlanSuccess,
        (
          state,
          { plan },
        ): PlansState => ({
          ...state,
          plans: replacePlan(
            state.plans,
            plan,
          ),
          saving: false,
          saveSuccessful: true,
          saveError: null,
        }),
      ),

      on(
        PlansActions.createPlanFailure,
        PlansActions.updatePlanFailure,
        (
          state,
          { error },
        ): PlansState => ({
          ...state,
          saving: false,
          saveSuccessful: false,
          saveError: error,
        }),
      ),

      on(
        PlansActions.deletePlan,
        (
          state,
          { planId },
        ): PlansState => ({
          ...state,
          deletingId: planId,
          error: null,
        }),
      ),

      on(
        PlansActions.deletePlanSuccess,
        (
          state,
          { planId },
        ): PlansState => ({
          ...state,
          plans: state.plans.filter(
            (plan) =>
              plan.id !== planId,
          ),
          deletingId: null,
          error: null,
        }),
      ),

      on(
        PlansActions.deletePlanFailure,
        (
          state,
          { error },
        ): PlansState => ({
          ...state,
          deletingId: null,
          error,
        }),
      ),

      on(
        PlansActions
          .clearPlanOperationState,
        (state): PlansState => ({
          ...state,
          saving: false,
          saveSuccessful: false,
          saveError: null,
        }),
      ),

      on(
        PlansActions.clearPlans,
        (): PlansState =>
          initialState,
      ),
    ),
  });

function replacePlan(
  plans: Plan[],
  updatedPlan: Plan,
): Plan[] {
  return plans.map(
    (plan) =>
      plan.id === updatedPlan.id
        ? updatedPlan
        : plan,
  );
}

export const {
  name: plansFeatureKey,
  reducer: plansReducer,
  selectPlans,
  selectLoading,
  selectLoaded,
  selectError,
  selectSaving,
  selectSaveSuccessful,
  selectSaveError,
  selectDeletingId,
} = plansFeature;