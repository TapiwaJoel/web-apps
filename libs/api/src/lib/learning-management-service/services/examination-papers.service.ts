import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateExaminationPaperDto,
  ExaminationPaperResponseDto,
  GetExaminationPapersQueryDto,
  UpdateExaminationPaperDto,
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
export class ExaminationPapersService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(
    dto: CreateExaminationPaperDto,
  ): Observable<ExaminationPaperResponseDto> {
    return this.http
      .post<ServiceResponse<ExaminationPaperResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<ExaminationPaperResponseDto>,
          ): ExaminationPaperResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateExaminationPaperDto,
  ): Observable<ExaminationPaperResponseDto> {
    return this.http
      .patch<ServiceResponse<ExaminationPaperResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<ExaminationPaperResponseDto>,
          ): ExaminationPaperResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetExaminationPapersQueryDto = {},
  ): Observable<PaginateResult<ExaminationPaperResponseDto>> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<PaginateResult<ExaminationPaperResponseDto>>>(
        this.url(),
        {
          params,
        },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<ExaminationPaperResponseDto>>,
          ): PaginateResult<ExaminationPaperResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      LEARNING_MANAGEMENT_PATH,
      'examination-papers',
      ...segments,
    );
  }
}
