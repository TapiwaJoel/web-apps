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
