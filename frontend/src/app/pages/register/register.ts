import {
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  RouterLink,
} from '@angular/router';
import {
  Store,
} from '@ngrx/store';
import {
  RegisterData,
} from '../../core/models/auth.model';
import {
  AuthActions,
} from '../../store/auth/auth.actions';
import {
  selectAuthError,
  selectAuthLoading,
} from '../../store/auth/auth.selectors';
import {
  CitiesActions,
} from '../../store/cities/cities.actions';
import {
  selectCities,
  selectLoaded as selectCitiesLoaded,
} from '../../store/cities/cities.selectors';

const passwordsMatchValidator:
  ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const passwordControl =
      control.get('password');

    const confirmPasswordControl =
      control.get('confirmPassword');

    const password =
      passwordControl?.value;

    const confirmPassword =
      confirmPasswordControl?.value;

    if (
      typeof password !== 'string' ||
      typeof confirmPassword !== 'string'
    ) {
      return null;
    }

    if (
      password.length === 0 ||
      confirmPassword.length === 0
    ) {
      return null;
    }

    return password === confirmPassword
      ? null
      : {
          passwordsMismatch: true,
        };
  };

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register
  implements OnInit, OnDestroy
{
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly store =
    inject(Store);

  protected readonly loading =
    this.store.selectSignal(
      selectAuthLoading,
    );

  protected readonly error =
    this.store.selectSignal(
      selectAuthError,
    );

  protected readonly cities =
    this.store.selectSignal(
      selectCities,
    );

  protected readonly citiesLoaded =
    this.store.selectSignal(
      selectCitiesLoaded,
    );

  protected readonly registerForm =
    this.formBuilder.group(
      {
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
          >(
            null,
            [
              Validators.required,
            ],
          ),

        role:
          this.formBuilder
            .nonNullable.control<
              RegisterData['role']
            >(
              'client',
              [
                Validators.required,
              ],
            ),

        password:
          this.formBuilder
            .nonNullable.control(
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
            ),

        confirmPassword:
          this.formBuilder
            .nonNullable.control(
              '',
              [
                Validators.required,
              ],
            ),
      },
      {
        validators:
          passwordsMatchValidator,
      },
    );

  ngOnInit(): void {
    this.store.dispatch(
      AuthActions.clearError(),
    );

    if (!this.citiesLoaded()) {
      this.store.dispatch(
        CitiesActions.loadCities(),
      );
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(
      AuthActions.clearError(),
    );
  }

  protected submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm
        .markAllAsTouched();

      return;
    }

    const formValue =
      this.registerForm
        .getRawValue();

    if (formValue.cityId === null) {
      return;
    }

    const phoneNumber =
      formValue.phoneNumber.trim();

    const data: RegisterData = {
      firstName:
        formValue.firstName.trim(),

      lastName:
        formValue.lastName.trim(),

      email:
        formValue.email
          .trim()
          .toLowerCase(),

      password:
        formValue.password,

      cityId:
        formValue.cityId,

      role:
        formValue.role,
    };

    if (phoneNumber.length > 0) {
      data.phoneNumber =
        phoneNumber;
    }

    this.store.dispatch(
      AuthActions.register({
        data,
      }),
    );
  }

  protected hasError(
    controlName:
      | 'firstName'
      | 'lastName'
      | 'email'
      | 'phoneNumber'
      | 'cityId'
      | 'role'
      | 'password'
      | 'confirmPassword',
    errorName: string,
  ): boolean {
    const control =
      this.registerForm.controls[
        controlName
      ];

    return (
      control.touched &&
      control.hasError(errorName)
    );
  }

  protected hasPasswordMismatch():
    boolean {
    const confirmPassword =
      this.registerForm.controls[
        'confirmPassword'
      ];

    return (
      confirmPassword.touched &&
      this.registerForm.hasError(
        'passwordsMismatch',
      )
    );
  }
}