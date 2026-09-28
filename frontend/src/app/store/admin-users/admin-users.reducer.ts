import {
  createFeature,
  createReducer,
  on,
} from '@ngrx/store';
import {
  User,
} from '../../core/models/user.model';
import {
  AdminUsersActions,
} from './admin-users.actions';

export interface AdminUsersState {
  users: User[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  updatingUserId: number | null;
  deletingUserId: number | null;
  operationError: string | null;
}

const initialState: AdminUsersState = {
  users: [],
  loading: false,
  loaded: false,
  error: null,
  updatingUserId: null,
  deletingUserId: null,
  operationError: null,
};

export const adminUsersFeature =
  createFeature({
    name: 'adminUsers',

    reducer: createReducer(
      initialState,

      on(
        AdminUsersActions.loadUsers,
        (state) => ({
          ...state,
          loading: true,
          error: null,
        }),
      ),

      on(
        AdminUsersActions
          .loadUsersSuccess,
        (state, { users }) => ({
          ...state,
          users,
          loading: false,
          loaded: true,
          error: null,
        }),
      ),

      on(
        AdminUsersActions
          .loadUsersFailure,
        (state, { error }) => ({
          ...state,
          users: [],
          loading: false,
          loaded: false,
          error,
        }),
      ),

      on(
        AdminUsersActions
          .updateUserRole,
        (
          state,
          { userId },
        ) => ({
          ...state,
          updatingUserId: userId,
          operationError: null,
        }),
      ),

      on(
        AdminUsersActions
          .updateUserStatus,
        (
          state,
          { userId },
        ) => ({
          ...state,
          updatingUserId: userId,
          operationError: null,
        }),
      ),

      on(
        AdminUsersActions
          .updateUserRoleSuccess,
        AdminUsersActions
          .updateUserStatusSuccess,
        (
          state,
          { user },
        ) => ({
          ...state,

          users: state.users.map(
            (currentUser) =>
              currentUser.id === user.id
                ? user
                : currentUser,
          ),

          updatingUserId: null,
          operationError: null,
        }),
      ),

      on(
        AdminUsersActions
          .updateUserRoleFailure,
        AdminUsersActions
          .updateUserStatusFailure,
        (
          state,
          { error },
        ) => ({
          ...state,
          updatingUserId: null,
          operationError: error,
        }),
      ),

      on(
        AdminUsersActions.deleteUser,
        (
          state,
          { userId },
        ) => ({
          ...state,
          deletingUserId: userId,
          operationError: null,
        }),
      ),

      on(
        AdminUsersActions
          .deleteUserSuccess,
        (
          state,
          { userId },
        ) => ({
          ...state,

          users: state.users.filter(
            (user) =>
              user.id !== userId,
          ),

          deletingUserId: null,
          operationError: null,
        }),
      ),

      on(
        AdminUsersActions
          .deleteUserFailure,
        (
          state,
          { error },
        ) => ({
          ...state,
          deletingUserId: null,
          operationError: error,
        }),
      ),

      on(
        AdminUsersActions
          .clearOperationError,
        (state) => ({
          ...state,
          operationError: null,
        }),
      ),

      on(
        AdminUsersActions
          .clearAdminUsers,
        () => initialState,
      ),
    ),
  });

export const {
  name: adminUsersFeatureKey,
  reducer: adminUsersReducer,
  selectUsers,
  selectLoading,
  selectLoaded,
  selectError,
  selectUpdatingUserId,
  selectDeletingUserId,
  selectOperationError,
} = adminUsersFeature;