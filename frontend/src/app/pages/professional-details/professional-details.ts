import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { UserRole } from '../../core/models/user.model';
import { AvailabilityActions } from '../../store/availability/availability.actions';
import {
  selectAvailableSlots,
  selectAvailableSlotsError,
  selectAvailableSlotsLoading,
} from '../../store/availability/availability.selectors';
import { ProfessionalsActions } from '../../store/professionals/professionals.actions';
import {
  selectSelectedProfessional,
  selectSelectedProfessionalError,
  selectSelectedProfessionalLoading,
} from '../../store/professionals/professionals.selectors';

@Component({
  selector: 'app-professional-details',
  imports: [RouterLink],
  templateUrl: './professional-details.html',
  styleUrl: './professional-details.scss',
})
export class ProfessionalDetails
  implements OnInit, OnDestroy
{
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

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

  protected readonly imageLoadFailed =
    signal(false);

  protected readonly availabilityModalOpen =
    signal(false);

  protected readonly selectedSlotId =
    signal<number | null>(null);

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
  }

  @HostListener('document:keydown.escape')
  protected handleEscapeKey(): void {
    if (this.availabilityModalOpen()) {
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
    this.availabilityModalOpen.set(true);

    this.store.dispatch(
      AvailabilityActions.loadAvailableSlots({
        professionalId,
      }),
    );
  }

  protected closeAvailabilityModal(): void {
    this.availabilityModalOpen.set(false);
    this.selectedSlotId.set(null);
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
    if (this.selectedSlotId() === slotId) {
      this.selectedSlotId.set(null);

      return;
    }

    this.selectedSlotId.set(slotId);
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