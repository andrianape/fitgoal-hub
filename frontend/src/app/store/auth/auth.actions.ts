import {
  createActionGroup,
  emptyProps,
  props,
} from '@ngrx/store';
import {
  LoginCredentials,
  RegisterData,
} from '../../core/models/auth.model';
import {
  ChangePasswordRequest,
  UpdateUserRequest,
  User,
} from '../../core/models/user.model';

export const AuthActions =
  createActionGroup({
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

      Register: props<{
        data: RegisterData;
      }>(),

      'Register Success': props<{
        user: User;
        accessToken: string;
      }>(),

      'Register Failure': props<{
        error: string;
      }>(),

      'Restore Session': emptyProps(),

      'Restore Session Success': props<{
        user: User;
        accessToken: string;
      }>(),

      'Restore Session Finished':
        emptyProps(),

      'Update Profile': props<{
        userId: number;
        data: UpdateUserRequest;
      }>(),

      'Update Profile Success': props<{
        user: User;
      }>(),

      'Update Profile Failure': props<{
        error: string;
      }>(),

      'Clear Profile Update State':
        emptyProps(),

      'Upload Profile Image': props<{
        file: File;
      }>(),

      'Upload Profile Image Success':
        props<{
          user: User;
        }>(),

      'Upload Profile Image Failure':
        props<{
          error: string;
        }>(),

      'Remove Profile Image':
        emptyProps(),

      'Remove Profile Image Success':
        emptyProps(),

      'Remove Profile Image Failure':
        props<{
          error: string;
        }>(),

      'Clear Profile Image State':
        emptyProps(),

      'Change Password': props<{
        data: ChangePasswordRequest;
      }>(),

      'Change Password Success':
        emptyProps(),

      'Change Password Failure':
        props<{
          error: string;
        }>(),

      'Clear Password Change State':
        emptyProps(),

      Logout: emptyProps(),

      'Clear Error': emptyProps(),
    },
  });