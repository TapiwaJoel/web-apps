import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateVehicleDto,
  GetVehiclesQueryDto,
  UpdateVehicleDto,
  VehicleResponseDto,
} from '../dtos';
import {
  API_BASE_URL,
  HeaderPaginationParams,
  INSURANCE_PATH,
  PaginateResult,
  ServiceResponse,
  buildPaginationHeaders,
  buildUrl,
  mapHttpError,
} from '../../common';

@Injectable({ providedIn: 'root' })
export class VehiclesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateVehicleDto): Observable<VehicleResponseDto> {
    return this.http
      .post<ServiceResponse<VehicleResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (r: ServiceResponse<VehicleResponseDto>): VehicleResponseDto =>
            r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateVehicleDto,
  ): Observable<VehicleResponseDto> {
    return this.http
      .patch<ServiceResponse<VehicleResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (r: ServiceResponse<VehicleResponseDto>): VehicleResponseDto =>
            r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetVehiclesQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<VehicleResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<VehicleResponseDto>>>(this.url(), {
        headers,
        params,
      })
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<VehicleResponseDto>>,
          ): PaginateResult<VehicleResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, INSURANCE_PATH, 'vehicles', ...segments);
  }
}
