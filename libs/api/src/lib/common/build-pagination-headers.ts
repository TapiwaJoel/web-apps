import { HttpHeaders } from '@angular/common/http';

export interface HeaderPaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

/**
 * Build HttpHeaders carrying pagination directives (X-Page, X-Limit, X-Sort-By,
 * X-Sort-Order) for endpoints that accept pagination via headers rather than
 * query params. Only defined values are set.
 *
 * Note: since pagination lives in headers rather than the URL, an endpoint
 * that also sets a `Cache-Control` response header must include a matching
 * `Vary: X-Page, X-Limit` (see `role-permissions.controller.ts` in the
 * backend) — otherwise a client's HTTP cache treats every page as the same
 * cached response for that URL, since it doesn't know the headers vary it.
 */
export function buildPaginationHeaders(
  pagination: HeaderPaginationParams = {},
): HttpHeaders {
  let headers: HttpHeaders = new HttpHeaders();
  if (pagination.page !== undefined) {
    headers = headers.set('X-Page', String(pagination.page));
  }
  if (pagination.limit !== undefined) {
    headers = headers.set('X-Limit', String(pagination.limit));
  }
  if (pagination.sortBy !== undefined) {
    headers = headers.set('X-Sort-By', String(pagination.sortBy));
  }
  if (pagination.sortOrder !== undefined) {
    headers = headers.set('X-Sort-Order', String(pagination.sortOrder));
  }
  return headers;
}
