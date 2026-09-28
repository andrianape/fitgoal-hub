import {
  adminUsersFeature,
} from './admin-users.reducer';

export const {
  selectAdminUsersState,
  selectUsers,
  selectLoading,
  selectLoaded,
  selectError,
  selectUpdatingUserId,
  selectDeletingUserId,
  selectOperationError,
} = adminUsersFeature;

export const selectAllAdminUsers =
  selectUsers;

export const selectAdminUsersLoading =
  selectLoading;

export const selectAdminUsersLoaded =
  selectLoaded;

export const selectAdminUsersError =
  selectError;

export const selectAdminUserUpdatingId =
  selectUpdatingUserId;

export const selectAdminUserDeletingId =
  selectDeletingUserId;

export const selectAdminUsersOperationError =
  selectOperationError;