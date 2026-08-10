import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateProfileDto,
  GetProfilesQueryDto,
  ProfileResponseDto,
  UpdateProfileDto,
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
export class ProfilesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateProfileDto): Observable<ProfileResponseDto> {
    return this.http
      .post<ServiceResponse<ProfileResponseDto>>(this.url(), dto)
      .pipe(
        map((r: ServiceResponse<ProfileResponseDto>): ProfileResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateProfileDto,
  ): Observable<ProfileResponseDto> {
    return this.http
      .patch<ServiceResponse<ProfileResponseDto>>(this.url(id), dto)
      .pipe(
        map((r: ServiceResponse<ProfileResponseDto>): ProfileResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetProfilesQueryDto = {},
  ): Observable<PaginateResult<ProfileResponseDto>> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<PaginateResult<ProfileResponseDto>>>(this.url(), {
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<ProfileResponseDto>>,
          ): PaginateResult<ProfileResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, LEARNING_MANAGEMENT_PATH, 'profiles', ...segments);
  }
}
