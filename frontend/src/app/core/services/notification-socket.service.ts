import {
  inject,
  Injectable,
} from '@angular/core';
import {
  Store,
} from '@ngrx/store';
import {
  io,
  Socket,
} from 'socket.io-client';
import {
  Notification,
} from '../models/notification.model';
import {
  UserRole,
} from '../models/user.model';
import {
  AppointmentsActions,
} from '../../store/appointments/appointments.actions';
import {
  AvailabilityActions,
} from '../../store/availability/availability.actions';
import {
  NotificationsActions,
} from '../../store/notifications/notifications.actions';
import {
  PlansActions,
} from '../../store/plans/plans.actions';

@Injectable({
  providedIn: 'root',
})
export class NotificationSocketService {
  private readonly store = inject(Store);

  private socket: Socket | null = null;

  private connectedToken: string | null = null;

  private connectedRole: UserRole | null = null;

  connect(
    accessToken: string,
    userRole: UserRole,
  ): void {
    if (
      this.socket?.connected &&
      this.connectedToken === accessToken &&
      this.connectedRole === userRole
    ) {
      return;
    }

    this.disconnect();

    this.connectedToken = accessToken;
    this.connectedRole = userRole;

    this.socket = io(
      'http://localhost:3000/notifications',
      {
        transports: [
          'websocket',
        ],

        auth: {
          token: accessToken,
        },
      },
    );

    this.socket.on(
      'notification:new',
      (notification: Notification) => {
        this.handleNotification(
          notification,
          userRole,
        );
      },
    );

    this.socket.on(
      'connect_error',
      (error: Error) => {
        console.error(
          'Socket veza za obaveštenja nije uspostavljena:',
          error.message,
        );
      },
    );
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();

      this.socket.disconnect();

      this.socket = null;
    }

    this.connectedToken = null;
    this.connectedRole = null;
  }

  private handleNotification(
    notification: Notification,
    userRole: UserRole,
  ): void {
    this.store.dispatch(
      NotificationsActions.notificationReceived({
        notification,
      }),
    );

    if (notification.appointment) {
      this.store.dispatch(
        AppointmentsActions
          .loadMyAppointments(),
      );
    }

    if (
      this.isProfessionalRole(userRole) &&
      (
        notification.type ===
          'appointment_requested' ||
        notification.type ===
          'appointment_cancelled'
      )
    ) {
      this.store.dispatch(
        AvailabilityActions.loadMySlots(),
      );
    }

    if (
      notification.type ===
      'plan_created'
    ) {
      this.store.dispatch(
        PlansActions.loadMyPlans(),
      );
    }
  }

  private isProfessionalRole(
    role: UserRole,
  ): boolean {
    return (
      role === 'trainer' ||
      role === 'nutritionist'
    );
  }
}