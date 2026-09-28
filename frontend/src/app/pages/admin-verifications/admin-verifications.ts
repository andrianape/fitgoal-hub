import {
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormsModule,
} from '@angular/forms';
import {
  RouterLink,
} from '@angular/router';
import {
  Store,
} from '@ngrx/store';
import {
  Professional,
} from '../../core/models/professional.model';
import {
  selectCurrentUser,
} from '../../store/auth/auth.selectors';
import {
  ProfessionalsActions,
} from '../../store/professionals/professionals.actions';
import {
  selectAdminProfessionals,
  selectAdminProfessionalsError,
  selectAdminProfessionalsLoading,
  selectVerificationUpdateError,
  selectVerificationUpdateSuccessful,
  selectVerificationUpdatingId,
} from '../../store/professionals/professionals.selectors';

type VerificationFilter =
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'all';

type VerificationStatus =
  | 'pending'
  | 'verified'
  | 'rejected';

@Component({
  selector:
    'app-admin-verifications',

  imports: [
    FormsModule,
    RouterLink,
  ],

  templateUrl:
    './admin-verifications.html',

  styleUrl:
    './admin-verifications.scss',
})
export class AdminVerifications
  implements OnInit, OnDestroy
{
  private readonly store =
    inject(Store);

  protected readonly currentUser =
    this.store.selectSignal(
      selectCurrentUser,
    );

  protected readonly professionals =
    this.store.selectSignal(
      selectAdminProfessionals,
    );

  protected readonly loading =
    this.store.selectSignal(
      selectAdminProfessionalsLoading,
    );

  protected readonly loadError =
    this.store.selectSignal(
      selectAdminProfessionalsError,
    );

  protected readonly updatingId =
    this.store.selectSignal(
      selectVerificationUpdatingId,
    );

  protected readonly updateSuccessful =
    this.store.selectSignal(
      selectVerificationUpdateSuccessful,
    );

  protected readonly updateError =
    this.store.selectSignal(
      selectVerificationUpdateError,
    );

  protected readonly selectedFilter =
    signal<VerificationFilter>(
      'pending',
    );

  protected readonly selectedProfessional =
    signal<Professional | null>(
      null,
    );

  protected readonly rejectionMode =
    signal(false);

  protected readonly rejectionNote =
    signal('');

  protected readonly localError =
    signal<string | null>(null);

  protected readonly failedImageIds =
    signal<ReadonlySet<number>>(
      new Set<number>(),
    );

  protected readonly isAdmin =
    computed(() => {
      return (
        this.currentUser()?.role ===
        'admin'
      );
    });

  protected readonly pendingCount =
    computed(() => {
      return this.professionals()
        .filter(
          (professional) =>
            this.getVerificationStatus(
              professional,
            ) === 'pending',
        )
        .length;
    });

  protected readonly verifiedCount =
    computed(() => {
      return this.professionals()
        .filter(
          (professional) =>
            this.getVerificationStatus(
              professional,
            ) === 'verified',
        )
        .length;
    });

  protected readonly rejectedCount =
    computed(() => {
      return this.professionals()
        .filter(
          (professional) =>
            this.getVerificationStatus(
              professional,
            ) === 'rejected',
        )
        .length;
    });

  protected readonly filteredProfessionals =
    computed(() => {
      const filter =
        this.selectedFilter();

      if (filter === 'all') {
        return this.professionals();
      }

      return this.professionals()
        .filter(
          (professional) =>
            this.getVerificationStatus(
              professional,
            ) === filter,
        );
    });

  private readonly closeModalAfterUpdate =
    effect(() => {
      if (
        this.updateSuccessful() &&
        this.selectedProfessional()
      ) {
        this.closeDetails();
      }
    });

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.loadProfessionals();
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(
      ProfessionalsActions
        .clearAdminProfessionals(),
    );
  }

  protected loadProfessionals():
    void {
    this.store.dispatch(
      ProfessionalsActions
        .loadAdminProfessionals(),
    );
  }

  protected selectFilter(
    filter: VerificationFilter,
  ): void {
    this.selectedFilter.set(
      filter,
    );
  }

  protected openDetails(
    professional: Professional,
  ): void {
    this.selectedProfessional.set(
      professional,
    );

    this.rejectionMode.set(false);
    this.rejectionNote.set('');
    this.localError.set(null);
  }

  protected closeDetails(): void {
    const selected =
      this.selectedProfessional();

    if (
      selected &&
      this.updatingId() ===
        selected.id
    ) {
      return;
    }

    this.selectedProfessional.set(
      null,
    );

    this.rejectionMode.set(false);
    this.rejectionNote.set('');
    this.localError.set(null);
  }

  protected approve(
    professional: Professional,
  ): void {
    const confirmed =
      window.confirm(
        `Da li želiš da odobriš profil korisnika ${professional.user.firstName} ${professional.user.lastName}?`,
      );

    if (!confirmed) {
      return;
    }

    this.localError.set(null);

    this.store.dispatch(
      ProfessionalsActions
        .updateProfessionalVerification({
          professionalId:
            professional.id,

          data: {
            isVerified: true,

            verificationNote:
              'Profesionalni profil je odobren.',
          },
        }),
    );
  }

  protected startRejection(): void {
    this.rejectionMode.set(true);
    this.rejectionNote.set('');
    this.localError.set(null);
  }

  protected cancelRejection(): void {
    this.rejectionMode.set(false);
    this.rejectionNote.set('');
    this.localError.set(null);
  }

  protected reject(
    professional: Professional,
  ): void {
    const note =
      this.rejectionNote().trim();

    if (note.length < 2) {
      this.localError.set(
        'Napiši razlog odbijanja profila.',
      );

      return;
    }

    if (note.length > 1000) {
      this.localError.set(
        'Napomena može imati najviše 1000 karaktera.',
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Da li želiš da odbiješ profil korisnika ${professional.user.firstName} ${professional.user.lastName}?`,
      );

    if (!confirmed) {
      return;
    }

    this.localError.set(null);

    this.store.dispatch(
      ProfessionalsActions
        .updateProfessionalVerification({
          professionalId:
            professional.id,

          data: {
            isVerified: false,
            verificationNote: note,
          },
        }),
    );
  }

  protected isUpdating(
    professionalId: number,
  ): boolean {
    return (
      this.updatingId() ===
      professionalId
    );
  }

  protected getVerificationStatus(
    professional: Professional,
  ): VerificationStatus {
    if (professional.isVerified) {
      return 'verified';
    }

    if (
      professional.verifiedAt ||
      professional.verificationNote
    ) {
      return 'rejected';
    }

    return 'pending';
  }

  protected getStatusLabel(
    professional: Professional,
  ): string {
    const status =
      this.getVerificationStatus(
        professional,
      );

    if (status === 'verified') {
      return 'Odobren';
    }

    if (status === 'rejected') {
      return 'Odbijen';
    }

    return 'Čeka proveru';
  }

  protected getStatusClass(
    professional: Professional,
  ): string {
    return (
      'verification-status--' +
      this.getVerificationStatus(
        professional,
      )
    );
  }

  protected getRoleLabel(
    professional: Professional,
  ): string {
    if (
      professional.user.role ===
      'trainer'
    ) {
      return 'Lični trener';
    }

    if (
      professional.user.role ===
      'nutritionist'
    ) {
      return 'Nutricionista';
    }

    return professional.user.role;
  }

  protected getProfileImageUrl(
    profileImageUrl: string | null,
  ): string | null {
    if (!profileImageUrl) {
      return null;
    }

    if (
      profileImageUrl.startsWith(
        'http',
      )
    ) {
      return profileImageUrl;
    }

    return `http://localhost:3000${profileImageUrl}`;
  }

  protected hasImageLoadFailed(
    userId: number,
  ): boolean {
    return this.failedImageIds()
      .has(userId);
  }

  protected handleImageError(
    userId: number,
  ): void {
    this.failedImageIds.update(
      (currentIds) => {
        const updatedIds =
          new Set(currentIds);

        updatedIds.add(userId);

        return updatedIds;
      },
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

  protected formatDate(
    value: string | null,
  ): string {
    if (!value) {
      return 'Nije evidentirano';
    }

    return new Intl.DateTimeFormat(
      'sr-Latn-RS',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    ).format(
      new Date(value),
    );
  }
}