import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideEffects,
} from '@ngrx/effects';
import {
  provideState,
  provideStore,
} from '@ngrx/store';
import {
  provideStoreDevtools,
} from '@ngrx/store-devtools';
import {
  provideRouter,
} from '@angular/router';
import {
  routes,
} from './app.routes';
import {
  authInterceptor,
} from './core/interceptors/auth.interceptor';
import {
  AdminUsersEffects,
} from './store/admin-users/admin-users.effects';
import {
  adminUsersFeature,
} from './store/admin-users/admin-users.reducer';
import {
  AppointmentsEffects,
} from './store/appointments/appointments.effects';
import {
  appointmentsFeature,
} from './store/appointments/appointments.reducer';
import {
  AvailabilityEffects,
} from './store/availability/availability.effects';
import {
  availabilityFeature,
} from './store/availability/availability.reducer';
import {
  AuthEffects,
} from './store/auth/auth.effects';
import {
  authFeature,
} from './store/auth/auth.reducer';
import {
  CitiesEffects,
} from './store/cities/cities.effects';
import {
  citiesFeature,
} from './store/cities/cities.reducer';
import {
  NotificationsEffects,
} from './store/notifications/notifications.effects';
import {
  notificationsFeature,
} from './store/notifications/notifications.reducer';
import {
  PlansEffects,
} from './store/plans/plans.effects';
import {
  plansFeature,
} from './store/plans/plans.reducer';
import {
  ProfessionalsEffects,
} from './store/professionals/professionals.effects';
import {
  professionalsFeature,
} from './store/professionals/professionals.reducer';
import {
  ReviewsEffects,
} from './store/reviews/reviews.effects';
import {
  reviewsFeature,
} from './store/reviews/reviews.reducer';

export const appConfig:
  ApplicationConfig = {
    providers: [
      provideBrowserGlobalErrorListeners(),

      provideRouter(routes),

      provideHttpClient(
        withInterceptors([
          authInterceptor,
        ]),
      ),

      provideStore(),

      provideState(citiesFeature),

      provideState(professionalsFeature),

      provideState(availabilityFeature),

      provideState(authFeature),

      provideState(appointmentsFeature),

      provideState(notificationsFeature),

      provideState(plansFeature),

      provideState(adminUsersFeature),

      provideState(reviewsFeature),

      provideEffects(
        CitiesEffects,
        ProfessionalsEffects,
        AvailabilityEffects,
        AuthEffects,
        AppointmentsEffects,
        NotificationsEffects,
        PlansEffects,
        AdminUsersEffects,
        ReviewsEffects,
      ),

      provideStoreDevtools({
        maxAge: 25,
        logOnly: !isDevMode(),
        autoPause: true,
      }),
    ],
  };