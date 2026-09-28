import { HttpErrorResponse } from '@angular/common/http';
import {
  inject,
  Injectable,
} from '@angular/core';
import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';
import {
  catchError,
  map,
  of,
  switchMap,
} from 'rxjs';
import { PlansService } from '../../core/services/plans.service';
import { AuthActions } from '../auth/auth.actions';
import { PlansActions } from './plans.actions';

@Injectable()
export class PlansEffects {
  private readonly actions$ =
    inject(Actions);

  private readonly plansService =
    inject(PlansService);

  readonly loadMyPlans$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          PlansActions.loadMyPlans,
        ),

        switchMap(() =>
          this.plansService.findMine().pipe(
            map((plans) =>
              PlansActions
                .loadMyPlansSuccess({
                  plans,
                }),
            ),

            catchError((error: unknown) =>
              of(
                PlansActions
                  .loadMyPlansFailure({
                    error:
                      this.getErrorMessage(
                        error,
                      ),
                  }),
              ),
            ),
          ),
        ),
      ),
  );

  readonly createPlan$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          PlansActions.createPlan,
        ),

        switchMap(({ data }) =>
          this.plansService.create(data).pipe(
            map((plan) =>
              PlansActions
                .createPlanSuccess({
                  plan,
                }),
            ),

            catchError((error: unknown) =>
              of(
                PlansActions
                  .createPlanFailure({
                    error:
                      this.getErrorMessage(
                        error,
                      ),
                  }),
              ),
            ),
          ),
        ),
      ),
  );

  readonly updatePlan$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          PlansActions.updatePlan,
        ),

        switchMap(
          ({
            planId,
            data,
          }) =>
            this.plansService
              .update(planId, data)
              .pipe(
                map((plan) =>
                  PlansActions
                    .updatePlanSuccess({
                      plan,
                    }),
                ),

                catchError(
                  (error: unknown) =>
                    of(
                      PlansActions
                        .updatePlanFailure({
                          error:
                            this.getErrorMessage(
                              error,
                            ),
                        }),
                    ),
                ),
              ),
        ),
      ),
  );

  readonly deletePlan$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          PlansActions.deletePlan,
        ),

        switchMap(({ planId }) =>
          this.plansService
            .remove(planId)
            .pipe(
              map(() =>
                PlansActions
                  .deletePlanSuccess({
                    planId,
                  }),
              ),

              catchError((error: unknown) =>
                of(
                  PlansActions
                    .deletePlanFailure({
                      error:
                        this.getErrorMessage(
                          error,
                        ),
                    }),
                ),
              ),
            ),
        ),
      ),
  );

  readonly clearAfterLogout$ =
    createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.logout),

        map(() =>
          PlansActions.clearPlans(),
        ),
      ),
    );

  private getErrorMessage(
    error: unknown,
  ): string {
    if (
      error instanceof HttpErrorResponse
    ) {
      const message: unknown =
        error.error?.message;

      if (typeof message === 'string') {
        return message;
      }

      if (Array.isArray(message)) {
        return message.join(' ');
      }
    }

    return 'Operaciju sa planom trenutno nije moguće izvršiti.';
  }
}