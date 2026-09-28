import {
  createFeature,
  createReducer,
  on,
} from '@ngrx/store';
import { Notification } from '../../core/models/notification.model';
import { NotificationsActions } from './notifications.actions';

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  loaded: false,
  error: null,
};

export const notificationsFeature =
  createFeature({
    name: 'notifications',

    reducer: createReducer(
      initialState,

      on(
        NotificationsActions.loadNotifications,
        (state): NotificationsState => ({
          ...state,
          loading: true,
          error: null,
        }),
      ),

      on(
        NotificationsActions.loadNotificationsSuccess,
        (state, { notifications }): NotificationsState => ({
          ...state,
          notifications,
          unreadCount: notifications.filter(
            (notification) => !notification.isRead,
          ).length,
          loading: false,
          loaded: true,
          error: null,
        }),
      ),

      on(
        NotificationsActions.loadNotificationsFailure,
        (state, { error }): NotificationsState => ({
          ...state,
          loading: false,
          loaded: true,
          error,
        }),
      ),

      on(
        NotificationsActions.loadUnreadCountSuccess,
        (state, { count }): NotificationsState => ({
          ...state,
          unreadCount: count,
        }),
      ),

      on(
        NotificationsActions.loadUnreadCountFailure,
        (state, { error }): NotificationsState => ({
          ...state,
          error,
        }),
      ),

      on(
        NotificationsActions.markAsReadSuccess,
        (state, { notification }): NotificationsState => ({
          ...state,

          notifications: state.notifications.map(
            (currentNotification) =>
              currentNotification.id === notification.id
                ? notification
                : currentNotification,
          ),

          unreadCount: Math.max(
            0,
            state.unreadCount -
              (state.notifications.some(
                (currentNotification) =>
                  currentNotification.id ===
                    notification.id &&
                  !currentNotification.isRead,
              )
                ? 1
                : 0),
          ),
        }),
      ),

      on(
        NotificationsActions.markAsReadFailure,
        NotificationsActions.markAllAsReadFailure,
        (state, { error }): NotificationsState => ({
          ...state,
          error,
        }),
      ),

      on(
        NotificationsActions.markAllAsReadSuccess,
        (state): NotificationsState => ({
          ...state,

          notifications: state.notifications.map(
            (notification) => ({
              ...notification,
              isRead: true,
            }),
          ),

          unreadCount: 0,
        }),
      ),

      on(
        NotificationsActions.notificationReceived,
        (state, { notification }): NotificationsState => {
          const alreadyExists =
            state.notifications.some(
              (currentNotification) =>
                currentNotification.id ===
                notification.id,
            );

          if (alreadyExists) {
            return state;
          }

          return {
            ...state,
            notifications: [
              notification,
              ...state.notifications,
            ],
            unreadCount:
              state.unreadCount +
              (notification.isRead ? 0 : 1),
          };
        },
      ),

      on(
        NotificationsActions.clearNotifications,
        (): NotificationsState => initialState,
      ),
    ),
  });