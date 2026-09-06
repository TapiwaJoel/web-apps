import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface ApiError {
  statusCode: number;
  message: string;
  /** Present on a 403 "verification required" response (device verification, 2FA). */
  verificationId?: string;
  channel?: string;
  availableChannels?: string[];
  otpValidity?: number;
  phoneNumber?: string;
  /** Machine-readable error code, e.g. 'STEP_UP_REQUIRED' on a 403 needing re-auth. */
  code?: string;
}

/** Normalize an HttpErrorResponse into ApiError, preferring the backend ServiceResponse.message. */
export function mapHttpError(error: HttpErrorResponse): Observable<never> {
  const body: unknown = error.error;
  const isObjectBody: boolean = typeof body === 'object' && body !== null;
  const message: string =
    isObjectBody && 'message' in (body as Record<string, unknown>)
      ? String((body as { message: unknown }).message)
      : error.message || 'Request failed';
  const bodyRecord: Record<string, unknown> = isObjectBody
    ? (body as Record<string, unknown>)
    : {};
  const apiError: ApiError = {
    statusCode: error.status,
    message,
    verificationId: asString(bodyRecord['verificationId']),
    channel: asString(bodyRecord['channel']),
    availableChannels: asStringArray(bodyRecord['availableChannels']),
    otpValidity: asNumber(bodyRecord['otpValidity']),
    phoneNumber: asString(bodyRecord['phoneNumber']),
    code: asString(bodyRecord['code']),
  };
  return throwError((): ApiError => apiError);
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) &&
    value.every((v: unknown): boolean => typeof v === 'string')
    ? (value as string[])
    : undefined;
}
