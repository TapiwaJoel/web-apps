import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  // Use isAuthenticatedValue() method instead of calling the computed signal
  const isAuthenticated: boolean = authService.isAuthenticatedValue();

  if (isAuthenticated) {
    return true;
  }

  // Redirect to login page with return url
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};
