import {
  createFeature,
  createReducer,
  on,
} from '@ngrx/store';
import {
  User,
} from '../../core/models/user.model';
import {
  AuthActions,
} from './auth.actions';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;

  profileUpdating: boolean;
  profileUpdateSuccessful: boolean;
  profileUpdateError: string | null;

  profileImageUpdating: boolean;
  profileImageUpdateSuccessful: boolean;
  profileImageError: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  loading: false,
  initialized: false,
  error: null,

  profileUpdating: false,
  profileUpdateSuccessful: false,
  profileUpdateError: null,

  profileImageUpdating: false,
  profileImageUpdateSuccessful: false,
  profileImageError: null,
};

export const authFeature =
  createFeature({
    name: 'auth',

    reducer: createReducer(
      initialState,

      on(
        AuthActions.login,
        (state) => ({
          ...state,
          loading: true,
          error: null,
        }),
      ),

      on(
        AuthActions.loginSuccess,
        (
          state,
          {
            user,
            accessToken,
          },
        ) => ({
          ...state,
          user,
          accessToken,
          loading: false,
          initialized: true,
          error: null,
        }),
      ),

      on(
        AuthActions.loginFailure,
        (state, { error }) => ({
          ...state,
          loading: false,
          initialized: true,
          error,
        }),
      ),

      on(
        AuthActions.register,
        (state) => ({
          ...state,
          loading: true,
          error: null,
        }),
      ),

      on(
        AuthActions.registerSuccess,
        (
          state,
          {
            user,
            accessToken,
          },
        ) => ({
          ...state,
          user,
          accessToken,
          loading: false,
          initialized: true,
          error: null,
        }),
      ),

      on(
        AuthActions.registerFailure,
        (state, { error }) => ({
          ...state,
          loading: false,
          initialized: true,
          error,
        }),
      ),

      on(
        AuthActions.restoreSessionSuccess,
        (
          state,
          {
            user,
            accessToken,
          },
        ) => ({
          ...state,
          user,
          accessToken,
          loading: false,
          initialized: true,
          error: null,
        }),
      ),

      on(
        AuthActions.restoreSessionFinished,
        (state) => ({
          ...state,
          loading: false,
          initialized: true,
        }),
      ),

      on(
        AuthActions.updateProfile,
        (state) => ({
          ...state,
          profileUpdating: true,
          profileUpdateSuccessful: false,
          profileUpdateError: null,
        }),
      ),

      on(
        AuthActions.updateProfileSuccess,
        (state, { user }) => ({
          ...state,
          user,
          profileUpdating: false,
          profileUpdateSuccessful: true,
          profileUpdateError: null,
        }),
      ),

      on(
        AuthActions.updateProfileFailure,
        (state, { error }) => ({
          ...state,
          profileUpdating: false,
          profileUpdateSuccessful: false,
          profileUpdateError: error,
        }),
      ),

      on(
        AuthActions.clearProfileUpdateState,
        (state) => ({
          ...state,
          profileUpdating: false,
          profileUpdateSuccessful: false,
          profileUpdateError: null,
        }),
      ),

      on(
        AuthActions.uploadProfileImage,
        AuthActions.removeProfileImage,
        (state) => ({
          ...state,
          profileImageUpdating: true,
          profileImageUpdateSuccessful: false,
          profileImageError: null,
        }),
      ),

      on(
        AuthActions.uploadProfileImageSuccess,
        (state, { user }) => ({
          ...state,
          user,
          profileImageUpdating: false,
          profileImageUpdateSuccessful: true,
          profileImageError: null,
        }),
      ),

      on(
        AuthActions.removeProfileImageSuccess,
        (state) => ({
          ...state,

          user: state.user
            ? {
                ...state.user,
                profileImageUrl: null,
              }
            : null,

          profileImageUpdating: false,
          profileImageUpdateSuccessful: true,
          profileImageError: null,
        }),
      ),

      on(
        AuthActions.uploadProfileImageFailure,
        AuthActions.removeProfileImageFailure,
        (state, { error }) => ({
          ...state,
          profileImageUpdating: false,
          profileImageUpdateSuccessful: false,
          profileImageError: error,
        }),
      ),

      on(
        AuthActions.clearProfileImageState,
        (state) => ({
          ...state,
          profileImageUpdating: false,
          profileImageUpdateSuccessful: false,
          profileImageError: null,
        }),
      ),

      on(
        AuthActions.logout,
        () => ({
          ...initialState,
          initialized: true,
        }),
      ),

      on(
        AuthActions.clearError,
        (state) => ({
          ...state,
          error: null,
        }),
      ),
    ),
  });

export const {
  name: authFeatureKey,
  reducer: authReducer,

  selectUser,
  selectAccessToken,
  selectLoading,
  selectInitialized,
  selectError,

  selectProfileUpdating,
  selectProfileUpdateSuccessful,
  selectProfileUpdateError,

  selectProfileImageUpdating,
  selectProfileImageUpdateSuccessful,
  selectProfileImageError,
} = authFeature;