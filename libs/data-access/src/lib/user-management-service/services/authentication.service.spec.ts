import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { AuthenticationService } from './authentication.service';
import { API_BASE_URL } from '../../core';
import { LogoutRequestDto } from '../dtos';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpMock: HttpTestingController;
  const BASE: string = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
        AuthenticationService,
      ],
    });
    service = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('POSTs login to the gateway user-management path and unwraps data', () => {
    let result: unknown;
    service
      .login({ identifier: 'a@b.com', password: 'secret123' })
      .subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/authentications/login`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      identifier: 'a@b.com',
      password: 'secret123',
    });
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: { _id: 'x', user: { _id: 'u1' } },
    });

    expect((result as { _id: string })._id).toBe('x');
  });

  it('surfaces backend message on error', () => {
    let err: unknown;
    service
      .login({ identifier: 'a', password: 'b' })
      .subscribe({ error: (e) => (err = e) });
    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/authentications/login`,
    );
    req.flush(
      {
        statusCode: 401,
        success: false,
        message: 'Invalid credentials',
        data: null,
      },
      { status: 401, statusText: 'Unauthorized' },
    );
    expect(err as { statusCode: number; message: string }).toEqual({
      statusCode: 401,
      message: 'Invalid credentials',
    });
  });

  it('POSTs logout to the gateway user-management path and completes with void', () => {
    let result: unknown;
    let completed: boolean = false;
    const dto: LogoutRequestDto = { deviceId: 'device-1' };
    service.logout(dto).subscribe({
      next: (r) => (result = r),
      complete: () => (completed = true),
    });

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/authentications/logout`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({ statusCode: 200, success: true, message: 'ok', data: null });

    expect(result).toBeUndefined();
    expect(completed).toBe(true);
  });

  it('POSTs refreshToken to the gateway user-management path and unwraps data', () => {
    let result: unknown;
    service.refreshToken().subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/authentications/refresh-token`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: { _id: 'r', user: { _id: 'u1' } },
    });

    expect((result as { _id: string })._id).toBe('r');
  });

  it('GETs myPermissions from the gateway user-management path and unwraps data', () => {
    let result: unknown;
    service.myPermissions().subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/authentications/my-permissions`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: { roleId: 'x', roleName: 'admin', permissions: [] },
    });

    expect((result as { roleId: string }).roleId).toBe('x');
  });
});
