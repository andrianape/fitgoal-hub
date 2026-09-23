import { createSelector } from '@ngrx/store';
import {
  selectAccessToken,
  selectError,
  selectInitialized,
  selectLoading,
  selectUser,
} from './auth.reducer';

export const selectCurrentUser =
  selectUser;

export const selectAuthToken =
  selectAccessToken;

export const selectAuthLoading =
  selectLoading;

export const selectAuthInitialized =
  selectInitialized;

export const selectAuthError =
  selectError;

export const selectIsAuthenticated =
  createSelector(
    selectCurrentUser,
    selectAuthToken,
    (user, accessToken) =>
      user !== null &&
      accessToken !== null,
  );

export const selectCurrentUserRole =
  createSelector(
    selectCurrentUser,
    (user) => user?.role ?? null,
  );