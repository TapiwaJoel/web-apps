import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateGradeDto,
  GetGradesQueryDto,
  GradeResponseDto,
  UpdateGradeDto,
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
export class GradesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateGradeDto): Observable<GradeResponseDto> {
    return this.http
      .post<ServiceResponse<GradeResponseDto>>(this.url(), dto)
      .pipe(
        map((r: ServiceResponse<GradeResponseDto>): GradeResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public update(id: string, dto: UpdateGradeDto): Observable<GradeResponseDto> {
    return this.http
      .patch<ServiceResponse<GradeResponseDto>>(this.url(id), dto)
      .pipe(
        map((r: ServiceResponse<GradeResponseDto>): GradeResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetGradesQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<GradeResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<GradeResponseDto>>>(this.url(), {
        headers,
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<GradeResponseDto>>,
          ): PaginateResult<GradeResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      LEARNING_MANAGEMENT_PATH,
      'grades',
      ...segments,
    );
  }
}
