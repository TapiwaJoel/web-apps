import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CountryResponseDto } from '../dtos';
import {
  API_BASE_URL,
  ServiceResponse,
  USER_MANAGEMENT_PATH,
  buildUrl,
  mapHttpError,
} from '../../common';

@Injectable({ providedIn: 'root' })
export class CountriesService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public list(): Observable<CountryResponseDto[]> {
    return this.http
      .get<ServiceResponse<CountryResponseDto[]>>(this.url())
      .pipe(
        map(
          (r: ServiceResponse<CountryResponseDto[]>): CountryResponseDto[] =>
            r.data,
        ),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(
      this.baseUrl,
      USER_MANAGEMENT_PATH,
      'countries',
      ...segments,
    );
  }
}
