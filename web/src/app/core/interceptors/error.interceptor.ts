import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { ApiError } from '../models/api-response.model';

/**
 * Maps every HTTP error into a typed `ApiError` and handles
 * 401 globally by clearing the session and redirecting to /login.
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private session: SessionService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((response: HttpErrorResponse) => {
        // 401 → session expired or invalid token
        if (response.status === 401) {
          this.session.clearToken();
          this.router.navigate(['/login']);
        }

        // Normalise into ApiError regardless of status
        const body = response.error as Record<string, unknown> | null;

        const apiError: ApiError = {
          status: response.status,
          message: (body?.['message'] as string) ?? response.statusText ?? 'Unknown error',
          code: (body?.['code'] as string) ?? 'ERROR',
          errors: body?.['errors'] as Record<string, string> | undefined,
        };

        return throwError(() => apiError);
      })
    );
  }
}
