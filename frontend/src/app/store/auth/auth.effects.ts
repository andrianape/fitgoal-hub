import {
  HttpErrorResponse,
} from '@angular/common/http';
import {
  inject,
  Injectable,
} from '@angular/core';
import {
  Router,
} from '@angular/router';
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
import {
  AuthService,
} from '../../core/services/auth.service';
import {
  AuthStorageService,
} from '../../core/services/auth-storage.service';
import {
  UsersService,
} from '../../core/services/users.service';
import {
  AuthActions,
} from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ =
    inject(Actions);

  private readonly authService =
    inject(AuthService);

  private readonly authStorage =
    inject(AuthStorageService);

  private readonly usersService =
    inject(UsersService);

  private readonly router =
    inject(Router);

  readonly login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.login),

      switchMap(({ credentials }) => {
        return this.authService
          .login(credentials)
          .pipe(
            tap((response) => {
              this.authStorage
                .saveSession(response);
            }),

            map((response) => {
              return AuthActions
                .loginSuccess({
                  user: response.user,
                  accessToken:
                    response.accessToken,
                });
            }),

            catchError(
              (error: unknown) => {
                return of(
                  AuthActions
                    .loginFailure({
                      error:
                        this.getErrorMessage(
                          error,
                        ),
                    }),
                );
              },
            ),
          );
      }),
    );
  });

  readonly loginSuccess$ =
    createEffect(
      () => {
        return this.actions$.pipe(
          ofType(
            AuthActions.loginSuccess,
          ),

          tap(() => {
            void this.router.navigate([
              '/my-profile',
            ]);
          }),
        );
      },
      {
        dispatch: false,
      },
    );

  readonly register$ =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(AuthActions.register),

        switchMap(({ data }) => {
          return this.authService
            .register(data)
            .pipe(
              tap((response) => {
                this.authStorage
                  .saveSession(
                    response,
                  );
              }),

              map((response) => {
                return AuthActions
                  .registerSuccess({
                    user:
                      response.user,
                    accessToken:
                      response
                        .accessToken,
                  });
              }),

              catchError(
                (error: unknown) => {
                  return of(
                    AuthActions
                      .registerFailure({
                        error:
                          this.getErrorMessage(
                            error,
                          ),
                      }),
                  );
                },
              ),
            );
        }),
      );
    });

  readonly registerSuccess$ =
    createEffect(
      () => {
        return this.actions$.pipe(
          ofType(
            AuthActions
              .registerSuccess,
          ),

          tap(({ user }) => {
            if (
              user.role ===
                'trainer' ||
              user.role ===
                'nutritionist'
            ) {
              void this.router.navigate([
                '/professional-onboarding',
              ]);

              return;
            }

            void this.router.navigate([
              '/my-profile',
            ]);
          }),
        );
      },
      {
        dispatch: false,
      },
    );

  readonly restoreSession$ =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(
          AuthActions.restoreSession,
        ),

        map(() => {
          const session =
            this.authStorage
              .getSession();

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
    });

  readonly updateProfile$ =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(
          AuthActions.updateProfile,
        ),

        switchMap(
          ({
            userId,
            data,
          }) => {
            return this.usersService
              .updateProfile(
                userId,
                data,
              )
              .pipe(
                tap((user) => {
                  this.authStorage
                    .updateStoredUser(
                      user,
                    );
                }),

                map((user) => {
                  return AuthActions
                    .updateProfileSuccess({
                      user,
                    });
                }),

                catchError(
                  (error: unknown) => {
                    return of(
                      AuthActions
                        .updateProfileFailure({
                          error:
                            this.getErrorMessage(
                              error,
                            ),
                        }),
                    );
                  },
                ),
              );
          },
        ),
      );
    });

  readonly uploadProfileImage$ =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(
          AuthActions
            .uploadProfileImage,
        ),

        switchMap(({ file }) => {
          return this.usersService
            .uploadProfileImage(file)
            .pipe(
              tap((user) => {
                this.authStorage
                  .updateStoredUser(
                    user,
                  );
              }),

              map((user) => {
                return AuthActions
                  .uploadProfileImageSuccess({
                    user,
                  });
              }),

              catchError(
                (error: unknown) => {
                  return of(
                    AuthActions
                      .uploadProfileImageFailure({
                        error:
                          this.getErrorMessage(
                            error,
                          ),
                      }),
                  );
                },
              ),
            );
        }),
      );
    });

  readonly removeProfileImage$ =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(
          AuthActions
            .removeProfileImage,
        ),

        switchMap(() => {
          return this.usersService
            .removeProfileImage()
            .pipe(
              tap(() => {
                const session =
                  this.authStorage
                    .getSession();

                if (!session) {
                  return;
                }

                this.authStorage
                  .updateStoredUser({
                    ...session.user,
                    profileImageUrl:
                      null,
                  });
              }),

              map(() => {
                return AuthActions
                  .removeProfileImageSuccess();
              }),

              catchError(
                (error: unknown) => {
                  return of(
                    AuthActions
                      .removeProfileImageFailure({
                        error:
                          this.getErrorMessage(
                            error,
                          ),
                      }),
                  );
                },
              ),
            );
        }),
      );
    });

  readonly logout$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthActions.logout),

        tap(() => {
          this.authStorage
            .clearSession();

          void this.router.navigate([
            '/',
          ]);
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
    if (
      error instanceof
      HttpErrorResponse
    ) {
      const message: unknown =
        error.error?.message;

      if (
        typeof message === 'string'
      ) {
        return message;
      }

      if (Array.isArray(message)) {
        return message.join(' ');
      }
    }

    return 'Zahtev trenutno nije moguće izvršiti. Pokušaj ponovo.';
  }
}