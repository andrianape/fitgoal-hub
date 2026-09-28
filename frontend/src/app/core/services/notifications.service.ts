import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Notification,
  UnreadNotificationCount,
} from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/api/notifications';

  findMine(): Observable<Notification[]> {
    return this.http.get<Notification[]>(
      `${this.apiUrl}/me`,
    );
  }

  countUnread(): Observable<UnreadNotificationCount> {
    return this.http.get<UnreadNotificationCount>(
      `${this.apiUrl}/unread-count`,
    );
  }

  markAsRead(
    notificationId: number,
  ): Observable<Notification> {
    return this.http.patch<Notification>(
      `${this.apiUrl}/${notificationId}/read`,
      {},
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/read-all`,
      {},
    );
  }
}