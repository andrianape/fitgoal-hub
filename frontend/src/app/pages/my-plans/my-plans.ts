import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';
import { Store } from '@ngrx/store';
import {
  NutritionPlanDay,
  Plan,
} from '../../core/models/plan.model';
import { AppointmentsActions } from '../../store/appointments/appointments.actions';
import {
  selectAppointmentsLoading,
  selectMyAppointments,
} from '../../store/appointments/appointments.selectors';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { PlansActions } from '../../store/plans/plans.actions';
import {
  selectDeletingPlanId,
  selectIsSavingPlan,
  selectMyPlans,
  selectPlansError,
  selectPlansLoading,
  selectPlanSaveError,
  selectWasPlanSaved,
} from '../../store/plans/plans.selectors';

type PlanFilter =
  | 'active'
  | 'inactive'
  | 'all';

@Component({
  selector: 'app-my-plans',
  imports: [
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './my-plans.html',
  styleUrl: './my-plans.scss',
})
export class MyPlans implements OnInit {
  private readonly store = inject(Store);

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  protected readonly currentUser =
    this.store.selectSignal(
      selectCurrentUser,
    );

  protected readonly plans =
    this.store.selectSignal(
      selectMyPlans,
    );

  protected readonly loading =
    this.store.selectSignal(
      selectPlansLoading,
    );

  protected readonly error =
    this.store.selectSignal(
      selectPlansError,
    );

  protected readonly deletingId =
    this.store.selectSignal(
      selectDeletingPlanId,
    );

  protected readonly appointments =
    this.store.selectSignal(
      selectMyAppointments,
    );

  protected readonly appointmentsLoading =
    this.store.selectSignal(
      selectAppointmentsLoading,
    );

  protected readonly saving =
    this.store.selectSignal(
      selectIsSavingPlan,
    );

  protected readonly saveSuccessful =
    this.store.selectSignal(
      selectWasPlanSaved,
    );

  protected readonly saveError =
    this.store.selectSignal(
      selectPlanSaveError,
    );

  protected readonly selectedFilter =
    signal<PlanFilter>('active');

  protected readonly expandedPlanId =
    signal<number | null>(null);

  protected readonly createModalOpen =
    signal(false);

  private readonly requestedClientId =
    signal<number | null>(null);

  protected readonly isNutritionist =
    computed(() => {
      return (
        this.currentUser()?.role ===
        'nutritionist'
      );
    });

  protected readonly eligibleClients =
    computed(() => {
      const uniqueClients = new Map<
        number,
        Plan['client']
      >();

      for (
        const appointment of
        this.appointments()
      ) {
        if (
          appointment.status ===
          'completed'
        ) {
          uniqueClients.set(
            appointment.client.id,
            appointment.client,
          );
        }
      }

      return Array.from(
        uniqueClients.values(),
      );
    });

  protected readonly filteredPlans =
    computed(() => {
      const filter =
        this.selectedFilter();

      if (filter === 'all') {
        return this.plans();
      }

      return this.plans().filter(
        (plan) =>
          filter === 'active'
            ? plan.isActive
            : !plan.isActive,
      );
    });

  protected readonly planForm =
    this.formBuilder.group({
      clientId:
        this.formBuilder.nonNullable.control(
          0,
          [
            Validators.required,
            Validators.min(1),
          ],
        ),

      title:
        this.formBuilder.nonNullable.control(
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(200),
          ],
        ),

      description:
        this.formBuilder.nonNullable.control(
          '',
          [
            Validators.maxLength(2000),
          ],
        ),

      startDate:
        this.formBuilder.nonNullable.control(
          '',
          [
            Validators.required,
          ],
        ),

      endDate:
        this.formBuilder.nonNullable.control(
          '',
        ),

      generalInstructions:
        this.formBuilder.nonNullable.control(
          '',
          [
            Validators.required,
          ],
        ),

      dailyWaterIntake:
        this.formBuilder.nonNullable.control(
          '',
          [
            Validators.required,
          ],
        ),

      days: this.formBuilder.array([
        this.createDayGroup(),
      ]),
    });

  protected get days(): FormArray {
    return this.planForm.controls.days;
  }

  private readonly openRequestedClientForm =
    effect(() => {
      const clientId =
        this.requestedClientId();

      if (
        clientId === null ||
        this.appointmentsLoading()
      ) {
        return;
      }

      const clientExists =
        this.eligibleClients().some(
          (client) =>
            client.id === clientId,
        );

      if (
        clientExists &&
        this.isNutritionist()
      ) {
        this.openCreateModal(clientId);
      }

      this.requestedClientId.set(null);

      void this.router.navigate(
        [],
        {
          relativeTo: this.route,

          queryParams: {
            clientId: null,
          },

          queryParamsHandling: 'merge',
          replaceUrl: true,
        },
      );
    });

  ngOnInit(): void {
    this.loadPlans();

    if (this.isNutritionist()) {
      const clientId = Number(
        this.route.snapshot.queryParamMap
          .get('clientId'),
      );

      if (
        Number.isInteger(clientId) &&
        clientId > 0
      ) {
        this.requestedClientId.set(
          clientId,
        );
      }

      this.store.dispatch(
        AppointmentsActions
          .loadMyAppointments(),
      );
    }
  }

  protected loadPlans(): void {
    this.store.dispatch(
      PlansActions.loadMyPlans(),
    );
  }

  protected selectFilter(
    filter: PlanFilter,
  ): void {
    this.selectedFilter.set(filter);
  }

  protected togglePlan(
    planId: number,
  ): void {
    this.expandedPlanId.update(
      (currentId) =>
        currentId === planId
          ? null
          : planId,
    );
  }

  protected isExpanded(
    planId: number,
  ): boolean {
    return (
      this.expandedPlanId() === planId
    );
  }

  protected openCreateModal(
    clientId = 0,
  ): void {
    this.resetPlanForm();

    if (clientId > 0) {
      this.planForm.controls.clientId
        .setValue(clientId);
    }

    this.store.dispatch(
      PlansActions
        .clearPlanOperationState(),
    );

    this.createModalOpen.set(true);
  }

  protected closeCreateModal(): void {
    if (this.saving()) {
      return;
    }

    this.createModalOpen.set(false);

    this.store.dispatch(
      PlansActions
        .clearPlanOperationState(),
    );
  }

  protected addDay(): void {
    this.days.push(
      this.createDayGroup(),
    );
  }

  protected removeDay(
    dayIndex: number,
  ): void {
    if (this.days.length === 1) {
      return;
    }

    this.days.removeAt(dayIndex);
  }

  protected getMeals(
    dayIndex: number,
  ): FormArray {
    return this.days
      .at(dayIndex)
      .get('meals') as FormArray;
  }

  protected addMeal(
    dayIndex: number,
  ): void {
    this.getMeals(dayIndex).push(
      this.createMealGroup(),
    );
  }

  protected removeMeal(
    dayIndex: number,
    mealIndex: number,
  ): void {
    const meals =
      this.getMeals(dayIndex);

    if (meals.length === 1) {
      return;
    }

    meals.removeAt(mealIndex);
  }

  protected submitPlan(): void {
    this.planForm.markAllAsTouched();

    if (this.planForm.invalid) {
      return;
    }

    const value =
      this.planForm.getRawValue();

    if (
      value.endDate &&
      value.endDate < value.startDate
    ) {
      this.planForm.controls.endDate
        .setErrors({
          endBeforeStart: true,
        });

      return;
    }

    this.store.dispatch(
      PlansActions.createPlan({
        data: {
          clientId: value.clientId,
          title: value.title.trim(),

          ...(value.description.trim()
            ? {
                description:
                  value.description.trim(),
              }
            : {}),

          content: {
            generalInstructions:
              value.generalInstructions
                .trim(),

            dailyWaterIntake:
              value.dailyWaterIntake
                .trim(),

            days: value.days.map(
              (day) => ({
                day: day.day.trim(),

                meals: day.meals.map(
                  (meal) => ({
                    name:
                      meal.name.trim(),

                    time:
                      meal.time.trim(),

                    description:
                      meal.description
                        .trim(),
                  }),
                ),
              }),
            ),
          },

          startDate: value.startDate,

          ...(value.endDate
            ? {
                endDate: value.endDate,
              }
            : {}),
        },
      }),
    );
  }

  protected hasControlError(
    controlName:
      | 'clientId'
      | 'title'
      | 'startDate'
      | 'endDate'
      | 'generalInstructions'
      | 'dailyWaterIntake',
    errorName: string,
  ): boolean {
    const control =
      this.planForm.controls[
        controlName
      ];

    return (
      control.touched &&
      control.hasError(errorName)
    );
  }

  protected deletePlan(
    plan: Plan,
  ): void {
    const confirmed = window.confirm(
      `Da li sigurno želiš da obrišeš plan „${plan.title}“?`,
    );

    if (!confirmed) {
      return;
    }

    this.store.dispatch(
      PlansActions.deletePlan({
        planId: plan.id,
      }),
    );
  }

  protected getPlanDays(
    plan: Plan,
  ): NutritionPlanDay[] {
    if (
      !plan.content ||
      !Array.isArray(
        plan.content.days,
      )
    ) {
      return [];
    }

    return plan.content.days;
  }

  protected formatDate(
    value: string | null,
  ): string {
    if (!value) {
      return 'Nije određeno';
    }

    return new Intl.DateTimeFormat(
      'sr-Latn-RS',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      },
    ).format(
      new Date(
        `${value}T00:00:00`,
      ),
    );
  }

  protected getProfileImageUrl(
    profileImageUrl: string | null,
  ): string | null {
    if (!profileImageUrl) {
      return null;
    }

    if (
      profileImageUrl.startsWith('http')
    ) {
      return profileImageUrl;
    }

    return (
      'http://localhost:3000' +
      profileImageUrl
    );
  }

  protected getInitials(
    firstName: string,
    lastName: string,
  ): string {
    return (
      firstName.charAt(0) +
      lastName.charAt(0)
    ).toUpperCase();
  }

  private createDayGroup() {
    return this.formBuilder.group({
      day:
        this.formBuilder.nonNullable.control(
          '',
          [
            Validators.required,
          ],
        ),

      meals: this.formBuilder.array([
        this.createMealGroup(),
      ]),
    });
  }

  private createMealGroup() {
    return this.formBuilder.group({
      name:
        this.formBuilder.nonNullable.control(
          '',
          [
            Validators.required,
          ],
        ),

      time:
        this.formBuilder.nonNullable.control(
          '',
          [
            Validators.required,
          ],
        ),

      description:
        this.formBuilder.nonNullable.control(
          '',
          [
            Validators.required,
          ],
        ),
    });
  }

  private resetPlanForm(): void {
    this.planForm.reset({
      clientId: 0,
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      generalInstructions: '',
      dailyWaterIntake: '',
    });

    this.days.clear();

    this.days.push(
      this.createDayGroup(),
    );
  }
}