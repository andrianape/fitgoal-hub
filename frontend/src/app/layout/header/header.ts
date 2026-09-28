import {
  Component,
  computed,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import {
  Store,
} from '@ngrx/store';
import {
  AuthActions,
} from '../../store/auth/auth.actions';
import {
  selectCurrentUser,
  selectIsAuthenticated,
} from '../../store/auth/auth.selectors';
import {
  NotificationsActions,
} from '../../store/notifications/notifications.actions';
import {
  selectLoading as selectNotificationsLoading,
  selectNotifications,
  selectUnreadCount,
} from '../../store/notifications/notifications.selectors';

@Component({
  selector: 'app-header',

  imports: [
    RouterLink,
    RouterLinkActive,
  ],

  templateUrl: './header.html',

  styleUrl: './header.scss',
})
export class Header implements OnInit {
  private readonly store =
    inject(Store);

  protected readonly isMenuOpen =
    signal(false);

  protected readonly isNotificationsOpen =
    signal(false);

  protected readonly currentUser =
    this.store.selectSignal(
      selectCurrentUser,
    );

  protected readonly isAuthenticated =
    this.store.selectSignal(
      selectIsAuthenticated,
    );

  protected readonly notifications =
    this.store.selectSignal(
      selectNotifications,
    );

  protected readonly unreadCount =
    this.store.selectSignal(
      selectUnreadCount,
    );

  protected readonly notificationsLoading =
    this.store.selectSignal(
      selectNotificationsLoading,
    );

  protected readonly isClient =
    computed(() => {
      return (
        this.currentUser()?.role ===
        'client'
      );
    });

  protected readonly isProfessional =
    computed(() => {
      const role =
        this.currentUser()?.role;

      return (
        role === 'trainer' ||
        role === 'nutritionist'
      );
    });

  protected readonly isTrainer =
    computed(() => {
      return (
        this.currentUser()?.role ===
        'trainer'
      );
    });

  protected readonly isNutritionist =
    computed(() => {
      return (
        this.currentUser()?.role ===
        'nutritionist'
      );
    });

  protected readonly isAdmin =
    computed(() => {
      return (
        this.currentUser()?.role ===
        'admin'
      );
    });

  ngOnInit(): void {
    this.store.dispatch(
      AuthActions.restoreSession(),
    );
  }

  protected toggleMenu(): void {
    this.isNotificationsOpen.set(false);

    this.isMenuOpen.update(
      (isOpen) => !isOpen,
    );
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  protected closeNavigation(): void {
    this.closeMenu();
    this.closeNotifications();
  }

  protected toggleNotifications(
    event: MouseEvent,
  ): void {
    event.stopPropagation();

    this.closeMenu();

    this.isNotificationsOpen.update(
      (isOpen) => !isOpen,
    );
  }

  protected closeNotifications(): void {
    this.isNotificationsOpen.set(false);
  }

  protected markAsRead(
    notificationId: number,
  ): void {
    this.store.dispatch(
      NotificationsActions.markAsRead({
        notificationId,
      }),
    );
  }

  protected markAllAsRead(): void {
    if (this.unreadCount() === 0) {
      return;
    }

    this.store.dispatch(
      NotificationsActions
        .markAllAsRead(),
    );
  }

  protected formatNotificationDate(
    createdAt: string,
  ): string {
    const date =
      new Date(createdAt);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '';
    }

    return new Intl.DateTimeFormat(
      'sr-Latn-RS',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    ).format(date);
  }

  protected logout(): void {
    this.closeMenu();
    this.closeNotifications();

    this.store.dispatch(
      AuthActions.logout(),
    );
  }

  @HostListener('document:click')
  protected onDocumentClick(): void {
    this.closeNotifications();
  }

  @HostListener(
    'document:keydown.escape',
  )
  protected onEscapePressed(): void {
    this.closeNotifications();
    this.closeMenu();
  }
}