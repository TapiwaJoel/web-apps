import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  GetPaymentProvidersQueryDto,
  PaymentProviderResponseDto,
} from '../dtos';
import { ServiceResponse } from '../../common';
import {
  API_BASE_URL,
  buildUrl,
  mapHttpError,
  PAYMENT_GATEWAY_PATH,
} from '../../core';

@Injectable({ providedIn: 'root' })
export class PaymentProvidersService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public list(
    query: GetPaymentProvidersQueryDto = {},
  ): Observable<PaymentProviderResponseDto[]> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<PaymentProviderResponseDto[]>>(this.url(), {
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaymentProviderResponseDto[]>,
          ): PaymentProviderResponseDto[] => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, PAYMENT_GATEWAY_PATH, 'providers', ...segments);
  }
}
