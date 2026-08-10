import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  ArticleResponseDto,
  CreateArticleDto,
  GetArticlesQueryDto,
  UpdateArticleDto,
} from '../dtos';
import { PaginateResult, ServiceResponse } from '../../common';
import {
  API_BASE_URL,
  buildPaginationHeaders,
  buildUrl,
  HeaderPaginationParams,
  mapHttpError,
  CONTENT_MANAGEMENT_PATH,
} from '../../core';

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateArticleDto): Observable<ArticleResponseDto> {
    return this.http
      .post<ServiceResponse<ArticleResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (r: ServiceResponse<ArticleResponseDto>): ArticleResponseDto =>
            r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateArticleDto,
  ): Observable<ArticleResponseDto> {
    return this.http
      .patch<ServiceResponse<ArticleResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (r: ServiceResponse<ArticleResponseDto>): ArticleResponseDto =>
            r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetArticlesQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<ArticleResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<ArticleResponseDto>>>(this.url(), {
        headers,
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<ArticleResponseDto>>,
          ): PaginateResult<ArticleResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      CONTENT_MANAGEMENT_PATH,
      'articles',
      ...segments,
    );
  }
}
