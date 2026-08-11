import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateSubscriptionDto,
  GetSubscriptionsQueryDto,
  SubscriptionResponseDto,
} from '../dtos';
import {
  API_BASE_URL,
  LEARNING_MANAGEMENT_PATH,
  PaginateResult,
  ServiceResponse,
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

  public list(
    query: GetSubscriptionsQueryDto = {},
  ): Observable<PaginateResult<SubscriptionResponseDto>> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<PaginateResult<SubscriptionResponseDto>>>(
        this.url(),
        {
          params,
        },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<SubscriptionResponseDto>>,
          ): PaginateResult<SubscriptionResponseDto> => r.data,
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
