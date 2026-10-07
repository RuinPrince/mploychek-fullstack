import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['hasRole']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(RoleGuard);
  });

  it('should allow navigation if user has required role', () => {
    authServiceSpy.hasRole.and.returnValue(true);
    
    const mockRoute = { data: { roles: ['ADMIN'] } } as any;
    expect(guard.canActivate(mockRoute)).toBe(true);
    expect(authServiceSpy.hasRole).toHaveBeenCalledWith('ADMIN');
  });

  it('should redirect to dashboard if user lacks required role', () => {
    authServiceSpy.hasRole.and.returnValue(false);
    
    const mockRoute = { data: { roles: ['ADMIN'] } } as any;
    const result = guard.canActivate(mockRoute);
    
    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should allow navigation if route defines no roles', () => {
    const mockRoute = { data: {} } as any; // No roles defined
    const result = guard.canActivate(mockRoute);
    
    expect(result).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
