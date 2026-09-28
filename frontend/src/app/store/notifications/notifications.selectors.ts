import { notificationsFeature } from './notifications.reducer';

export const {
  selectNotificationsState,
  selectNotifications,
  selectUnreadCount,
  selectLoading,
  selectLoaded,
  selectError,
} = notificationsFeature;