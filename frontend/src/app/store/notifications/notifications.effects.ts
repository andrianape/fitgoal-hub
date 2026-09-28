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
  tap,
} from 'rxjs';
import {
  NotificationSocketService,
} from '../../core/services/notification-socket.service';
import {
  NotificationsService,
} from '../../core/services/notifications.service';
import {
  AuthActions,
} from '../auth/auth.actions';
import {
  NotificationsActions,
} from './notifications.actions';

@Injectable()
export class NotificationsEffects {
  private readonly actions$ =
    inject(Actions);

  private readonly notificationsService =
    inject(NotificationsService);

  private readonly notificationSocketService =
    inject(NotificationSocketService);

  readonly connectSocket$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(
          AuthActions.loginSuccess,
          AuthActions.restoreSessionSuccess,
        ),

        tap(({
          accessToken,
          user,
        }) => {
          this.notificationSocketService
            .connect(
              accessToken,
              user.role,
            );
        }),
      );
    },
    {
      dispatch: false,
    },
  );

  readonly loadAfterAuthentication$ =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(
          AuthActions.loginSuccess,
          AuthActions.restoreSessionSuccess,
        ),

        mergeMap(() => {
          return [
            NotificationsActions
              .loadNotifications(),

            NotificationsActions
              .loadUnreadCount(),
          ];
        }),
      );
    });

  readonly clearAfterLogout$ =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(
          AuthActions.logout,
        ),

        tap(() => {
          this.notificationSocketService
            .disconnect();
        }),

        map(() => {
          return NotificationsActions
            .clearNotifications();
        }),
      );
    });

  readonly loadNotifications$ =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(
          NotificationsActions
            .loadNotifications,
        ),

        switchMap(() => {
          return this.notificationsService
            .findMine()
            .pipe(
              map((notifications) => {
                return NotificationsActions
                  .loadNotificationsSuccess({
                    notifications,
                  });
              }),

              catchError((
                error: unknown,
              ) => {
                return of(
                  NotificationsActions
                    .loadNotificationsFailure({
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

  readonly loadUnreadCount$ =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(
          NotificationsActions
            .loadUnreadCount,
        ),

        switchMap(() => {
          return this.notificationsService
            .countUnread()
            .pipe(
              map(({ count }) => {
                return NotificationsActions
                  .loadUnreadCountSuccess({
                    count,
                  });
              }),

              catchError((
                error: unknown,
              ) => {
                return of(
                  NotificationsActions
                    .loadUnreadCountFailure({
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

  readonly markAsRead$ =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(
          NotificationsActions
            .markAsRead,
        ),

        switchMap(({
          notificationId,
        }) => {
          return this.notificationsService
            .markAsRead(notificationId)
            .pipe(
              map((notification) => {
                return NotificationsActions
                  .markAsReadSuccess({
                    notification,
                  });
              }),

              catchError((
                error: unknown,
              ) => {
                return of(
                  NotificationsActions
                    .markAsReadFailure({
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

  readonly markAllAsRead$ =
    createEffect(() => {
      return this.actions$.pipe(
        ofType(
          NotificationsActions
            .markAllAsRead,
        ),

        switchMap(() => {
          return this.notificationsService
            .markAllAsRead()
            .pipe(
              map(() => {
                return NotificationsActions
                  .markAllAsReadSuccess();
              }),

              catchError((
                error: unknown,
              ) => {
                return of(
                  NotificationsActions
                    .markAllAsReadFailure({
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

  private getErrorMessage(
    error: unknown,
  ): string {
    if (
      error instanceof
      HttpErrorResponse
    ) {
      const message: unknown =
        error.error?.message;

      if (Array.isArray(message)) {
        return message.join(' ');
      }

      if (typeof message === 'string') {
        return message;
      }
    }

    return (
      'Nije moguće učitati obaveštenja.'
    );
  }
}