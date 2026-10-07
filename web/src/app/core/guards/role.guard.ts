import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Reads `route.data['roles']` (a `UserRole[]`) and checks whether
 * the authenticated user has one of the required roles.
 * If not, redirects to /dashboard.
 *
 * Must be placed *after* AuthGuard so `currentUser$` is guaranteed set.
 */
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as UserRole[] | undefined;

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const hasAccess = requiredRoles.some((role) => this.auth.hasRole(role));

    if (hasAccess) {
      return true;
    }

    this.router.navigate(['/dashboard']);
    return false;
  }
}
