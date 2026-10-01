import {
  Component,
  computed,
  effect,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  Appointment,
  AppointmentStatus,
} from '../../core/models/appointment.model';
import { AppointmentsActions } from '../../store/appointments/appointments.actions';
import {
  selectAppointmentCancellingId,
  selectAppointmentsError,
  selectAppointmentsLoading,
  selectAppointmentUpdatingStatusId,
  selectMyAppointments,
} from '../../store/appointments/appointments.selectors';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { ReviewsActions } from '../../store/reviews/reviews.actions';
import {
  selectCreateReviewError,
  selectIsCreatingReview,
  selectWasReviewCreated,
  selectWasReviewUpdated,
  selectReviewUpdatingId,
  selectUpdateReviewError,
  selectReviewDeletingId,
  selectDeleteReviewError,
} from '../../store/reviews/reviews.selectors';

type AppointmentFilter =
  | 'upcoming'
  | 'completed'
  | 'cancelled';

@Component({
  selector: 'app-my-appointments',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './my-appointments.html',
  styleUrl: './my-appointments.scss',
})
export class MyAppointments implements OnInit {
  private readonly store = inject(Store);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly currentUser =
    this.store.selectSignal(selectCurrentUser);

  protected readonly appointments =
    this.store.selectSignal(selectMyAppointments);

  protected readonly loading =
    this.store.selectSignal(selectAppointmentsLoading);

  protected readonly error =
    this.store.selectSignal(selectAppointmentsError);

  protected readonly cancellingId =
    this.store.selectSignal(selectAppointmentCancellingId);

  protected readonly updatingStatusId =
    this.store.selectSignal(selectAppointmentUpdatingStatusId);

  protected readonly creatingReview =
    this.store.selectSignal(selectIsCreatingReview);

  protected readonly reviewCreated =
    this.store.selectSignal(selectWasReviewCreated);

  protected readonly createReviewError =
    this.store.selectSignal(selectCreateReviewError);

  protected readonly reviewUpdated =
    this.store.selectSignal(selectWasReviewUpdated);

  protected readonly reviewUpdatingId =
    this.store.selectSignal(selectReviewUpdatingId);

  protected readonly reviewDeletingId =
    this.store.selectSignal(selectReviewDeletingId);

  protected readonly updateReviewError =
    this.store.selectSignal(selectUpdateReviewError);

  protected readonly deleteReviewError =
    this.store.selectSignal(selectDeleteReviewError);

  protected readonly editingReviewId =
    signal<number | null>(null);

  protected readonly savingReview = computed(
    () =>
      this.creatingReview() ||
      this.reviewUpdatingId() !== null,
  );

  protected readonly selectedFilter =
    signal<AppointmentFilter>('upcoming');

  protected readonly professionalNotes =
    signal<Record<number, string>>({});

  protected readonly reviewModalOpen = signal(false);

  protected readonly selectedReviewAppointment =
    signal<Appointment | null>(null);

  protected readonly reviewValidationError =
    signal<string | null>(null);

  protected readonly ratingValues = [1, 2, 3, 4, 5];

