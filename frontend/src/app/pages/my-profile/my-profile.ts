import {
  Component,
  effect,
  HostListener,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  RouterLink,
} from '@angular/router';
import {
  Store,
} from '@ngrx/store';
import {
  AvailabilitySlot,
  CreateAvailabilitySlotRequest,
} from '../../core/models/availability-slot.model';
import {
  ChangePasswordRequest,
  UpdateUserRequest,
  UserRole,
} from '../../core/models/user.model';
import {
  AuthActions,
} from '../../store/auth/auth.actions';
import {
  selectAuthInitialized,
  selectCurrentUser,
  selectIsPasswordChanging,
  selectIsProfileImageUpdating,
  selectIsProfileUpdating,
  selectPasswordChangeErrorMessage,
  selectProfileImageErrorMessage,
  selectProfileUpdateErrorMessage,
  selectWasPasswordChangeSuccessful,
  selectWasProfileImageUpdateSuccessful,
  selectWasProfileUpdateSuccessful,
} from '../../store/auth/auth.selectors';
import {
  AvailabilityActions,
} from '../../store/availability/availability.actions';
import {
  selectCreateSlotError,
  selectDeleteSlotError,
  selectIsCreatingSlot,
  selectProfessionalOwnSlots,
  selectProfessionalOwnSlotsError,
  selectProfessionalOwnSlotsLoading,
  selectSlotDeletingId,
  selectWasSlotCreated,
} from '../../store/availability/availability.selectors';
import {
  CitiesActions,
} from '../../store/cities/cities.actions';
import {
  selectCities,
  selectLoaded as selectCitiesLoaded,
} from '../../store/cities/cities.selectors';

