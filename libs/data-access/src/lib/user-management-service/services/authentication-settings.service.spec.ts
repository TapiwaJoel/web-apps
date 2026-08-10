import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { AuthenticationSettingsResponseDto } from '../dtos';
import { AuthenticationSettingsService } from './authentication-settings.service';
import { API_BASE_URL } from '../../core';

describe('AuthenticationSettingsService', () => {
  let service: AuthenticationSettingsService;
  let httpMock: HttpTestingController;
  const BASE: string = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
        AuthenticationSettingsService,
      ],
    });
    service = TestBed.inject(AuthenticationSettingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('GETs authentication-settings and unwraps data', () => {
    let result: unknown;
    service.get().subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/authentication-settings`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: {
        authentication: 'password',
        isTwoFactorEnabled: false,
      },
    });

    expect(
      (result as { isTwoFactorEnabled: boolean }).isTwoFactorEnabled,
    ).toBe(false);
  });

  it('PATCHes update to authentication-settings/:id and unwraps data', () => {
    let result: unknown;
    const body: Partial<AuthenticationSettingsResponseDto> = {
      isTwoFactorEnabled: true,
    };
    service.update('s1', body).subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/authentication-settings/s1`,
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(body);
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: { authentication: 'password', isTwoFactorEnabled: true },
    });

    expect(
      (result as { isTwoFactorEnabled: boolean }).isTwoFactorEnabled,
    ).toBe(true);
  });
});
