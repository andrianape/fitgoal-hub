import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'FitGoal Hub',
    loadComponent: () =>
      import('./pages/home/home').then(
        (component) => component.Home,
      ),
  },
  {
    path: 'professionals',
    title: 'Profesionalci | FitGoal Hub',
    loadComponent: () =>
      import(
        './pages/professionals/professionals'
      ).then(
        (component) => component.Professionals,
      ),
  },
  {
    path: '**',
    title: 'Stranica nije pronađena',
    loadComponent: () =>
      import('./pages/not-found/not-found').then(
        (component) => component.NotFound,
      ),
  },
];