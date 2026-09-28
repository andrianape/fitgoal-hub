import {
  Routes,
} from '@angular/router';
import {
  authGuard,
} from './core/guards/auth.guard';
import {
  roleGuard,
} from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'FitGoal Hub',

    loadComponent: () =>
      import(
        './pages/home/home'
      ).then(
        (component) =>
          component.Home,
      ),
  },

  {
    path: 'professionals',
    title:
      'Profesionalci | FitGoal Hub',

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
    title:
      'Prijava | FitGoal Hub',

    loadComponent: () =>
      import(
        './pages/login/login'
      ).then(
        (component) =>
          component.Login,
      ),
  },

  {
    path: 'register',
    title:
      'Registracija | FitGoal Hub',

    loadComponent: () =>
      import(
        './pages/register/register'
      ).then(
        (component) =>
          component.Register,
      ),
  },

  {
    path:
      'professional-onboarding',

    title:
      'Profesionalni profil | FitGoal Hub',

    canActivate: [
      authGuard,

      roleGuard(
        'trainer',
        'nutritionist',
      ),
    ],

    loadComponent: () =>
      import(
        './pages/professional-onboarding/professional-onboarding'
      ).then(
        (component) =>
          component
            .ProfessionalOnboarding,
      ),
  },

  {
    path: 'my-profile',
    title:
      'Moj profil | FitGoal Hub',

    canActivate: [
      authGuard,
    ],

    loadComponent: () =>
      import(
        './pages/my-profile/my-profile'
      ).then(
        (component) =>
          component.MyProfile,
      ),
  },

  {
    path: 'my-appointments',
    title:
      'Moje rezervacije | FitGoal Hub',

    canActivate: [
      authGuard,
    ],

    loadComponent: () =>
      import(
        './pages/my-appointments/my-appointments'
      ).then(
        (component) =>
          component.MyAppointments,
      ),
  },

  {
    path: 'my-plans',
    title:
      'Moji planovi | FitGoal Hub',

    canActivate: [
      authGuard,
    ],

    loadComponent: () =>
      import(
        './pages/my-plans/my-plans'
      ).then(
        (component) =>
          component.MyPlans,
      ),
  },

  {
    path:
      'admin/verifications',

    title:
      'Verifikacija profesionalaca | FitGoal Hub',

    canActivate: [
      authGuard,
      roleGuard('admin'),
    ],

    loadComponent: () =>
      import(
        './pages/admin-verifications/admin-verifications'
      ).then(
        (component) =>
          component
            .AdminVerifications,
      ),
  },

  {
    path: 'admin/users',

    title:
      'Upravljanje korisnicima | FitGoal Hub',

    canActivate: [
      authGuard,
      roleGuard('admin'),
    ],

    loadComponent: () =>
      import(
        './pages/admin-users/admin-users'
      ).then(
        (component) =>
          component.AdminUsers,
      ),
  },

  {
    path: '**',
    title:
      'Stranica nije pronađena',

    loadComponent: () =>
      import(
        './pages/not-found/not-found'
      ).then(
        (component) =>
          component.NotFound,
      ),
  },
];