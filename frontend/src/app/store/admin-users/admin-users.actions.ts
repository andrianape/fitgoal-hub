import {
  createActionGroup,
  emptyProps,
  props,
} from '@ngrx/store';
import {
  User,
  UserRole,
} from '../../core/models/user.model';

export const AdminUsersActions =
  createActionGroup({
    source: 'Admin Users',

    events: {
      'Load Users': emptyProps(),

      'Load Users Success': props<{
        users: User[];
      }>(),

      'Load Users Failure': props<{
        error: string;
      }>(),

      'Update User Role': props<{
        userId: number;
        role: UserRole;
      }>(),

      'Update User Role Success': props<{
        user: User;
      }>(),

      'Update User Role Failure': props<{
        error: string;
      }>(),

      'Update User Status': props<{
        userId: number;
        isActive: boolean;
      }>(),

      'Update User Status Success': props<{
        user: User;
      }>(),

      'Update User Status Failure': props<{
        error: string;
      }>(),

      'Delete User': props<{
        userId: number;
      }>(),

      'Delete User Success': props<{
        userId: number;
      }>(),

      'Delete User Failure': props<{
        error: string;
      }>(),

      'Clear Operation Error': emptyProps(),

      'Clear Admin Users': emptyProps(),
    },
  });