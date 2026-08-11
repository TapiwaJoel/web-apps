import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateQuestionDto,
  ListQuestionsQueryDto,
  QuestionResponseDto,
  UpdateQuestionDto,
} from '../dtos';
import {
  API_BASE_URL,
  CONTENT_MANAGEMENT_PATH,
  PaginateResult,
  ServiceResponse,
  buildUrl,
  mapHttpError,
} from '../../common';

@Injectable({ providedIn: 'root' })
export class QuestionsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateQuestionDto): Observable<QuestionResponseDto> {
    return this.http
      .post<ServiceResponse<QuestionResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (r: ServiceResponse<QuestionResponseDto>): QuestionResponseDto =>
            r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateQuestionDto,
  ): Observable<QuestionResponseDto> {
    return this.http
      .patch<ServiceResponse<QuestionResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (r: ServiceResponse<QuestionResponseDto>): QuestionResponseDto =>
            r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: ListQuestionsQueryDto = {},
  ): Observable<PaginateResult<QuestionResponseDto>> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<PaginateResult<QuestionResponseDto>>>(this.url(), {
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<QuestionResponseDto>>,
          ): PaginateResult<QuestionResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      CONTENT_MANAGEMENT_PATH,
      'questions',
      ...segments,
    );
  }
}
