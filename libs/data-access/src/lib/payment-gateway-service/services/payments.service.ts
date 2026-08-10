import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreatePaymentDto,
  GetPaymentsQueryDto,
  PaymentResponseDto,
  PaynowStatusDto,
} from '../dtos';
import { PaginateResult, ServiceResponse } from '../../common';
import {
  API_BASE_URL,
  buildPaginationHeaders,
  buildUrl,
  HeaderPaginationParams,
  mapHttpError,
  PAYMENT_GATEWAY_PATH,
} from '../../core';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreatePaymentDto): Observable<PaymentResponseDto> {
    return this.http
      .post<ServiceResponse<PaymentResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (r: ServiceResponse<PaymentResponseDto>): PaymentResponseDto =>
            r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetPaymentsQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<PaymentResponseDto>> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    const headers: HttpHeaders = buildPaginationHeaders(page);
    return this.http
      .get<ServiceResponse<PaginateResult<PaymentResponseDto>>>(this.url(), {
        headers,
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<PaymentResponseDto>>,
          ): PaginateResult<PaymentResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public paynow(dto: PaynowStatusDto): Observable<PaynowStatusDto> {
    return this.http
      .post<ServiceResponse<PaynowStatusDto>>(this.url('paynow'), dto)
      .pipe(
        map(
          (r: ServiceResponse<PaynowStatusDto>): PaynowStatusDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, PAYMENT_GATEWAY_PATH, 'payments', ...segments);
  }
}
