import {
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStorageService } from '../services/auth-storage.service';

export const authInterceptor:
  HttpInterceptorFn = (
    request,
    next,
  ) => {
    const authStorage =
      inject(AuthStorageService);

    const accessToken =
      authStorage.getAccessToken();

    if (!accessToken) {
      return next(request);
    }

    const authenticatedRequest =
      request.clone({
        setHeaders: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      });

    return next(authenticatedRequest);
  };