import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateGradingSystemDto,
  GetGradingSystemsQueryDto,
  GradingSystemResponseDto,
  UpdateGradingSystemDto,
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
export class GradingSystemsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateGradingSystemDto): Observable<GradingSystemResponseDto> {
    return this.http
      .post<ServiceResponse<GradingSystemResponseDto>>(this.url(), dto)
      .pipe(
        map((r: ServiceResponse<GradingSystemResponseDto>): GradingSystemResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateGradingSystemDto,
  ): Observable<GradingSystemResponseDto> {
    return this.http
      .patch<ServiceResponse<GradingSystemResponseDto>>(this.url(id), dto)
      .pipe(
        map((r: ServiceResponse<GradingSystemResponseDto>): GradingSystemResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetGradingSystemsQueryDto = {},
  ): Observable<PaginateResult<GradingSystemResponseDto>> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<PaginateResult<GradingSystemResponseDto>>>(this.url(), {
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<GradingSystemResponseDto>>,
          ): PaginateResult<GradingSystemResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, LEARNING_MANAGEMENT_PATH, 'grading-systems', ...segments);
  }
}
