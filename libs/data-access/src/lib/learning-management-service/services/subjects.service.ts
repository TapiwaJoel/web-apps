import { HttpClient, HttpParams } from '@angular/common/http';
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
export class SubjectsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateSubjectDto): Observable<SubjectResponseDto> {
    return this.http
      .post<ServiceResponse<SubjectResponseDto>>(this.url(), dto)
      .pipe(
        map((r: ServiceResponse<SubjectResponseDto>): SubjectResponseDto => r.data),
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
        map((r: ServiceResponse<SubjectResponseDto>): SubjectResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetSubjectsQueryDto = {},
  ): Observable<PaginateResult<SubjectResponseDto>> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<PaginateResult<SubjectResponseDto>>>(this.url(), {
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
    return buildUrl(this.baseUrl, LEARNING_MANAGEMENT_PATH, 'subjects', ...segments);
  }
}
