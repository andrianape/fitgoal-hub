import {
  HttpErrorResponse,
} from '@angular/common/http';
import {
  inject,
  Injectable,
} from '@angular/core';
import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';
import {
  catchError,
  map,
  mergeMap,
  of,
  switchMap,
} from 'rxjs';
import {
  UsersService,
} from '../../core/services/users.service';
import {
  AdminUsersActions,
} from './admin-users.actions';

@Injectable()
export class AdminUsersEffects {
  private readonly actions$ =
    inject(Actions);

  private readonly usersService =
    inject(UsersService);

  readonly loadUsers$ =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(
          AdminUsersActions.loadUsers,
        ),

        switchMap(() => {
          return this.usersService
            .findAll()
            .pipe(
              map((users) => {
                return AdminUsersActions
                  .loadUsersSuccess({
                    users,
                  });
              }),

              catchError(
                (error: unknown) => {
                  return of(
                    AdminUsersActions
                      .loadUsersFailure({
                        error:
                          this.getErrorMessage(
                            error,
                            'Korisnike trenutno nije moguće učitati.',
                          ),
                      }),
                  );
                },
              ),
            );
        }),
      );
    });

  readonly updateUserRole$ =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(
          AdminUsersActions
            .updateUserRole,
        ),

        mergeMap(
          ({
            userId,
            role,
          }) => {
            return this.usersService
              .updateRole(
                userId,
                {
                  role,
                },
              )
              .pipe(
                map((user) => {
                  return AdminUsersActions
                    .updateUserRoleSuccess({
                      user,
                    });
                }),

                catchError(
                  (error: unknown) => {
                    return of(
                      AdminUsersActions
                        .updateUserRoleFailure({
                          error:
                            this.getErrorMessage(
                              error,
                              'Ulogu korisnika trenutno nije moguće promeniti.',
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

  readonly updateUserStatus$ =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(
          AdminUsersActions
            .updateUserStatus,
        ),

        mergeMap(
          ({
            userId,
            isActive,
          }) => {
            return this.usersService
              .updateStatus(
                userId,
                {
                  isActive,
                },
              )
              .pipe(
                map((user) => {
                  return AdminUsersActions
                    .updateUserStatusSuccess({
                      user,
                    });
                }),

                catchError(
                  (error: unknown) => {
                    return of(
                      AdminUsersActions
                        .updateUserStatusFailure({
                          error:
                            this.getErrorMessage(
                              error,
                              'Status korisnika trenutno nije moguće promeniti.',
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

  readonly deleteUser$ =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(
          AdminUsersActions.deleteUser,
        ),

        mergeMap(({ userId }) => {
          return this.usersService
            .remove(userId)
            .pipe(
              map(() => {
                return AdminUsersActions
                  .deleteUserSuccess({
                    userId,
                  });
              }),

              catchError(
                (error: unknown) => {
                  return of(
                    AdminUsersActions
                      .deleteUserFailure({
                        error:
                          this.getErrorMessage(
                            error,
                            'Korisnika trenutno nije moguće obrisati.',
                          ),
                      }),
                  );
                },
              ),
            );
        }),
      );
    });

  private getErrorMessage(
    error: unknown,
    fallbackMessage: string,
  ): string {
    if (
      error instanceof
      HttpErrorResponse
    ) {
      const message: unknown =
        error.error?.message;

      if (typeof message === 'string') {
        return message;
      }

      if (Array.isArray(message)) {
        return message.join(' ');
      }
    }

    return fallbackMessage;
  }
}