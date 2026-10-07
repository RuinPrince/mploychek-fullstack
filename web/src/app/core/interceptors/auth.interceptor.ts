import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionService } from '../services/session.service';
import { environment } from '../../../environments/environment';

/**
 * Attaches `Authorization: Bearer <token>` to every outgoing
 * request whose URL targets the API base.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private session: SessionService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.session.getToken();

    // Only attach to our own API
    if (token && req.url.startsWith(environment.apiBaseUrl)) {
      const cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }
}
