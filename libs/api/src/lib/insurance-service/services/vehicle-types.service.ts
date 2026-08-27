import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateVehicleTypeDto,
  GetVehicleTypesQueryDto,
  UpdateVehicleTypeDto,
  VehicleTypeResponseDto,
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
export class VehicleTypesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(dto: CreateVehicleTypeDto): Observable<VehicleTypeResponseDto> {
    return this.http
      .post<ServiceResponse<VehicleTypeResponseDto>>(this.url(), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<VehicleTypeResponseDto>,
          ): VehicleTypeResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public update(
    id: string,
    dto: UpdateVehicleTypeDto,
  ): Observable<VehicleTypeResponseDto> {
    return this.http
      .patch<ServiceResponse<VehicleTypeResponseDto>>(this.url(id), dto)
      .pipe(
        map(
          (
            r: ServiceResponse<VehicleTypeResponseDto>,
          ): VehicleTypeResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public list(
    query: GetVehicleTypesQueryDto = {},
    page: HeaderPaginationParams = {},
  ): Observable<PaginateResult<VehicleTypeResponseDto>> {
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
      .get<ServiceResponse<PaginateResult<VehicleTypeResponseDto>>>(
        this.url(),
        {
          headers,
          params,
        },
      )
      .pipe(
        map(
          (
            r: ServiceResponse<PaginateResult<VehicleTypeResponseDto>>,
          ): PaginateResult<VehicleTypeResponseDto> => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, INSURANCE_PATH, 'vehicle-types', ...segments);
  }
}
