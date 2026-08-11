import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from './api-base-url';

/**
 * For requests to the API gateway, flow the httpOnly auth cookie (withCredentials)
 * and tag the client type. Never adds an Authorization header — the JWT lives in a cookie.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const baseUrl: string = inject(API_BASE_URL);
  if (!baseUrl || !req.url.startsWith(baseUrl)) {
    return next(req);
  }
  return next(
    req.clone({
      withCredentials: true,
      setHeaders: { 'X-Client-Type': 'web' },
    }),
  );
};
