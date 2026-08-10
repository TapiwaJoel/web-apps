import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateSubscriptionPlanDto,
  GetSubscriptionPlansQueryDto,
  SubscriptionPlanResponseDto,
  UpdateSubscriptionPlanDto,
} from '../dtos';
import {
  PaginateResult,
  ServiceResponse,
} from '../../common';
import {
  API_BASE_URL,
  buildUrl,
  LEARNING_MANAGEMENT_PATH,
  mapHttpError,
} from '../../core';

@Injectable({ providedIn: 'root' })
export class SubscriptionPlansService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateSubscriptionPlanDto): Observable<SubscriptionPlanResponseDto> {
    return this.http
      .post<ServiceResponse<SubscriptionPlanResponseDto>>(this.url(), dto)
      .pipe(
        map((r: ServiceResponse<SubscriptionPlanResponseDto>): SubscriptionPlanResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateSubscriptionPlanDto,
  ): Observable<SubscriptionPlanResponseDto> {
    return this.http
      .patch<ServiceResponse<SubscriptionPlanResponseDto>>(this.url(id), dto)
      .pipe(
        map((r: ServiceResponse<SubscriptionPlanResponseDto>): SubscriptionPlanResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetSubscriptionPlansQueryDto = {},
  ): Observable<PaginateResult<SubscriptionPlanResponseDto>> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<PaginateResult<SubscriptionPlanResponseDto>>>(this.url(), {
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<SubscriptionPlanResponseDto>>,
          ): PaginateResult<SubscriptionPlanResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, LEARNING_MANAGEMENT_PATH, 'subscription-plans', ...segments);
  }
}
