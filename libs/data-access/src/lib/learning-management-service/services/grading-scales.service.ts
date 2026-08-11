import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateGradingScaleDto,
  GetGradingScalesQueryDto,
  GradingScaleResponseDto,
  UpdateGradingScaleDto,
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
export class GradingScalesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateGradingScaleDto): Observable<GradingScaleResponseDto> {
    return this.http
      .post<ServiceResponse<GradingScaleResponseDto>>(this.url(), dto)
      .pipe(
        map((r: ServiceResponse<GradingScaleResponseDto>): GradingScaleResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateGradingScaleDto,
  ): Observable<GradingScaleResponseDto> {
    return this.http
      .patch<ServiceResponse<GradingScaleResponseDto>>(this.url(id), dto)
      .pipe(
        map((r: ServiceResponse<GradingScaleResponseDto>): GradingScaleResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetGradingScalesQueryDto = {},
  ): Observable<PaginateResult<GradingScaleResponseDto>> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<PaginateResult<GradingScaleResponseDto>>>(this.url(), {
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<GradingScaleResponseDto>>,
          ): PaginateResult<GradingScaleResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, LEARNING_MANAGEMENT_PATH, 'grading-scales', ...segments);
  }
}
