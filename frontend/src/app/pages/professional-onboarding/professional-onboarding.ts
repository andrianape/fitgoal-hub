import {
  Component,
  computed,
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
  RouterLink,
} from '@angular/router';
import {
  Store,
} from '@ngrx/store';
import {
  CreateProfessionalProfileRequest,
} from '../../core/models/professional.model';
import {
  selectCurrentUser,
} from '../../store/auth/auth.selectors';
import {
  ProfessionalsActions,
} from '../../store/professionals/professionals.actions';
import {
  selectOwnProfessionalProfile,
  selectOwnProfessionalProfileError,
  selectOwnProfessionalProfileLoaded,
  selectOwnProfessionalProfileLoading,
  selectProfessionalProfileSaveError,
  selectProfessionalProfileSaveSuccessful,
  selectProfessionalProfileSaving,
} from '../../store/professionals/professionals.selectors';

@Component({
  selector:
    'app-professional-onboarding',

  imports: [
    ReactiveFormsModule,
    RouterLink,
  ],

  templateUrl:
    './professional-onboarding.html',

  styleUrl:
    './professional-onboarding.scss',
})
export class ProfessionalOnboarding
  implements OnInit, OnDestroy
{
  private readonly store =
    inject(Store);

  private readonly formBuilder =
    inject(FormBuilder);

  protected readonly currentYear =
    new Date().getFullYear();

  protected readonly currentUser =
    this.store.selectSignal(
      selectCurrentUser,
    );

  protected readonly ownProfile =
    this.store.selectSignal(
      selectOwnProfessionalProfile,
    );

  protected readonly profileLoading =
    this.store.selectSignal(
      selectOwnProfessionalProfileLoading,
    );

  protected readonly profileLoaded =
    this.store.selectSignal(
      selectOwnProfessionalProfileLoaded,
    );

  protected readonly profileLoadError =
    this.store.selectSignal(
      selectOwnProfessionalProfileError,
    );

  protected readonly saving =
    this.store.selectSignal(
      selectProfessionalProfileSaving,
    );

  protected readonly saveSuccessful =
    this.store.selectSignal(
      selectProfessionalProfileSaveSuccessful,
    );

  protected readonly saveError =
    this.store.selectSignal(
      selectProfessionalProfileSaveError,
    );

  protected readonly localError =
    signal<string | null>(null);

  protected readonly isProfessional =
    computed(() => {
      const role =
        this.currentUser()?.role;

      return (
        role === 'trainer' ||
        role === 'nutritionist'
      );
    });

  protected readonly isTrainer =
    computed(() => {
      return (
        this.currentUser()?.role ===
        'trainer'
      );
    });

  protected readonly roleLabel =
    computed(() => {
      if (this.isTrainer()) {
        return 'ličnog trenera';
      }

      return 'nutricioniste';
    });

  protected readonly onboardingForm =
    this.formBuilder.group({
      biography:
        this.formBuilder
          .nonNullable.control(
            '',
            [
              Validators.required,
              Validators.minLength(20),
              Validators.maxLength(2000),
            ],
          ),

      yearsOfExperience:
        this.formBuilder.control<
          number | null
        >(
          null,
          [
            Validators.required,
            Validators.min(0),
            Validators.max(60),
          ],
        ),

      pricePerSession:
        this.formBuilder.control<
          number | null
        >(
          null,
          [
            Validators.required,
            Validators.min(0),
            Validators.max(1000000),
          ],
        ),

      specialties:
        this.formBuilder
          .nonNullable.control(
            '',
            [
              Validators.required,
            ],
          ),

      workplaceName:
        this.formBuilder
          .nonNullable.control(
            '',
            [
              Validators.maxLength(200),
            ],
          ),

      address:
        this.formBuilder
          .nonNullable.control(
            '',
            [
              Validators.required,
              Validators.minLength(5),
              Validators.maxLength(300),
            ],
          ),

      qualificationType:
        this.formBuilder
          .nonNullable.control(
            '',
            [
              Validators.required,
              Validators.minLength(2),
              Validators.maxLength(100),
            ],
          ),

      qualificationName:
        this.formBuilder
          .nonNullable.control(
            '',
            [
              Validators.required,
              Validators.minLength(2),
              Validators.maxLength(200),
            ],
          ),

      issuingInstitution:
        this.formBuilder
          .nonNullable.control(
            '',
            [
              Validators.required,
              Validators.minLength(2),
              Validators.maxLength(200),
            ],
          ),

      qualificationYear:
        this.formBuilder.control<
          number | null
        >(
          null,
          [
            Validators.required,
            Validators.min(1950),
            Validators.max(
              this.currentYear,
            ),
          ],
        ),

      credentialNumber:
        this.formBuilder
          .nonNullable.control(
            '',
            [
              Validators.required,
              Validators.minLength(2),
              Validators.maxLength(100),
            ],
          ),
    });

  ngOnInit(): void {
    this.store.dispatch(
      ProfessionalsActions
        .clearOwnProfessionalProfileState(),
    );

    if (this.isProfessional()) {
      this.store.dispatch(
        ProfessionalsActions
          .loadOwnProfessionalProfile(),
      );
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(
      ProfessionalsActions
        .clearOwnProfessionalProfileState(),
    );
  }

  protected submit(): void {
    this.localError.set(null);

    if (!this.isProfessional()) {
      this.localError.set(
        'Samo trener ili nutricionista može napraviti profesionalni profil.',
      );

      return;
    }

    if (
      this.onboardingForm.invalid
    ) {
      this.onboardingForm
        .markAllAsTouched();

      this.localError.set(
        'Proveri označena polja i dopuni obavezne podatke.',
      );

      return;
    }

    const formValue =
      this.onboardingForm
        .getRawValue();

    if (
      formValue.yearsOfExperience ===
        null ||
      formValue.pricePerSession ===
        null ||
      formValue.qualificationYear ===
        null
    ) {
      this.localError.set(
        'Unesi sve brojčane podatke.',
      );

      return;
    }

    const workplaceName =
      formValue.workplaceName.trim();

    if (
      this.isTrainer() &&
      workplaceName.length < 2
    ) {
      this.localError.set(
        'Lični trener mora uneti naziv teretane ili mesta rada.',
      );

      this.onboardingForm.controls[
        'workplaceName'
      ].markAsTouched();

      return;
    }

    const specialties =
      this.parseSpecialties(
        formValue.specialties,
      );

    if (
      specialties.length === 0
    ) {
      this.localError.set(
        'Unesi najmanje jednu specijalnost.',
      );

      return;
    }

    if (
      specialties.length > 20
    ) {
      this.localError.set(
        'Možeš uneti najviše 20 specijalnosti.',
      );

      return;
    }

    const data:
      CreateProfessionalProfileRequest = {
        biography:
          formValue.biography.trim(),

        yearsOfExperience:
          Number(
            formValue
              .yearsOfExperience,
          ),

        pricePerSession:
          Number(
            formValue
              .pricePerSession,
          ),

        specialties,

        address:
          formValue.address.trim(),

        qualificationType:
          formValue
            .qualificationType
            .trim(),

        qualificationName:
          formValue
            .qualificationName
            .trim(),

        issuingInstitution:
          formValue
            .issuingInstitution
            .trim(),

        qualificationYear:
          Number(
            formValue
              .qualificationYear,
          ),

        credentialNumber:
          formValue
            .credentialNumber
            .trim(),
      };

    if (
      workplaceName.length > 0
    ) {
      data.workplaceName =
        workplaceName;
    }

    this.store.dispatch(
      ProfessionalsActions
        .createProfessionalProfile({
          data,
        }),
    );
  }

  protected hasError(
    controlName:
      | 'biography'
      | 'yearsOfExperience'
      | 'pricePerSession'
      | 'specialties'
      | 'workplaceName'
      | 'address'
      | 'qualificationType'
      | 'qualificationName'
      | 'issuingInstitution'
      | 'qualificationYear'
      | 'credentialNumber',
    errorName: string,
  ): boolean {
    const control =
      this.onboardingForm.controls[
        controlName
      ];

    return (
      control.touched &&
      control.hasError(
        errorName,
      )
    );
  }

  protected retryProfileLoad():
    void {
    this.store.dispatch(
      ProfessionalsActions
        .loadOwnProfessionalProfile(),
    );
  }

  private parseSpecialties(
    value: string,
  ): string[] {
    return [
      ...new Set(
        value
          .split(',')
          .map(
            (specialty) =>
              specialty.trim(),
          )
          .filter(
            (specialty) =>
              specialty.length > 0,
          ),
      ),
    ];
  }
}