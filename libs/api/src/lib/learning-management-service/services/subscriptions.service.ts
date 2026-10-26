import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateSubscriptionDto,
  GetSubscriptionsQueryDto,
  SubscriptionResponseDto,
  SubscriptionsListResponseDto,
} from '../dtos';
import {
  API_BASE_URL,
  HeaderPaginationParams,
  LEARNING_MANAGEMENT_PATH,
  ServiceResponse,
  buildPaginationHeaders,
  buildUrl,
  mapHttpError,
} from '../../common';

@Injectable({ providedIn: 'root' })
export class SubscriptionsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(
    dto: CreateSubscriptionDto,
  ): Observable<SubscriptionResponseDto> {
    return this.http
      .post<ServiceResponse<SubscriptionResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<SubscriptionResponseDto>,
          ): SubscriptionResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  /**
   * `GET /subscriptions`. Filters go in the query string; pagination and
   * sorting go in X-Page / X-Limit / X-Sort-By / X-Sort-Order headers.
   */
  public list(
    query: GetSubscriptionsQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<SubscriptionsListResponseDto> {
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
      .get<ServiceResponse<SubscriptionsListResponseDto>>(this.url(), {
        headers,
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<SubscriptionsListResponseDto>,
          ): SubscriptionsListResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      LEARNING_MANAGEMENT_PATH,
      'subscriptions',
      ...segments,
    );
  }
}
