import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  ChangeContactDto,
  CreateUserDto,
  GetUsersQueryDto,
  PaginateResult,
  ServiceResponse,
  UpdateUserDto,
  UserResponseDto,
} from '@mushaviri/api-contracts';
import {
  API_BASE_URL,
  buildUrl,
  mapHttpError,
  USER_MANAGEMENT_PATH,
} from '../core';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateUserDto): Observable<UserResponseDto> {
    return this.http
      .post<ServiceResponse<UserResponseDto>>(this.url(), dto)
      .pipe(
        map((r: ServiceResponse<UserResponseDto>): UserResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public update(
    userId: string,
    dto: UpdateUserDto,
  ): Observable<UserResponseDto> {
    return this.http
      .patch<ServiceResponse<UserResponseDto>>(this.url(userId), dto)
      .pipe(
        map((r: ServiceResponse<UserResponseDto>): UserResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public changeContact(
    userId: string,
    dto: ChangeContactDto,
  ): Observable<UserResponseDto> {
    return this.http
      .patch<ServiceResponse<UserResponseDto>>(
        this.url(userId, 'contact'),
        dto,
      )
      .pipe(
        map((r: ServiceResponse<UserResponseDto>): UserResponseDto => r.data),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetUsersQueryDto = {},
  ): Observable<PaginateResult<UserResponseDto>> {
    let params: HttpParams = new HttpParams();
    (Object.entries(query) as [string, unknown][]).forEach(
      ([key, value]: [string, unknown]): void => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      },
    );
    return this.http
      .get<ServiceResponse<PaginateResult<UserResponseDto>>>(this.url(), {
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<UserResponseDto>>,
          ): PaginateResult<UserResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, USER_MANAGEMENT_PATH, 'users', ...segments);
  }
}
