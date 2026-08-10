import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { API_BASE_URL } from '@mushaviri/api-contracts';
import { apiInterceptor } from './api.interceptor';

describe('apiInterceptor', () => {
  let http: HttpClient;
  let mock: HttpTestingController;
  const BASE: string = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
      ],
    });
    http = TestBed.inject(HttpClient);
    mock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => mock.verify());

  it('adds X-Client-Type and withCredentials for API requests', () => {
    http.get(`${BASE}/user-management-service/countries`).subscribe();
    const req: TestRequest = mock.expectOne(`${BASE}/user-management-service/countries`);
    expect(req.request.headers.get('X-Client-Type')).toBe('web');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('leaves non-API requests untouched', () => {
    http.get('http://localhost:4203/remoteEntry.json').subscribe();
    const req: TestRequest = mock.expectOne('http://localhost:4203/remoteEntry.json');
    expect(req.request.headers.has('X-Client-Type')).toBe(false);
    expect(req.request.withCredentials).toBe(false);
    req.flush({});
  });
});
