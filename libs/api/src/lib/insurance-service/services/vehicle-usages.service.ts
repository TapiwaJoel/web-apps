import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateVehicleUsageDto,
  GetVehicleUsagesQueryDto,
  UpdateVehicleUsageDto,
  VehicleUsageResponseDto,
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
export class VehicleUsagesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(
    dto: CreateVehicleUsageDto,
  ): Observable<VehicleUsageResponseDto> {
    return this.http
      .post<ServiceResponse<VehicleUsageResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<VehicleUsageResponseDto>,
          ): VehicleUsageResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateVehicleUsageDto,
  ): Observable<VehicleUsageResponseDto> {
    return this.http
      .patch<ServiceResponse<VehicleUsageResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<VehicleUsageResponseDto>,
          ): VehicleUsageResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetVehicleUsagesQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<VehicleUsageResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<VehicleUsageResponseDto>>>(
        this.url(),
        {
          headers,
          params,
        },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<VehicleUsageResponseDto>>,
          ): PaginateResult<VehicleUsageResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      INSURANCE_PATH,
      'vehicle-usages',
      ...segments,
    );
  }
}