  protected readonly reviewForm =
    this.formBuilder.nonNullable.group({
      rating: [
        0,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(5),
        ],
      ],
    });

  protected readonly isProfessional = computed(() => {
    const role = this.currentUser()?.role;

    return role === 'trainer' || role === 'nutritionist';
  });

  protected readonly isNutritionist = computed(
    () => this.currentUser()?.role === 'nutritionist',
  );

  protected readonly isClient = computed(
    () => this.currentUser()?.role === 'client',
  );

  protected readonly filteredAppointments = computed(() => {
    const selectedFilter = this.selectedFilter();

    return this.appointments().filter((appointment) => {
      if (selectedFilter === 'upcoming') {
        return (
          appointment.status === 'pending' ||
          appointment.status === 'confirmed'
        );
      }

      if (selectedFilter === 'completed') {
        return appointment.status === 'completed';
      }

      return (
        appointment.status === 'cancelled' ||
        appointment.status === 'rejected'
      );
    });
  });

  private readonly closeReviewModalOnSuccess = effect(() => {
    const successful =
      this.editingReviewId() !== null
        ? this.reviewUpdated()
        : this.reviewCreated();

    if (successful && this.reviewModalOpen()) {
      this.reviewModalOpen.set(false);
      this.editingReviewId.set(null);
      this.selectedReviewAppointment.set(null);
      this.reviewForm.reset({ rating: 0 });
      this.reviewValidationError.set(null);

      this.store.dispatch(
        ReviewsActions.clearReviewMutationState(),
      );

      this.loadAppointments();
    }
  });

  ngOnInit(): void {
    this.loadAppointments();
  }

  @HostListener('document:keydown.escape')
  protected handleEscapeKey(): void {
    if (
      this.reviewModalOpen() &&
      !this.savingReview()
    ) {
      this.closeReviewModal();
    }
  }

  protected loadAppointments(): void {
    this.store.dispatch(
      AppointmentsActions.loadMyAppointments(),
    );
  }

  protected selectFilter(
    filter: AppointmentFilter,
  ): void {
    this.selectedFilter.set(filter);
  }

  protected setProfessionalNote(
    appointmentId: number,
    note: string,
  ): void {
    this.professionalNotes.update((currentNotes) => ({
      ...currentNotes,
      [appointmentId]: note,
    }));
  }

  protected getProfessionalNote(
    appointment: Appointment,
  ): string {
    return (
      this.professionalNotes()[appointment.id] ??
      appointment.professionalNote ??
      ''
    );
  }

  protected confirmAppointment(
    appointment: Appointment,
  ): void {
    this.updateStatus(appointment, 'confirmed');
  }

  protected rejectAppointment(
    appointment: Appointment,
  ): void {
    if (
      !window.confirm(
        'Da li sigurno želiš da odbiješ ovu rezervaciju?',
      )
    ) {
      return;
    }

    this.updateStatus(appointment, 'rejected');
  }

  protected completeAppointment(
    appointment: Appointment,
  ): void {
    if (
      !window.confirm(
        'Da li je ovaj termin uspešno završen?',
      )
    ) {
      return;
    }

    this.updateStatus(appointment, 'completed');
  }

  protected updateStatus(
    appointment: Appointment,
    status: 'confirmed' | 'rejected' | 'completed',
  ): void {
    const professionalNote =
      this.getProfessionalNote(appointment).trim();

    this.store.dispatch(
      AppointmentsActions.updateAppointmentStatus({
        appointmentId: appointment.id,
        data: {
          status,
          ...(professionalNote
            ? { professionalNote }
            : {}),
        },
      }),
    );
  }

  protected canComplete(
    appointment: Appointment,
  ): boolean {
    return (
      appointment.status === 'confirmed' &&
      new Date(appointment.slot.startsAt).getTime() <=
        Date.now()
    );
  }

  protected canCreateNutritionPlan(
    appointment: Appointment,
  ): boolean {
    return (
      this.isNutritionist() &&
      appointment.status === 'completed'
    );
  }

  protected canReview(
    appointment: Appointment,
  ): boolean {
    return (
      this.isClient() &&
      appointment.status === 'completed' &&
      appointment.review === null
    );
  }

  protected hasReviewedAppointment(
    appointment: Appointment,
  ): boolean {
    return (
      this.isClient() &&
      appointment.review !== null
    );
  }

  protected openReviewModal(
    appointment: Appointment,
  ): void {
    if (!this.canReview(appointment)) {
      return;
    }

    this.store.dispatch(
      ReviewsActions.clearReviewMutationState(),
    );

    this.editingReviewId.set(null);
    this.selectedReviewAppointment.set(appointment);
    this.reviewValidationError.set(null);
    this.reviewForm.reset({ rating: 0 });
    this.reviewModalOpen.set(true);
  }

  protected openEditReviewModal(
    appointment: Appointment,
  ): void {
    if (
      !this.isClient() ||
      !appointment.review ||
      this.savingReview()
    ) {
      return;
    }

    this.store.dispatch(
      ReviewsActions.clearReviewMutationState(),
    );

    this.editingReviewId.set(appointment.review.id);
    this.selectedReviewAppointment.set(appointment);
    this.reviewValidationError.set(null);

    this.reviewForm.reset({
      rating: appointment.review.rating,
    });

    this.reviewModalOpen.set(true);
  }

  protected deleteReview(
    appointment: Appointment,
  ): void {
    if (
      !this.isClient() ||
      !appointment.review ||
      this.reviewDeletingId() !== null ||
      this.savingReview()
    ) {
      return;
    }

    if (
      !window.confirm(
        'Da li želiš da obrišeš ovu ocenu?',
      )
    ) {
      return;
    }

    this.store.dispatch(
      ReviewsActions.deleteReview({
        reviewId: appointment.review.id,
      }),
    );
  }

  protected closeReviewModal(): void {
    if (this.savingReview()) {
      return;
    }

    this.reviewModalOpen.set(false);
    this.editingReviewId.set(null);
    this.selectedReviewAppointment.set(null);
    this.reviewValidationError.set(null);
    this.reviewForm.reset({ rating: 0 });

    this.store.dispatch(
      ReviewsActions.clearReviewMutationState(),
    );
  }

  protected selectRating(rating: number): void {
    if (this.savingReview()) {
      return;
    }

    this.reviewForm.controls.rating.setValue(rating);
    this.reviewForm.controls.rating.markAsTouched();
    this.reviewValidationError.set(null);
  }

  protected isRatingSelected(
    rating: number,
  ): boolean {
    return (
      rating <=
      this.reviewForm.controls.rating.value
    );
  }

  protected submitReview(): void {
    const appointment =
      this.selectedReviewAppointment();

    if (!appointment || this.savingReview()) {
      return;
    }

    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();

      this.reviewValidationError.set(
        'Izaberi ocenu od 1 do 5 zvezdica.',
      );

      return;
    }

    const { rating } =
      this.reviewForm.getRawValue();

    this.reviewValidationError.set(null);

    const reviewId = this.editingReviewId();

    if (reviewId !== null) {
      this.store.dispatch(
        ReviewsActions.updateReview({
          reviewId,
          data: { rating },
        }),
      );
    } else {
      this.store.dispatch(
        ReviewsActions.createReview({
          data: {
            appointmentId: appointment.id,
            rating,
          },
        }),
      );
    }
  }

  protected hasReviewError(
    controlName: 'rating',
    errorName: string,
  ): boolean {
    const control =
      this.reviewForm.controls[controlName];

    return (
      control.touched &&
      control.hasError(errorName)
    );
  }

  protected isUpdating(
    appointmentId: number,
  ): boolean {
    return (
      this.updatingStatusId() === appointmentId
    );
  }

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('sr-Latn-RS', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));
  }

  protected formatTime(value: string): string {
    return new Intl.DateTimeFormat('sr-Latn-RS', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }

  protected getStatusLabel(
    status: AppointmentStatus,
  ): string {
    if (status === 'pending') {
      return 'Čeka potvrdu';
    }

    if (status === 'confirmed') {
      return 'Potvrđeno';
    }

    if (status === 'rejected') {
      return 'Odbijeno';
    }

    if (status === 'completed') {
      return 'Završeno';
    }

    if (status === 'cancelled') {
      return 'Otkazano';
    }

    return status;
  }

  protected getStatusClass(
    status: AppointmentStatus,
  ): string {
    return `appointment-status--${status}`;
  }

  protected canCancel(
    appointment: Appointment,
  ): boolean {
    const allowedStatus =
      appointment.status === 'pending' ||
      appointment.status === 'confirmed';

    const isFuture =
      new Date(appointment.slot.startsAt).getTime() >
      Date.now();

    return allowedStatus && isFuture;
  }

  protected cancelAppointment(
    appointment: Appointment,
  ): void {
    if (
      !window.confirm(
        'Da li sigurno želiš da otkažeš ovu rezervaciju?',
      )
    ) {
      return;
    }

    this.store.dispatch(
      AppointmentsActions.cancelAppointment({
        appointmentId: appointment.id,
      }),
    );
  }

  protected getProfileImageUrl(
    profileImageUrl: string | null,
  ): string | null {
    if (!profileImageUrl) {
      return null;
    }

    if (profileImageUrl.startsWith('http')) {
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
}