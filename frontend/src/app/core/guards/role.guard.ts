import {
  inject,
} from '@angular/core';
import {
  CanActivateFn,
  Router,
} from '@angular/router';
import {
  UserRole,
} from '../models/user.model';
import {
  AuthStorageService,
} from '../services/auth-storage.service';

export const roleGuard = (
  ...allowedRoles: UserRole[]
): CanActivateFn => {
  return (
    _route,
    state,
  ) => {
    const authStorage =
      inject(AuthStorageService);

    const router =
      inject(Router);

    const session =
      authStorage.getSession();

    if (
      !session?.accessToken
    ) {
      return router.createUrlTree(
        [
          '/login',
        ],
        {
          queryParams: {
            returnUrl:
              state.url,
          },
        },
      );
    }

    if (
      allowedRoles.includes(
        session.user.role,
      )
    ) {
      return true;
    }

    return router.createUrlTree([
      '/my-profile',
    ]);
  };
};