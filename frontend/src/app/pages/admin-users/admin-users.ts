import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormsModule,
} from '@angular/forms';
import {
  RouterLink,
} from '@angular/router';
import {
  Store,
} from '@ngrx/store';
import {
  User,
  UserRole,
} from '../../core/models/user.model';
import {
  AdminUsersActions,
} from '../../store/admin-users/admin-users.actions';
import {
  selectAdminUserDeletingId,
  selectAdminUsersError,
  selectAdminUsersLoading,
  selectAdminUsersOperationError,
  selectAdminUserUpdatingId,
  selectAllAdminUsers,
} from '../../store/admin-users/admin-users.selectors';
import {
  selectCurrentUser,
} from '../../store/auth/auth.selectors';

type UserStatusFilter =
  | 'all'
  | 'active'
  | 'inactive';

type UserRoleFilter =
  | 'all'
  | UserRole;

@Component({
  selector: 'app-admin-users',

  imports: [
    FormsModule,
    RouterLink,
  ],

  templateUrl:
    './admin-users.html',

  styleUrl:
    './admin-users.scss',
})
export class AdminUsers
  implements OnInit, OnDestroy
{
  private readonly store =
    inject(Store);

  protected readonly currentUser =
    this.store.selectSignal(
      selectCurrentUser,
    );

  protected readonly users =
    this.store.selectSignal(
      selectAllAdminUsers,
    );

  protected readonly loading =
    this.store.selectSignal(
      selectAdminUsersLoading,
    );

  protected readonly error =
    this.store.selectSignal(
      selectAdminUsersError,
    );

  protected readonly operationError =
    this.store.selectSignal(
      selectAdminUsersOperationError,
    );

  protected readonly updatingUserId =
    this.store.selectSignal(
      selectAdminUserUpdatingId,
    );

  protected readonly deletingUserId =
    this.store.selectSignal(
      selectAdminUserDeletingId,
    );

  protected readonly searchTerm =
    signal('');

  protected readonly selectedRole =
    signal<UserRoleFilter>('all');

  protected readonly selectedStatus =
    signal<UserStatusFilter>('all');

  protected readonly failedImageIds =
    signal<ReadonlySet<number>>(
      new Set<number>(),
    );

  protected readonly filteredUsers =
    computed(() => {
      const normalizedSearch =
        this.searchTerm()
          .trim()
          .toLowerCase();

      const role =
        this.selectedRole();

      const status =
        this.selectedStatus();

      return this.users().filter(
        (user) => {
          const fullName =
            `${user.firstName} ${user.lastName}`
              .toLowerCase();

          const matchesSearch =
            normalizedSearch.length === 0 ||
            fullName.includes(
              normalizedSearch,
            ) ||
            user.email
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesRole =
            role === 'all' ||
            user.role === role;

          const matchesStatus =
            status === 'all' ||
            (
              status === 'active' &&
              user.isActive
            ) ||
            (
              status === 'inactive' &&
              !user.isActive
            );

          return (
            matchesSearch &&
            matchesRole &&
            matchesStatus
          );
        },
      );
    });

  protected readonly totalUsers =
    computed(() => {
      return this.users().length;
    });

  protected readonly activeUsers =
    computed(() => {
      return this.users().filter(
        (user) => user.isActive,
      ).length;
    });

  protected readonly professionalUsers =
    computed(() => {
      return this.users().filter(
        (user) =>
          user.role === 'trainer' ||
          user.role === 'nutritionist',
      ).length;
    });

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.store.dispatch(
      AdminUsersActions
        .clearAdminUsers(),
    );
  }

  protected loadUsers(): void {
    this.store.dispatch(
      AdminUsersActions.loadUsers(),
    );
  }

  protected updateSearch(
    value: string,
  ): void {
    this.searchTerm.set(value);
  }

  protected updateRoleFilter(
    value: string,
  ): void {
    this.selectedRole.set(
      value as UserRoleFilter,
    );
  }

  protected updateStatusFilter(
    value: string,
  ): void {
    this.selectedStatus.set(
      value as UserStatusFilter,
    );
  }

  protected changeUserRole(
    user: User,
    event: Event,
  ): void {
    const selectElement =
      event.target as HTMLSelectElement;

    const role =
      selectElement.value as UserRole;

    if (role === user.role) {
      return;
    }

    if (this.isCurrentUser(user)) {
      selectElement.value =
        user.role;

      return;
    }

    const confirmed =
      window.confirm(
        `Da li sigurno želiš da promeniš ulogu korisnika ${user.firstName} ${user.lastName}?`,
      );

    if (!confirmed) {
      selectElement.value =
        user.role;

      return;
    }

    this.store.dispatch(
      AdminUsersActions
        .updateUserRole({
          userId: user.id,
          role,
        }),
    );
  }

  protected toggleUserStatus(
    user: User,
  ): void {
    if (this.isCurrentUser(user)) {
      return;
    }

    const newStatus =
      !user.isActive;

    const actionLabel =
      newStatus
        ? 'aktiviraš'
        : 'deaktiviraš';

    const confirmed =
      window.confirm(
        `Da li sigurno želiš da ${actionLabel} nalog korisnika ${user.firstName} ${user.lastName}?`,
      );

    if (!confirmed) {
      return;
    }

    this.store.dispatch(
      AdminUsersActions
        .updateUserStatus({
          userId: user.id,
          isActive: newStatus,
        }),
    );
  }

  protected deleteUser(
    user: User,
  ): void {
    if (this.isCurrentUser(user)) {
      return;
    }

    const confirmed =
      window.confirm(
        `Da li sigurno želiš trajno da obrišeš korisnika ${user.firstName} ${user.lastName}? Ovu radnju nije moguće poništiti.`,
      );

    if (!confirmed) {
      return;
    }

    this.store.dispatch(
      AdminUsersActions.deleteUser({
        userId: user.id,
      }),
    );
  }

  protected clearOperationError():
    void {
    this.store.dispatch(
      AdminUsersActions
        .clearOperationError(),
    );
  }

  protected isCurrentUser(
    user: User,
  ): boolean {
    return (
      this.currentUser()?.id ===
      user.id
    );
  }

  protected isUpdating(
    userId: number,
  ): boolean {
    return (
      this.updatingUserId() ===
      userId
    );
  }

  protected isDeleting(
    userId: number,
  ): boolean {
    return (
      this.deletingUserId() ===
      userId
    );
  }

  protected getRoleLabel(
    role: UserRole,
  ): string {
    if (role === 'client') {
      return 'Klijent';
    }

    if (role === 'trainer') {
      return 'Lični trener';
    }

    if (role === 'nutritionist') {
      return 'Nutricionista';
    }

    return 'Administrator';
  }

  protected getInitials(
    firstName: string,
    lastName: string,
  ): string {
    return (
      firstName.charAt(0) +
      lastName.charAt(0)
    ).toUpperCase();
  }

  protected getProfileImageUrl(
    profileImageUrl: string | null,
  ): string | null {
    if (!profileImageUrl) {
      return null;
    }

    if (
      profileImageUrl.startsWith(
        'http',
      )
    ) {
      return profileImageUrl;
    }

    return (
      `http://localhost:3000` +
      profileImageUrl
    );
  }

  protected hasImageLoadFailed(
    userId: number,
  ): boolean {
    return this.failedImageIds()
      .has(userId);
  }

  protected handleImageError(
    userId: number,
  ): void {
    this.failedImageIds.update(
      (currentIds) => {
        const updatedIds =
          new Set(currentIds);

        updatedIds.add(userId);

        return updatedIds;
      },
    );
  }

  protected formatDate(
    value: string,
  ): string {
    return new Intl.DateTimeFormat(
      'sr-Latn-RS',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    ).format(new Date(value));
  }
}