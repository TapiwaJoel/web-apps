import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface ApiError {
  statusCode: number;
  message: string;
}

/** Normalize an HttpErrorResponse into ApiError, preferring the backend ServiceResponse.message. */
export function mapHttpError(error: HttpErrorResponse): Observable<never> {
  const body: unknown = error.error;
  const message: string =
    typeof body === 'object' && body !== null && 'message' in body
      ? String((body as { message: unknown }).message)
      : error.message || 'Request failed';
  const apiError: ApiError = { statusCode: error.status, message };
  return throwError((): ApiError => apiError);
}
