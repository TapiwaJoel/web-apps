import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CreateFulfilmentQuoteDto, FulfilmentQuoteResponseDto } from '../dtos';
import {
  API_BASE_URL,
  INSURANCE_PATH,
  ServiceResponse,
  buildUrl,
  mapHttpError,
} from '../../common';

@Injectable({ providedIn: 'root' })
export class FulfilmentQuotesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public create(
    dto: CreateFulfilmentQuoteDto,
  ): Observable<FulfilmentQuoteResponseDto> {
    return this.http
      .post<ServiceResponse<FulfilmentQuoteResponseDto>>(
        this.url('fulfilments', 'quote'),
        dto,
      )
      .pipe(
        map(
          (
            r: ServiceResponse<FulfilmentQuoteResponseDto>,
          ): FulfilmentQuoteResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  public get(id: string): Observable<FulfilmentQuoteResponseDto> {
    return this.http
      .get<ServiceResponse<FulfilmentQuoteResponseDto>>(
        this.url('fulfilments', 'quotes', id),
      )
      .pipe(
        map(
          (
            r: ServiceResponse<FulfilmentQuoteResponseDto>,
          ): FulfilmentQuoteResponseDto => r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, INSURANCE_PATH, ...segments);
  }
}
