import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  ResendCodeDto,
  VerificationResponseDto,
  VerifyCodeDto,
} from '../dtos';
import { ServiceResponse } from '../../common';
import {
  API_BASE_URL,
  buildUrl,
  mapHttpError,
  USER_MANAGEMENT_PATH,
} from '../../core';

@Injectable({ providedIn: 'root' })
export class VerificationsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public verify(dto: VerifyCodeDto): Observable<VerificationResponseDto> {
    return this.http
      .patch<ServiceResponse<VerificationResponseDto>>(
        this.url('verify'),
        dto,
      )
      .pipe(
        map(
          (
            r: ServiceResponse<VerificationResponseDto>,
          ): VerificationResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public resend(dto: ResendCodeDto): Observable<void> {
    return this.http
      .post<ServiceResponse<void>>(this.url('resend'), dto)
      .pipe(
        map((): void => undefined),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      USER_MANAGEMENT_PATH,
      'verifications',
      ...segments,
    );
  }
}
