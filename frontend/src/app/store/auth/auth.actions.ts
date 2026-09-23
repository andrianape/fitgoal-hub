import {
  createActionGroup,
  emptyProps,
  props,
} from '@ngrx/store';
import { LoginCredentials } from '../../core/models/auth.model';
import { User } from '../../core/models/user.model';

export const AuthActions = createActionGroup({
  source: 'Auth',

  events: {
    Login: props<{
      credentials: LoginCredentials;
    }>(),

    'Login Success': props<{
      user: User;
      accessToken: string;
    }>(),

    'Login Failure': props<{
      error: string;
    }>(),

    'Restore Session': emptyProps(),

    'Restore Session Success': props<{
      user: User;
      accessToken: string;
    }>(),

    'Restore Session Finished': emptyProps(),

    Logout: emptyProps(),

    'Clear Error': emptyProps(),
  },
});