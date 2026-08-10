import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../auth.service';

/**
 * No Authentication Guard
 * For public websites that don't require any authentication
 * Always allows access without any checks
 */
export const noAuthGuard: CanActivateFn = () => {
  return true;
};

/**
 * Optional Authentication Guard
 * For e-commerce/client apps that allow browsing without login
 * but may require auth for specific features later
 *
 * This guard:
 * - Always allows access (doesn't block navigation)
 * - The app itself can redirect to login when needed for specific features
 * - returnUrl will be preserved through query params
 */
export const optionalAuthGuard: CanActivateFn = () => {
  // Allow access regardless of auth state
  // Remote apps can check auth and redirect to login when needed
  return true;
};

/**
 * Required Authentication Guard
 * For admin portals and protected apps that need immediate authentication
 *
 * This guard:
 * - Checks if user is authenticated
 * - If authenticated: allows access
 * - If NOT authenticated: redirects to login with returnUrl
 */
export const requiredAuthGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  const isAuthenticated: boolean = authService.isAuthenticated();

  if (isAuthenticated) {
    return true;
  }

  // Redirect to login page with return url
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};
