import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  ArticleResponseDto,
  CreateSubTopicDto,
  GetSubTopicsQueryDto,
  SubTopicResponseDto,
  UpdateSubTopicDto,
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
export class SubTopicsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateSubTopicDto): Observable<SubTopicResponseDto> {
    return this.http
      .post<ServiceResponse<SubTopicResponseDto>>(this.url(), dto)
      .pipe(
        map((r: ServiceResponse<SubTopicResponseDto>): SubTopicResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateSubTopicDto,
  ): Observable<SubTopicResponseDto> {
    return this.http
      .patch<ServiceResponse<SubTopicResponseDto>>(this.url(id), dto)
      .pipe(
        map((r: ServiceResponse<SubTopicResponseDto>): SubTopicResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetSubTopicsQueryDto = {},
  ): Observable<PaginateResult<SubTopicResponseDto>> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<PaginateResult<SubTopicResponseDto>>>(this.url(), {
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<SubTopicResponseDto>>,
          ): PaginateResult<SubTopicResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public getArticles(id: string): Observable<ArticleResponseDto> {
    return this.http
      .get<ServiceResponse<ArticleResponseDto>>(this.url(id, 'articles'))
      .pipe(
        map((r: ServiceResponse<ArticleResponseDto>): ArticleResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, LEARNING_MANAGEMENT_PATH, 'sub-topics', ...segments);
  }
}
