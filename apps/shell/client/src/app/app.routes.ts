import { inject } from '@angular/core';
import { Routes, type CanActivateFn } from '@angular/router';
import {
  noAuthGuard,
  optionalAuthGuard,
  requiredAuthGuard,
} from '@mushaviri/util';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { AppConfigService } from './services/app-config.service';

/**
 * Helper function to get the appropriate auth guard based on app configuration
 */
function getAuthGuardForApp(appName: string): CanActivateFn {
  return (route, state) => {
    const appConfig: AppConfigService = inject(AppConfigService);
    const authMode: 'none' | 'optional' | 'required' =
      appConfig.getAuthMode(appName);

    switch (authMode) {
      case 'none':
        return noAuthGuard(route, state);
      case 'optional':
        return optionalAuthGuard(route, state);
      case 'required':
        return requiredAuthGuard(route, state);
      default:
        // Fallback to required for safety
        return requiredAuthGuard(route, state);
    }
  };
}

export const appRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [requiredAuthGuard], // Dashboard always requires auth
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'umdzidzisi-website',
    canActivate: [getAuthGuardForApp('umdzidzisi-website')], // Configured: no auth
    loadChildren: () =>
      loadRemoteModule('umdzidzisi-website', './Component').then((m) => [
        {
          path: '',
          component: m.default,
        },
      ]),
  },
  {
    path: 'umdzidzisi-admin',
    canActivate: [getAuthGuardForApp('umdzidzisi-admin')], // Configured: required auth
    loadChildren: () =>
      loadRemoteModule('umdzidzisi-admin', './Component').then((m) => [
        {
          path: '',
          component: m.default,
        },
      ]),
  },
  {
    path: 'umdzidzisi-client',
    canActivate: [getAuthGuardForApp('umdzidzisi-client')], // Configured: optional auth
    loadChildren: () =>
      loadRemoteModule('umdzidzisi-client', './Component').then((m) => [
        {
          path: '',
          component: m.default,
        },
      ]),
  },
  {
    path: 'umtengesi-website',
    canActivate: [getAuthGuardForApp('umtengesi-website')], // Configured: no auth
    loadChildren: () =>
      loadRemoteModule('umtengesi-website', './Component').then((m) => [
        {
          path: '',
          component: m.default,
        },
      ]),
  },
  {
    path: 'umtengesi-admin',
    canActivate: [getAuthGuardForApp('umtengesi-admin')], // Configured: required auth
    loadChildren: () =>
      loadRemoteModule('umtengesi-admin', './Component').then((m) => [
        {
          path: '',
          component: m.default,
        },
      ]),
  },
  {
    path: 'umtengesi-client',
    canActivate: [getAuthGuardForApp('umtengesi-client')], // Configured: optional auth
    loadChildren: () =>
      loadRemoteModule('umtengesi-client', './Component').then((m) => [
        {
          path: '',
          component: m.default,
        },
      ]),
  },
  {
    path: 'insurance-website',
    canActivate: [getAuthGuardForApp('insurance-website')], // Configured: no auth
    loadChildren: () =>
      loadRemoteModule('insurance-website', './Component').then((m) => [
        {
          path: '',
          component: m.default,
        },
      ]),
  },
  {
    path: 'insurance-admin',
    canActivate: [getAuthGuardForApp('insurance-admin')], // Configured: required auth
    loadChildren: () =>
      loadRemoteModule('insurance-admin', './Component').then((m) => [
        {
          path: '',
          component: m.default,
        },
      ]),
  },
  {
    path: 'insurance-client',
    canActivate: [getAuthGuardForApp('insurance-client')], // Configured: optional auth
    loadChildren: () =>
      loadRemoteModule('insurance-client', './Component').then((m) => [
        {
          path: '',
          component: m.default,
        },
      ]),
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
