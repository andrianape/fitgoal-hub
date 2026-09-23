import {
  createFeature,
  createReducer,
  on,
} from '@ngrx/store';
import { User } from '../../core/models/user.model';
import { AuthActions } from './auth.actions';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  loading: false,
  initialized: false,
  error: null,
};

export const authFeature = createFeature({
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
        initialized: true,
      }),
    ),

    on(
      AuthActions.restoreSessionFinished,
      (state) => ({
        ...state,
        initialized: true,
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
} = authFeature;