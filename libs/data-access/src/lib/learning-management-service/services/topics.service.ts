import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateTopicDto,
  GetTopicsQueryDto,
  TopicResponseDto,
  UpdateTopicDto,
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
export class TopicsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateTopicDto): Observable<TopicResponseDto> {
    return this.http
      .post<ServiceResponse<TopicResponseDto>>(this.url(), dto)
      .pipe(
        map((r: ServiceResponse<TopicResponseDto>): TopicResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateTopicDto,
  ): Observable<TopicResponseDto> {
    return this.http
      .patch<ServiceResponse<TopicResponseDto>>(this.url(id), dto)
      .pipe(
        map((r: ServiceResponse<TopicResponseDto>): TopicResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetTopicsQueryDto = {},
  ): Observable<PaginateResult<TopicResponseDto>> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<PaginateResult<TopicResponseDto>>>(this.url(), {
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<TopicResponseDto>>,
          ): PaginateResult<TopicResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, LEARNING_MANAGEMENT_PATH, 'topics', ...segments);
  }
}
