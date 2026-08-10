import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  AssessmentResponseDto,
  CreateAssessmentDto,
  GetAssessmentsQueryDto,
  UpdateAssessmentDto,
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
export class AssessmentsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateAssessmentDto): Observable<AssessmentResponseDto> {
    return this.http
      .post<ServiceResponse<AssessmentResponseDto>>(this.url(), dto)
      .pipe(
        map((r: ServiceResponse<AssessmentResponseDto>): AssessmentResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateAssessmentDto,
  ): Observable<AssessmentResponseDto> {
    return this.http
      .patch<ServiceResponse<AssessmentResponseDto>>(this.url(id), dto)
      .pipe(
        map((r: ServiceResponse<AssessmentResponseDto>): AssessmentResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetAssessmentsQueryDto = {},
  ): Observable<PaginateResult<AssessmentResponseDto>> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<PaginateResult<AssessmentResponseDto>>>(this.url(), {
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<AssessmentResponseDto>>,
          ): PaginateResult<AssessmentResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, LEARNING_MANAGEMENT_PATH, 'assessments', ...segments);
  }
}
