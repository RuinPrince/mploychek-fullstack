import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let sessionSpy: jasmine.SpyObj<SessionService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    sessionSpy = jasmine.createSpyObj('SessionService', ['setToken', 'clearToken', 'hasToken']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SessionService, useValue: sessionSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should set token and emit user on successful login', () => {
      const mockReq = { userId: 'user001', password: 'password', role: 'GENERAL_USER' as const };
      const mockRes = {
        success: true,
        token: 'fake-jwt-token',
        user: { userId: 'user001', name: 'Test User', email: 'test@example.com', role: 'GENERAL_USER', status: 'ACTIVE' }
      };

      service.login(mockReq).subscribe(res => {
        expect(res).toEqual(mockRes as any);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockReq);
      req.flush(mockRes);

      expect(sessionSpy.setToken).toHaveBeenCalledWith('fake-jwt-token');
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.hasRole('GENERAL_USER')).toBeTrue();
    });
  });
});
