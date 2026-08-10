import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import {
  ChangeContactDto,
  CreateUserDto,
  UpdateUserDto,
  UserStatus,
  UserType,
} from '../dtos';
import { UsersService } from './users.service';
import { API_BASE_URL } from '../../core';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;
  const BASE: string = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
        UsersService,
      ],
    });
    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('POSTs create to users and unwraps data', () => {
    let result: unknown;
    const dto: CreateUserDto = {
      name: 'Joe',
      phoneNumber: '+263771234567',
      userType: UserType.Individual,
      country: 'ZW',
      password: 'password1',
      role: 'role-1',
    };
    service.create(dto).subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/users`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({
      statusCode: 201,
      success: true,
      message: 'ok',
      data: { _id: 'u1', name: 'Joe' },
    });

    expect((result as { _id: string })._id).toBe('u1');
  });

  it('PATCHes update to users/:userId and unwraps data', () => {
    let result: unknown;
    const dto: UpdateUserDto = {
      name: 'Joe Updated',
      userType: UserType.Individual,
      status: UserStatus.ACTIVE,
    };
    service.update('u1', dto).subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/users/u1`,
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: { _id: 'u1', name: 'Joe Updated' },
    });

    expect((result as { name: string }).name).toBe('Joe Updated');
  });

  it('PATCHes changeContact to users/:userId/contact and unwraps data', () => {
    let result: unknown;
    const dto: ChangeContactDto = { value: 'new@example.com' };
    service.changeContact('u1', dto).subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/users/u1/contact`,
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: { _id: 'u1', emailAddress: 'new@example.com' },
    });

    expect((result as { emailAddress: string }).emailAddress).toBe(
      'new@example.com',
    );
  });

  it('GETs users with only defined query params', () => {
    let result: unknown;
    service
      .list({ status: UserStatus.ACTIVE, name: 'joe' })
      .subscribe((r) => (result = r));
    const req: TestRequest = httpMock.expectOne(
      (r) => r.url === `${BASE}/user-management-service/users`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('status')).toBe('ACTIVE');
    expect(req.request.params.get('name')).toBe('joe');
    expect(req.request.params.has('phoneNumber')).toBe(false);
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: {
        docs: [{ _id: 'u1' }],
        totalDocs: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        pagingCounter: 1,
      },
    });

    expect(
      (result as { docs: unknown[] }).docs,
    ).toEqual([{ _id: 'u1' }]);
  });

  it('GETs users with no query params when list() called with defaults', () => {
    service.list().subscribe();
    const req: TestRequest = httpMock.expectOne(
      (r) => r.url === `${BASE}/user-management-service/users`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: {
        docs: [],
        totalDocs: 0,
        limit: 20,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        pagingCounter: 0,
      },
    });
  });
});
