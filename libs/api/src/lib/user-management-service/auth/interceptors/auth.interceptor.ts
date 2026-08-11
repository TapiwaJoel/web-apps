import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService: TokenService = inject(TokenService);
  const token: string | null = tokenService.getToken();

  // Skip adding token for auth-related requests
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  // Clone the request and add the authorization header if token exists
  if (token) {
    const clonedRequest: typeof req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }

  return next(req);
};
