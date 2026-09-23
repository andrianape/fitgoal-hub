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
        (component) =>
          component.Professionals,
      ),
  },
  {
    path: 'professionals/:id',
    title:
      'Profil profesionalca | FitGoal Hub',
    loadComponent: () =>
      import(
        './pages/professional-details/professional-details'
      ).then(
        (component) =>
          component.ProfessionalDetails,
      ),
  },
  {
    path: 'login',
    title: 'Prijava | FitGoal Hub',
    loadComponent: () =>
      import('./pages/login/login').then(
        (component) => component.Login,
      ),
  },
  {
    path: '**',
    title: 'Stranica nije pronađena',
    loadComponent: () =>
      import(
        './pages/not-found/not-found'
      ).then(
        (component) =>
          component.NotFound,
      ),
  },
];