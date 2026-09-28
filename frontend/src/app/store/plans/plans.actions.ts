import {
  createActionGroup,
  emptyProps,
  props,
} from '@ngrx/store';
import {
  CreatePlanRequest,
  Plan,
  UpdatePlanRequest,
} from '../../core/models/plan.model';

export const PlansActions =
  createActionGroup({
    source: 'Plans',

    events: {
      'Load My Plans': emptyProps(),

      'Load My Plans Success': props<{
        plans: Plan[];
      }>(),

      'Load My Plans Failure': props<{
        error: string;
      }>(),

      'Create Plan': props<{
        data: CreatePlanRequest;
      }>(),

      'Create Plan Success': props<{
        plan: Plan;
      }>(),

      'Create Plan Failure': props<{
        error: string;
      }>(),

      'Update Plan': props<{
        planId: number;
        data: UpdatePlanRequest;
      }>(),

      'Update Plan Success': props<{
        plan: Plan;
      }>(),

      'Update Plan Failure': props<{
        error: string;
      }>(),

      'Delete Plan': props<{
        planId: number;
      }>(),

      'Delete Plan Success': props<{
        planId: number;
      }>(),

      'Delete Plan Failure': props<{
        error: string;
      }>(),

      'Clear Plan Operation State':
        emptyProps(),

      'Clear Plans': emptyProps(),
    },
  });