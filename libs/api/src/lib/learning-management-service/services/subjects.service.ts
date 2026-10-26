import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateSubjectDto,
  GetSubjectsQueryDto,
  SubjectResponseDto,
  UpdateSubjectDto,
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
export class SubjectsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateSubjectDto): Observable<SubjectResponseDto> {
    return this.http
      .post<ServiceResponse<SubjectResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (r: ServiceResponse<SubjectResponseDto>): SubjectResponseDto =>
            r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateSubjectDto,
  ): Observable<SubjectResponseDto> {
    return this.http
      .patch<ServiceResponse<SubjectResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (r: ServiceResponse<SubjectResponseDto>): SubjectResponseDto =>
            r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetSubjectsQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<SubjectResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<SubjectResponseDto>>>(this.url(), {
        headers,
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<SubjectResponseDto>>,
          ): PaginateResult<SubjectResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      LEARNING_MANAGEMENT_PATH,
      'subjects',
      ...segments,
    );
  }
}
