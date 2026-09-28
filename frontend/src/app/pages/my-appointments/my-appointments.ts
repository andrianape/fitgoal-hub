import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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

type AppointmentFilter =
  | 'upcoming'
  | 'completed'
  | 'cancelled';

@Component({
  selector: 'app-my-appointments',
  imports: [
    FormsModule,
    RouterLink,
  ],
  templateUrl: './my-appointments.html',
  styleUrl: './my-appointments.scss',
})
export class MyAppointments
  implements OnInit
{
  private readonly store = inject(Store);

  protected readonly currentUser =
    this.store.selectSignal(
      selectCurrentUser,
    );

  protected readonly appointments =
    this.store.selectSignal(
      selectMyAppointments,
    );

  protected readonly loading =
    this.store.selectSignal(
      selectAppointmentsLoading,
    );

  protected readonly error =
    this.store.selectSignal(
      selectAppointmentsError,
    );

  protected readonly cancellingId =
    this.store.selectSignal(
      selectAppointmentCancellingId,
    );

  protected readonly updatingStatusId =
    this.store.selectSignal(
      selectAppointmentUpdatingStatusId,
    );

  protected readonly selectedFilter =
    signal<AppointmentFilter>('upcoming');

  protected readonly professionalNotes =
    signal<Record<number, string>>({});

  protected readonly isProfessional =
    computed(() => {
      const role = this.currentUser()?.role;

      return (
        role === 'trainer' ||
        role === 'nutritionist'
      );
    });

  protected readonly isNutritionist =
    computed(() => {
      return (
        this.currentUser()?.role ===
        'nutritionist'
      );
    });

  protected readonly filteredAppointments =
    computed(() => {
      const selectedFilter =
        this.selectedFilter();

      return this.appointments().filter(
        (appointment) => {
          if (selectedFilter === 'upcoming') {
            return (
              appointment.status ===
                'pending' ||
              appointment.status ===
                'confirmed'
            );
          }

          if (selectedFilter === 'completed') {
            return (
              appointment.status ===
              'completed'
            );
          }

          return (
            appointment.status ===
              'cancelled' ||
            appointment.status ===
              'rejected'
          );
        },
      );
    });

  ngOnInit(): void {
    this.loadAppointments();
  }

  protected loadAppointments(): void {
    this.store.dispatch(
      AppointmentsActions
        .loadMyAppointments(),
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
    this.professionalNotes.update(
      (currentNotes) => ({
        ...currentNotes,
        [appointmentId]: note,
      }),
    );
  }

  protected getProfessionalNote(
    appointment: Appointment,
  ): string {
    return (
      this.professionalNotes()[
        appointment.id
      ] ??
      appointment.professionalNote ??
      ''
    );
  }

  protected confirmAppointment(
    appointment: Appointment,
  ): void {
    this.updateStatus(
      appointment,
      'confirmed',
    );
  }

  protected rejectAppointment(
    appointment: Appointment,
  ): void {
    const confirmed = window.confirm(
      'Da li sigurno želiš da odbiješ ovu rezervaciju?',
    );

    if (!confirmed) {
      return;
    }

    this.updateStatus(
      appointment,
      'rejected',
    );
  }

  protected completeAppointment(
    appointment: Appointment,
  ): void {
    const confirmed = window.confirm(
      'Da li je ovaj termin uspešno završen?',
    );

    if (!confirmed) {
      return;
    }

    this.updateStatus(
      appointment,
      'completed',
    );
  }

  protected updateStatus(
    appointment: Appointment,
    status:
      | 'confirmed'
      | 'rejected'
      | 'completed',
  ): void {
    const professionalNote =
      this.getProfessionalNote(
        appointment,
      ).trim();

    this.store.dispatch(
      AppointmentsActions
        .updateAppointmentStatus({
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
      appointment.status ===
        'confirmed' &&
      new Date(
        appointment.slot.startsAt,
      ).getTime() <= Date.now()
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

  protected isUpdating(
    appointmentId: number,
  ): boolean {
    return (
      this.updatingStatusId() ===
      appointmentId
    );
  }

  protected formatDate(
    value: string,
  ): string {
    return new Intl.DateTimeFormat(
      'sr-Latn-RS',
      {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      },
    ).format(new Date(value));
  }

  protected formatTime(
    value: string,
  ): string {
    return new Intl.DateTimeFormat(
      'sr-Latn-RS',
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    ).format(new Date(value));
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

    if (status === 'cancelled') {
      return 'Otkazano';
    }

    if (status === 'completed') {
      return 'Završeno';
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
      new Date(
        appointment.slot.startsAt,
      ).getTime() > Date.now();

    return allowedStatus && isFuture;
  }

  protected cancelAppointment(
    appointment: Appointment,
  ): void {
    const confirmed = window.confirm(
      'Da li sigurno želiš da otkažeš ovu rezervaciju?',
    );

    if (!confirmed) {
      return;
    }

    this.store.dispatch(
      AppointmentsActions
        .cancelAppointment({
          appointmentId:
            appointment.id,
        }),
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
      `http://localhost:3000` +
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