@Component({
  selector: 'app-my-profile',

  imports: [
    RouterLink,
    ReactiveFormsModule,
  ],

  templateUrl: './my-profile.html',
  styleUrl: './my-profile.scss',
})
export class MyProfile
  implements OnDestroy
{
  private readonly store =
    inject(Store);

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly maximumImageSize =
    5 * 1024 * 1024;

  private readonly allowedImageTypes =
    new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
    ]);

  protected readonly currentUser =
    this.store.selectSignal(
      selectCurrentUser,
    );

  protected readonly initialized =
    this.store.selectSignal(
      selectAuthInitialized,
    );

  protected readonly cities =
    this.store.selectSignal(
      selectCities,
    );

  protected readonly citiesLoaded =
    this.store.selectSignal(
      selectCitiesLoaded,
    );

  protected readonly profileUpdating =
    this.store.selectSignal(
      selectIsProfileUpdating,
    );

  protected readonly profileUpdateSuccessful =
    this.store.selectSignal(
      selectWasProfileUpdateSuccessful,
    );

  protected readonly profileUpdateError =
    this.store.selectSignal(
      selectProfileUpdateErrorMessage,
    );

  protected readonly profileImageUpdating =
    this.store.selectSignal(
      selectIsProfileImageUpdating,
    );

  protected readonly profileImageUpdateSuccessful =
    this.store.selectSignal(
      selectWasProfileImageUpdateSuccessful,
    );

  protected readonly profileImageError =
    this.store.selectSignal(
      selectProfileImageErrorMessage,
    );

  protected readonly passwordChanging =
    this.store.selectSignal(
      selectIsPasswordChanging,
    );

  protected readonly passwordChangeSuccessful =
    this.store.selectSignal(
      selectWasPasswordChangeSuccessful,
    );

  protected readonly passwordChangeError =
    this.store.selectSignal(
      selectPasswordChangeErrorMessage,
    );

  protected readonly mySlots =
    this.store.selectSignal(
      selectProfessionalOwnSlots,
    );

  protected readonly mySlotsLoading =
    this.store.selectSignal(
      selectProfessionalOwnSlotsLoading,
    );

  protected readonly mySlotsError =
    this.store.selectSignal(
      selectProfessionalOwnSlotsError,
    );

  protected readonly creatingSlot =
    this.store.selectSignal(
      selectIsCreatingSlot,
    );

  protected readonly slotCreated =
    this.store.selectSignal(
      selectWasSlotCreated,
    );

  protected readonly createSlotError =
    this.store.selectSignal(
      selectCreateSlotError,
    );

  protected readonly deletingSlotId =
    this.store.selectSignal(
      selectSlotDeletingId,
    );

  protected readonly deleteSlotError =
    this.store.selectSignal(
      selectDeleteSlotError,
    );

  protected readonly imageLoadFailed =
    signal(false);

  protected readonly selectedProfileImage =
    signal<File | null>(null);

  protected readonly profileImagePreviewUrl =
    signal<string | null>(null);

  protected readonly profileImageValidationError =
    signal<string | null>(null);

  protected readonly editModalOpen =
    signal(false);

  protected readonly passwordModalOpen =
    signal(false);

  protected readonly passwordValidationError =
    signal<string | null>(null);

  protected readonly slotModalOpen =
    signal(false);

  protected readonly slotValidationError =
    signal<string | null>(null);

  protected readonly minimumSlotDate =
    this.getLocalDateValue(
      new Date(),
    );

  protected readonly editForm =
    this.formBuilder.group({
      firstName:
        this.formBuilder
          .nonNullable.control(
            '',
            [
              Validators.required,
              Validators.minLength(2),
              Validators.maxLength(100),
            ],
          ),

      lastName:
        this.formBuilder
          .nonNullable.control(
            '',
            [
              Validators.required,
              Validators.minLength(2),
              Validators.maxLength(100),
            ],
          ),

      email:
        this.formBuilder
          .nonNullable.control(
            '',
            [
              Validators.required,
              Validators.email,
            ],
          ),

      phoneNumber:
        this.formBuilder
          .nonNullable.control(
            '',
            [
              Validators.pattern(
                /^[0-9+\s()-]{6,30}$/,
              ),
            ],
          ),

      cityId:
        this.formBuilder.control<
          number | null
        >(null),
    });

  protected readonly passwordForm =
    this.formBuilder
      .nonNullable.group({
        currentPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(72),
          ],
        ],

        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(72),

            Validators.pattern(
              /[a-z]/,
            ),

            Validators.pattern(
              /[A-Z]/,
            ),

            Validators.pattern(
              /[0-9]/,
            ),
          ],
        ],

        confirmPassword: [
          '',
          [
            Validators.required,
          ],
        ],
      });

  protected readonly slotForm =
    this.formBuilder.group({
      date:
        this.formBuilder
          .nonNullable.control(
            '',
            [
              Validators.required,
            ],
          ),

      startTime:
        this.formBuilder
          .nonNullable.control(
            '',
            [
              Validators.required,
            ],
          ),

      endTime:
        this.formBuilder
          .nonNullable.control(
            '',
            [
              Validators.required,
            ],
          ),
    });

  private readonly loadProfessionalSlots =
    effect(() => {
      const user =
        this.currentUser();

      if (
        user?.role === 'trainer' ||
        user?.role === 'nutritionist'
      ) {
        this.store.dispatch(
          AvailabilityActions
            .loadMySlots(),
        );
      }
    });

  private readonly closeEditModalOnSuccess =
    effect(() => {
      if (
        this.profileUpdateSuccessful() &&
        this.editModalOpen()
      ) {
        this.closeEditModal();
      }
    });

  private readonly clearSelectedImageOnSuccess =
    effect(() => {
      if (
        this.profileImageUpdateSuccessful()
      ) {
        this.clearSelectedImage();

        this.imageLoadFailed.set(
          false,
        );
      }
    });

  private readonly resetPasswordFormOnSuccess =
    effect(() => {
      if (
        this.passwordChangeSuccessful() &&
        this.passwordModalOpen()
      ) {
        this.passwordForm.reset({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        this.passwordValidationError.set(
          null,
        );
      }
    });

  private readonly closeSlotModalOnSuccess =
    effect(() => {
      if (
        this.slotCreated() &&
        this.slotModalOpen()
      ) {
        this.slotModalOpen.set(
          false,
        );

        this.slotValidationError.set(
          null,
        );

        this.slotForm.reset({
          date: '',
          startTime: '',
          endTime: '',
        });
      }
    });

  ngOnDestroy(): void {
    this.revokeProfileImagePreview();
  }

  @HostListener(
    'document:keydown.escape',
  )
  protected handleEscapeKey(): void {
    if (
      this.passwordModalOpen() &&
      !this.passwordChanging()
    ) {
      this.closePasswordModal();

      return;
    }

    if (
      this.slotModalOpen() &&
      !this.creatingSlot()
    ) {
      this.closeSlotModal();

      return;
    }

    if (
      this.editModalOpen() &&
      !this.profileUpdating() &&
      !this.profileImageUpdating()
    ) {
      this.closeEditModal();
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
    if (role === 'client') {
      return 'Klijent';
    }

    if (role === 'trainer') {
      return 'Lični trener';
    }

    if (role === 'nutritionist') {
      return 'Nutricionista';
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

    if (
      profileImageUrl.startsWith(
        'http',
      )
    ) {
      return profileImageUrl;
    }

    return `http://localhost:3000${profileImageUrl}`;
  }

  protected getDisplayedProfileImageUrl(
    profileImageUrl: string | null,
  ): string | null {
    return (
      this.profileImagePreviewUrl() ??
      this.getProfileImageUrl(
        profileImageUrl,
      )
    );
  }

  protected handleImageError(): void {
    this.imageLoadFailed.set(true);
  }

  protected handleProfileImageSelected(
    event: Event,
  ): void {
    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    this.profileImageValidationError.set(
      null,
    );

    this.store.dispatch(
      AuthActions
        .clearProfileImageState(),
    );

    if (!file) {
      this.clearSelectedImage();

      return;
    }

    if (
      !this.allowedImageTypes.has(
        file.type,
      )
    ) {
      this.profileImageValidationError.set(
        'Dozvoljeni formati su JPG, PNG i WebP.',
      );

      input.value = '';

      this.clearSelectedImage();

      return;
    }

    if (
      file.size >
      this.maximumImageSize
    ) {
      this.profileImageValidationError.set(
        'Fotografija može imati najviše 5 MB.',
      );

      input.value = '';

      this.clearSelectedImage();

      return;
    }

    this.revokeProfileImagePreview();

    const previewUrl =
      URL.createObjectURL(file);

    this.selectedProfileImage.set(
      file,
    );

    this.profileImagePreviewUrl.set(
      previewUrl,
    );

    this.imageLoadFailed.set(false);
  }

  protected uploadProfileImage():
    void {
    const file =
      this.selectedProfileImage();

    if (!file) {
      this.profileImageValidationError.set(
        'Prvo izaberi fotografiju.',
      );

      return;
    }

    this.profileImageValidationError.set(
      null,
    );

    this.store.dispatch(
      AuthActions
        .uploadProfileImage({
          file,
        }),
    );
  }

  protected removeProfileImage():
    void {
    const user =
      this.currentUser();

    if (!user?.profileImageUrl) {
      return;
    }

    const confirmed =
      window.confirm(
        'Da li sigurno želiš da ukloniš profilnu fotografiju?',
      );

    if (!confirmed) {
      return;
    }

    this.profileImageValidationError.set(
      null,
    );

    this.store.dispatch(
      AuthActions
        .removeProfileImage(),
    );
  }

  protected cancelSelectedImage():
    void {
    this.clearSelectedImage();

    this.profileImageValidationError.set(
      null,
    );

    this.store.dispatch(
      AuthActions
        .clearProfileImageState(),
    );

    this.imageLoadFailed.set(false);
  }

  protected openEditModal(): void {
    const user =
      this.currentUser();

    if (!user) {
      return;
    }

    this.store.dispatch(
      AuthActions
        .clearProfileUpdateState(),
    );

    this.store.dispatch(
      AuthActions
        .clearProfileImageState(),
    );

    this.clearSelectedImage();

    this.profileImageValidationError.set(
      null,
    );

    this.imageLoadFailed.set(false);

    this.editForm.reset({
      firstName:
        user.firstName,

      lastName:
        user.lastName,

      email:
        user.email,

      phoneNumber:
        user.phoneNumber ?? '',

      cityId:
        user.city?.id ?? null,
    });

    if (!this.citiesLoaded()) {
      this.store.dispatch(
        CitiesActions
          .loadCities(),
      );
    }

    this.editModalOpen.set(true);
  }

  protected closeEditModal(): void {
    if (
      this.profileUpdating() ||
      this.profileImageUpdating()
    ) {
      return;
    }

    this.editModalOpen.set(false);

    this.clearSelectedImage();

    this.profileImageValidationError.set(
      null,
    );

    this.store.dispatch(
      AuthActions
        .clearProfileUpdateState(),
    );

    this.store.dispatch(
      AuthActions
        .clearProfileImageState(),
    );
  }

  protected submitProfileUpdate():
    void {
    const user =
      this.currentUser();

    if (!user) {
      return;
    }

    if (this.editForm.invalid) {
      this.editForm
        .markAllAsTouched();

      return;
    }

    const formValue =
      this.editForm
        .getRawValue();

    const phoneNumber =
      formValue.phoneNumber.trim();

    const data:
      UpdateUserRequest = {
        firstName:
          formValue.firstName.trim(),

        lastName:
          formValue.lastName.trim(),

        email:
          formValue.email
            .trim()
            .toLowerCase(),

        cityId:
          formValue.cityId,
      };

    if (
      phoneNumber.length > 0
    ) {
      data.phoneNumber =
        phoneNumber;
    }

    this.store.dispatch(
      AuthActions.updateProfile({
        userId: user.id,
        data,
      }),
    );
  }

  protected hasEditError(
    controlName:
      | 'firstName'
      | 'lastName'
      | 'email'
      | 'phoneNumber',

    errorName: string,
  ): boolean {
    const control =
      this.editForm.controls[
        controlName
      ];

    return (
      control.touched &&
      control.hasError(errorName)
    );
  }

  protected openPasswordModal():
    void {
    this.store.dispatch(
      AuthActions
        .clearPasswordChangeState(),
    );

    this.passwordValidationError.set(
      null,
    );

    this.passwordForm.reset({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    this.passwordModalOpen.set(
      true,
    );
  }

  protected closePasswordModal():
    void {
    if (this.passwordChanging()) {
      return;
    }

    this.passwordModalOpen.set(
      false,
    );

    this.passwordValidationError.set(
      null,
    );

    this.passwordForm.reset({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    this.store.dispatch(
      AuthActions
        .clearPasswordChangeState(),
    );
  }

  protected submitPasswordChange():
    void {
    this.passwordValidationError.set(
      null,
    );

    this.store.dispatch(
      AuthActions
        .clearPasswordChangeState(),
    );

    if (this.passwordForm.invalid) {
      this.passwordForm
        .markAllAsTouched();

      return;
    }

    const formValue =
      this.passwordForm
        .getRawValue();

    if (
      formValue.newPassword !==
      formValue.confirmPassword
    ) {
      this.passwordValidationError.set(
        'Nova lozinka i potvrda lozinke se ne podudaraju.',
      );

      return;
    }

    if (
      formValue.currentPassword ===
      formValue.newPassword
    ) {
      this.passwordValidationError.set(
        'Nova lozinka mora biti drugačija od trenutne lozinke.',
      );

      return;
    }

    const data:
      ChangePasswordRequest = {
        currentPassword:
          formValue.currentPassword,

        newPassword:
          formValue.newPassword,
      };

    this.store.dispatch(
      AuthActions.changePassword({
        data,
      }),
    );
  }

  protected hasPasswordError(
    controlName:
      | 'currentPassword'
      | 'newPassword'
      | 'confirmPassword',

    errorName: string,
  ): boolean {
    const control =
      this.passwordForm.controls[
        controlName
      ];

    return (
      control.touched &&
      control.hasError(errorName)
    );
  }

  protected passwordsDoNotMatch():
    boolean {
    const {
      newPassword,
      confirmPassword,
    } =
      this.passwordForm
        .getRawValue();

    return (
      this.passwordForm.controls
        .confirmPassword.touched &&
      confirmPassword.length > 0 &&
      newPassword !== confirmPassword
    );
  }

  protected openSlotModal(): void {
    this.store.dispatch(
      AvailabilityActions
        .clearSlotMutationState(),
    );

    this.slotValidationError.set(
      null,
    );

    this.slotForm.reset({
      date: '',
      startTime: '',
      endTime: '',
    });

    this.slotModalOpen.set(true);
  }

  protected closeSlotModal(): void {
    if (this.creatingSlot()) {
      return;
    }

    this.slotModalOpen.set(false);

    this.slotValidationError.set(
      null,
    );

    this.store.dispatch(
      AvailabilityActions
        .clearSlotMutationState(),
    );
  }

  protected submitSlot(): void {
    this.slotValidationError.set(
      null,
    );

    if (this.slotForm.invalid) {
      this.slotForm
        .markAllAsTouched();

      return;
    }

    const {
      date,
      startTime,
      endTime,
    } =
      this.slotForm.getRawValue();

    const startsAt =
      new Date(
        `${date}T${startTime}:00`,
      );

    const endsAt =
      new Date(
        `${date}T${endTime}:00`,
      );

    if (
      Number.isNaN(
        startsAt.getTime(),
      ) ||
      Number.isNaN(
        endsAt.getTime(),
      )
    ) {
      this.slotValidationError.set(
        'Uneti datum ili vreme nije ispravno.',
      );

      return;
    }

    if (
      startsAt <= new Date()
    ) {
      this.slotValidationError.set(
        'Početak termina mora biti u budućnosti.',
      );

      return;
    }

    if (endsAt <= startsAt) {
      this.slotValidationError.set(
        'Vreme završetka mora biti posle vremena početka.',
      );

      return;
    }

    const data:
      CreateAvailabilitySlotRequest = {
        startsAt:
          startsAt.toISOString(),

        endsAt:
          endsAt.toISOString(),
      };

    this.store.dispatch(
      AvailabilityActions
        .createSlot({
          data,
        }),
    );
  }

  protected deleteSlot(
    slot: AvailabilitySlot,
  ): void {
    if (slot.isBooked) {
      return;
    }

    const confirmed =
      window.confirm(
        'Da li sigurno želiš da obrišeš ovaj slobodan termin?',
      );

    if (!confirmed) {
      return;
    }

    this.store.dispatch(
      AvailabilityActions
        .deleteSlot({
          slotId: slot.id,
        }),
    );
  }

  protected reloadMySlots(): void {
    this.store.dispatch(
      AvailabilityActions
        .loadMySlots(),
    );
  }

  protected formatSlotDate(
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
    ).format(
      new Date(value),
    );
  }

  protected formatSlotTime(
    value: string,
  ): string {
    return new Intl.DateTimeFormat(
      'sr-Latn-RS',
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    ).format(
      new Date(value),
    );
  }

  protected isPastSlot(
    slot: AvailabilitySlot,
  ): boolean {
    return (
      new Date(
        slot.startsAt,
      ).getTime() <= Date.now()
    );
  }

  protected logout(): void {
    this.store.dispatch(
      AuthActions.logout(),
    );
  }

  private clearSelectedImage():
    void {
    this.revokeProfileImagePreview();

    this.selectedProfileImage.set(
      null,
    );

    this.profileImagePreviewUrl.set(
      null,
    );
  }

  private revokeProfileImagePreview():
    void {
    const previewUrl =
      this.profileImagePreviewUrl();

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl,
      );
    }
  }

  private getLocalDateValue(
    date: Date,
  ): string {
    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1,
      ).padStart(
        2,
        '0',
      );

    const day =
      String(
        date.getDate(),
      ).padStart(
        2,
        '0',
      );

    return `${year}-${month}-${day}`;
  }
}