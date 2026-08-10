import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { CountriesService } from './countries.service';
import { API_BASE_URL } from '../core';

describe('CountriesService', () => {
  let service: CountriesService;
  let httpMock: HttpTestingController;
  const BASE: string = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
        CountriesService,
      ],
    });
    service = TestBed.inject(CountriesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('GETs countries and unwraps data as a plain array', () => {
    let result: unknown;
    service.list().subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/countries`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: [
        {
          name: 'Zimbabwe',
          code: 'ZW',
          phoneCode: '+263',
          phoneNumberLength: 9,
          currency: ['USD'],
          flag: 'zw.png',
          language: ['en'],
        },
      ],
    });

    expect(Array.isArray(result)).toBe(true);
    expect((result as { code: string }[])[0].code).toBe('ZW');
  });
});
