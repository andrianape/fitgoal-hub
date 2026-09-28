import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
} from '@angular/router';
import { AuthStorageService } from '../services/auth-storage.service';

export const authGuard: CanActivateFn = (
  _route,
  state,
) => {
  const authStorage =
    inject(AuthStorageService);

  const router = inject(Router);

  const accessToken =
    authStorage.getAccessToken();

  if (accessToken) {
    return true;
  }

  return router.createUrlTree(
    ['/login'],
    {
      queryParams: {
        returnUrl: state.url,
      },
    },
  );
};