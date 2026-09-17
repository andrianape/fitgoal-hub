import { provideHttpClient } from '@angular/common/http';
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
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { CitiesEffects } from './store/cities/cities.effects';
import { citiesFeature } from './store/cities/cities.reducer';
import { ProfessionalsEffects } from './store/professionals/professionals.effects';
import { professionalsFeature } from './store/professionals/professionals.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(routes),

    provideHttpClient(),

    provideStore(),

    provideState(citiesFeature),

    provideState(professionalsFeature),

    provideEffects(
      CitiesEffects,
      ProfessionalsEffects,
    ),

    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
    }),
  ],
};