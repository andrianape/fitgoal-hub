import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';
import {
  catchError,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AuthStorageService } from '../../core/services/auth-storage.service';
import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService =
    inject(AuthService);
  private readonly authStorage =
    inject(AuthStorageService);
  private readonly router = inject(Router);

  readonly login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.login),

      switchMap(({ credentials }) => {
        return this.authService
          .login(credentials)
          .pipe(
            tap((response) => {
              this.authStorage.saveSession(
                response,
              );
            }),

            map((response) => {
              return AuthActions.loginSuccess({
                user: response.user,
                accessToken:
                  response.accessToken,
              });
            }),

            catchError((error: unknown) => {
              return of(
                AuthActions.loginFailure({
                  error:
                    this.getErrorMessage(
                      error,
                    ),
                }),
              );
            }),
          );
      }),
    );
  });

  readonly loginSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthActions.loginSuccess),

        tap(() => {
          void this.router.navigate([
            '/professionals',
          ]);
        }),
      );
    },
    {
      dispatch: false,
    },
  );

  readonly restoreSession$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthActions.restoreSession),

        map(() => {
          const session =
            this.authStorage.getSession();

          if (!session) {
            return AuthActions
              .restoreSessionFinished();
          }

          return AuthActions
            .restoreSessionSuccess({
              user: session.user,
              accessToken:
                session.accessToken,
            });
        }),
      );
    },
  );

  readonly logout$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthActions.logout),

        tap(() => {
          this.authStorage.clearSession();

          void this.router.navigate(['/']);
        }),
      );
    },
    {
      dispatch: false,
    },
  );

  private getErrorMessage(
    error: unknown,
  ): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.message;

      if (typeof message === 'string') {
        return message;
      }

      if (Array.isArray(message)) {
        return message.join(' ');
      }
    }

    return 'Prijava trenutno nije moguća. Pokušaj ponovo.';
  }
}