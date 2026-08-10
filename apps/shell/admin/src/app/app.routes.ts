import { inject } from '@angular/core';
import { Routes, type CanActivateFn } from '@angular/router';
import {
  noAuthGuard,
  optionalAuthGuard,
  requiredAuthGuard,
} from '@mushaviri/data-access';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { AppConfigService } from './services/app-config.service';
import { environment } from '../environments/environment';

/**
 * Loads a remote module, with a dev-only self-heal: when a remote fails to load
 * (typically because it just rebuilt and its previous chunk URLs are gone), do a
 * single hard reload so the shell re-fetches the fresh remoteEntry. A
 * sessionStorage flag prevents a reload loop if the remote is genuinely down.
 * In production this is a plain passthrough — behavior is unchanged.
 */
async function loadRemoteWithDevRecovery<T>(
  remoteName: string,
  exposedModule: string,
): Promise<T> {
  try {
    const mod: T = await loadRemoteModule(remoteName, exposedModule);
    if (!environment.production) {
      sessionStorage.removeItem(`mf-reload:${remoteName}`);
    }
    return mod;
  } catch (err) {
    if (!environment.production) {
      const key: string = `mf-reload:${remoteName}`;
      if (!sessionStorage.getItem(key)) {
        // First failure after a rebuild: reload once to pick up the new remote.
        sessionStorage.setItem(key, '1');
        console.warn(
          `[dev] remote "${remoteName}" failed to load — reloading once to recover`,
          err,
        );
        location.reload();
      }
    }
    throw err;
  }
}

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
    path: 'app-selector',
    canActivate: [requiredAuthGuard],
    loadComponent: () =>
      import('./components/app-selector/app-selector.component').then(
        (m) => m.AppSelectorComponent,
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
      loadRemoteWithDevRecovery<{ appRoutes: Routes }>(
        'umdzidzisi-admin',
        './Routes',
      ).then((m) => m.appRoutes),
  },
  {
    path: 'umdzidzisi-client',
    canActivate: [getAuthGuardForApp('umdzidzisi-client')], // Configured: optional auth
    loadChildren: () =>
      loadRemoteWithDevRecovery<{ appRoutes: Routes }>(
        'umdzidzisi-client',
        './Routes',
      ).then((m) => m.appRoutes),
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
      loadRemoteWithDevRecovery<{ appRoutes: Routes }>(
        'umtengesi-admin',
        './Routes',
      ).then((m) => m.appRoutes),
  },
  {
    path: 'umtengesi-client',
    canActivate: [getAuthGuardForApp('umtengesi-client')], // Configured: optional auth
    loadChildren: () =>
      loadRemoteWithDevRecovery<{ appRoutes: Routes }>(
        'umtengesi-client',
        './Routes',
      ).then((m) => m.appRoutes),
  },
  {
    path: '',
    pathMatch: 'full',
    // Land directly on the configured app (tenant configs) or the app-selector
    // (default shell config). See AppConfigService.getLandingApp().
    redirectTo: (): string => {
      const landingApp: string | null = inject(AppConfigService).getLandingApp();
      return landingApp ? `/${landingApp}` : '/app-selector';
    },
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
