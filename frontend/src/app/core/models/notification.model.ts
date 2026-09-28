export type NotificationType =
  | 'appointment_requested'
  | 'appointment_confirmed'
  | 'appointment_rejected'
  | 'appointment_cancelled'
  | 'appointment_completed'
  | 'plan_created';

export interface NotificationAppointment {
  id: number;
}

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  appointment: NotificationAppointment | null;
}

export interface UnreadNotificationCount {
  count: number;
}