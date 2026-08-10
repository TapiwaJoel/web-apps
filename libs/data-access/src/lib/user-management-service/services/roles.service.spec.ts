import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { CreateRoleDto, UpdateRoleDto } from '../dtos';
import { RolesService } from './roles.service';
import { API_BASE_URL } from '../../core';

describe('RolesService', () => {
  let service: RolesService;
  let httpMock: HttpTestingController;
  const BASE: string = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
        RolesService,
      ],
    });
    service = TestBed.inject(RolesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('POSTs create to roles and unwraps data', () => {
    let result: unknown;
    const dto: CreateRoleDto = { name: 'Admin', description: 'Admin role' };
    service.create(dto).subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/roles`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({
      statusCode: 201,
      success: true,
      message: 'ok',
      data: { _id: 'r1', name: 'Admin' },
    });

    expect((result as { _id: string })._id).toBe('r1');
  });

  it('PATCHes update to roles/:id and unwraps data', () => {
    let result: unknown;
    const dto: UpdateRoleDto = { name: 'Admin Updated' };
    service.update('r1', dto).subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/roles/r1`,
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: { _id: 'r1', name: 'Admin Updated' },
    });

    expect((result as { name: string }).name).toBe('Admin Updated');
  });

  it('GETs roles and unwraps paginated data', () => {
    let result: unknown;
    service.list().subscribe((r) => (result = r));

    const req: TestRequest = httpMock.expectOne(
      `${BASE}/user-management-service/roles`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      statusCode: 200,
      success: true,
      message: 'ok',
      data: {
        docs: [{ _id: 'r1' }],
        totalDocs: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        pagingCounter: 1,
      },
    });

    expect((result as { docs: unknown[] }).docs).toEqual([{ _id: 'r1' }]);
  });
});
