import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {
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
import { UserRole } from '../../core/models/user.model';
import { AppointmentsActions } from '../../store/appointments/appointments.actions';
import {
  selectCreateAppointmentError,
  selectIsCreatingAppointment,
  selectWasAppointmentCreated,
} from '../../store/appointments/appointments.selectors';
import { AvailabilityActions } from '../../store/availability/availability.actions';
import {
  selectAvailableSlots,
  selectAvailableSlotsError,
  selectAvailableSlotsLoading,
} from '../../store/availability/availability.selectors';
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from '../../store/auth/auth.selectors';
import { ProfessionalsActions } from '../../store/professionals/professionals.actions';
import {
  selectSelectedProfessional,
  selectSelectedProfessionalError,
  selectSelectedProfessionalLoading,
} from '../../store/professionals/professionals.selectors';

@Component({
  selector: 'app-professional-details',
  imports: [
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: './professional-details.html',
  styleUrl: './professional-details.scss',
})
export class ProfessionalDetails
  implements OnInit, OnDestroy
{
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly formBuilder =
    inject(FormBuilder);

  protected readonly professional =
    this.store.selectSignal(
      selectSelectedProfessional,
    );

  protected readonly loading =
    this.store.selectSignal(
      selectSelectedProfessionalLoading,
    );

  protected readonly error =
    this.store.selectSignal(
      selectSelectedProfessionalError,
    );

  protected readonly availableSlots =
    this.store.selectSignal(
      selectAvailableSlots,
    );

  protected readonly slotsLoading =
    this.store.selectSignal(
      selectAvailableSlotsLoading,
    );

  protected readonly slotsError =
    this.store.selectSignal(
      selectAvailableSlotsError,
    );

  protected readonly currentUser =
    this.store.selectSignal(
      selectCurrentUser,
    );

  protected readonly isAuthenticated =
    this.store.selectSignal(
      selectIsAuthenticated,
    );

  protected readonly creatingAppointment =
    this.store.selectSignal(
      selectIsCreatingAppointment,
    );

  protected readonly appointmentCreated =
    this.store.selectSignal(
      selectWasAppointmentCreated,
    );

  protected readonly createAppointmentError =
    this.store.selectSignal(
      selectCreateAppointmentError,
    );

  protected readonly imageLoadFailed =
    signal(false);

  protected readonly availabilityModalOpen =
    signal(false);

  protected readonly selectedSlotId =
    signal<number | null>(null);

  protected readonly bookingForm =
    this.formBuilder.nonNullable.group({
      clientNote: [
        '',
        [
          Validators.minLength(2),
          Validators.maxLength(1000),
        ],
      ],
    });

  ngOnInit(): void {
    const id = this.getProfessionalId();

    if (id === null) {
      void this.router.navigate([
        '/professionals',
      ]);

      return;
    }

    this.loadProfessional(id);
  }

  ngOnDestroy(): void {
    this.store.dispatch(
      ProfessionalsActions
        .clearSelectedProfessional(),
    );

    this.store.dispatch(
      AvailabilityActions
        .clearAvailableSlots(),
    );

    this.store.dispatch(
      AppointmentsActions
        .clearCreateAppointmentState(),
    );
  }

  @HostListener('document:keydown.escape')
  protected handleEscapeKey(): void {
    if (
      this.availabilityModalOpen() &&
      !this.creatingAppointment()
    ) {
      this.closeAvailabilityModal();
    }
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

  protected getRoleLabel(
    role: UserRole,
  ): string {
    if (role === 'trainer') {
      return 'Lični trener';
    }

    if (role === 'nutritionist') {
      return 'Nutricionista';
    }

    if (role === 'client') {
      return 'Klijent';
    }

    if (role === 'admin') {
      return 'Administrator';
    }

    return role;
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

    return `http://localhost:3000${profileImageUrl}`;
  }

  protected handleImageError(): void {
    this.imageLoadFailed.set(true);
  }

  protected openAvailabilityModal(): void {
    const professionalId =
      this.getProfessionalId();

    if (professionalId === null) {
      return;
    }

    this.selectedSlotId.set(null);
    this.bookingForm.reset();

    this.store.dispatch(
      AppointmentsActions
        .clearCreateAppointmentState(),
    );

    this.availabilityModalOpen.set(true);

    this.store.dispatch(
      AvailabilityActions.loadAvailableSlots({
        professionalId,
      }),
    );
  }

  protected closeAvailabilityModal(): void {
    if (this.creatingAppointment()) {
      return;
    }

    this.availabilityModalOpen.set(false);
    this.selectedSlotId.set(null);
    this.bookingForm.reset();

    this.store.dispatch(
      AppointmentsActions
        .clearCreateAppointmentState(),
    );
  }

  protected formatSlotDate(
    value: string,
  ): string {
    return new Intl.DateTimeFormat(
      'sr-RS',
      {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      },
    ).format(new Date(value));
  }

  protected formatSlotTime(
    value: string,
  ): string {
    return new Intl.DateTimeFormat(
      'sr-RS',
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    ).format(new Date(value));
  }

  protected selectSlot(slotId: number): void {
    if (this.creatingAppointment()) {
      return;
    }

    this.store.dispatch(
      AppointmentsActions
        .clearCreateAppointmentState(),
    );

    if (this.selectedSlotId() === slotId) {
      this.selectedSlotId.set(null);

      return;
    }

    this.selectedSlotId.set(slotId);
  }

  protected confirmBooking(): void {
    const slotId = this.selectedSlotId();

    if (slotId === null) {
      return;
    }

    if (!this.isAuthenticated()) {
      this.closeAvailabilityModal();

      void this.router.navigate(
        ['/login'],
        {
          queryParams: {
            returnUrl: this.router.url,
          },
        },
      );

      return;
    }

    const user = this.currentUser();

    if (!user || user.role !== 'client') {
      return;
    }

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();

      return;
    }

    const clientNote =
      this.bookingForm.controls
        .clientNote.value
        .trim();

    this.store.dispatch(
      AppointmentsActions.createAppointment({
        data: {
          slotId,

          ...(clientNote.length > 0
            ? {
                clientNote,
              }
            : {}),
        },
      }),
    );
  }

  protected reload(): void {
    const id = this.getProfessionalId();

    if (id === null) {
      return;
    }

    this.imageLoadFailed.set(false);
    this.loadProfessional(id);
  }

  protected reloadSlots(): void {
    const professionalId =
      this.getProfessionalId();

    if (professionalId === null) {
      return;
    }

    this.store.dispatch(
      AvailabilityActions.loadAvailableSlots({
        professionalId,
      }),
    );
  }

  protected goToMyProfile(): void {
    this.closeAvailabilityModal();

    void this.router.navigate([
      '/my-profile',
    ]);
  }

  private getProfessionalId(): number | null {
    const id = Number(
      this.route.snapshot.paramMap.get('id'),
    );

    if (!Number.isInteger(id) || id < 1) {
      return null;
    }

    return id;
  }

  private loadProfessional(
    professionalId: number,
  ): void {
    this.store.dispatch(
      ProfessionalsActions.loadProfessional({
        id: professionalId,
      }),
    );
  }
}