import {
  createActionGroup,
  emptyProps,
  props,
} from '@ngrx/store';
import { Notification } from '../../core/models/notification.model';

export const NotificationsActions =
  createActionGroup({
    source: 'Notifications',

    events: {
      'Load Notifications': emptyProps(),

      'Load Notifications Success': props<{
        notifications: Notification[];
      }>(),

      'Load Notifications Failure': props<{
        error: string;
      }>(),

      'Load Unread Count': emptyProps(),

      'Load Unread Count Success': props<{
        count: number;
      }>(),

      'Load Unread Count Failure': props<{
        error: string;
      }>(),

      'Mark As Read': props<{
        notificationId: number;
      }>(),

      'Mark As Read Success': props<{
        notification: Notification;
      }>(),

      'Mark As Read Failure': props<{
        error: string;
      }>(),

      'Mark All As Read': emptyProps(),

      'Mark All As Read Success': emptyProps(),

      'Mark All As Read Failure': props<{
        error: string;
      }>(),

      'Notification Received': props<{
        notification: Notification;
      }>(),

      'Clear Notifications': emptyProps(),
    },
  });