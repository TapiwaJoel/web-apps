import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateEducationalLevelDto,
  EducationalLevelResponseDto,
  GetEducationalLevelsQueryDto,
  UpdateEducationalLevelDto,
} from '../dtos';
import {
  API_BASE_URL,
  HeaderPaginationParams,
  LEARNING_MANAGEMENT_PATH,
  PaginateResult,
  ServiceResponse,
  buildPaginationHeaders,
  buildUrl,
  mapHttpError,
} from '../../common';

@Injectable({ providedIn: 'root' })
export class EducationalLevelsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(
    dto: CreateEducationalLevelDto,
  ): Observable<EducationalLevelResponseDto> {
    return this.http
      .post<ServiceResponse<EducationalLevelResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<EducationalLevelResponseDto>,
          ): EducationalLevelResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateEducationalLevelDto,
  ): Observable<EducationalLevelResponseDto> {
    return this.http
      .patch<ServiceResponse<EducationalLevelResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<EducationalLevelResponseDto>,
          ): EducationalLevelResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetEducationalLevelsQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<EducationalLevelResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<EducationalLevelResponseDto>>>(
        this.url(),
        {
          headers,
          params,
        },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<EducationalLevelResponseDto>>,
          ): PaginateResult<EducationalLevelResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      LEARNING_MANAGEMENT_PATH,
      'educational-levels',
      ...segments,
    );
  }
}
