import {
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth/auth.actions';
import {
  selectAuthError,
  selectAuthLoading,
} from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit, OnDestroy {
  private readonly formBuilder =
    inject(FormBuilder);

  private readonly store = inject(Store);

  protected readonly loading =
    this.store.selectSignal(
      selectAuthLoading,
    );

  protected readonly error =
    this.store.selectSignal(
      selectAuthError,
    );

  protected readonly loginForm =
    this.formBuilder.nonNullable.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
        ],
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
        ],
      ],
    });

  ngOnInit(): void {
    this.store.dispatch(
      AuthActions.clearError(),
    );
  }

  ngOnDestroy(): void {
    this.store.dispatch(
      AuthActions.clearError(),
    );
  }

  protected submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();

      return;
    }

    this.store.dispatch(
      AuthActions.login({
        credentials:
          this.loginForm.getRawValue(),
      }),
    );
  }

  protected hasError(
    controlName: 'email' | 'password',
    errorName: string,
  ): boolean {
    const control =
      this.loginForm.controls[controlName];

    return (
      control.touched &&
      control.hasError(errorName)
    );
  }
}