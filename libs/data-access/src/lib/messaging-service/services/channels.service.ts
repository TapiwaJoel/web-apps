import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  API_BASE_URL,
  MESSAGING_PATH,
  ServiceResponse,
  buildUrl,
  mapHttpError,
} from '../../common';

@Injectable({ providedIn: 'root' })
export class ChannelsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = inject(API_BASE_URL);

  public list(): Observable<string[]> {
    return this.http
      .get<ServiceResponse<string[]>>(this.url())
      .pipe(
        map((r: ServiceResponse<string[]>): string[] => r.data),
        catchError(mapHttpError),
      );
  }

  private url(...segments: string[]): string {
    return buildUrl(this.baseUrl, MESSAGING_PATH, 'channels', ...segments);
  }
}
