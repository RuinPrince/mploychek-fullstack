import { NgModule, Optional, SkipSelf, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { AuthService } from './services/auth.service';

/**
 * APP_INITIALIZER factory.
 *
 * On application start, if a JWT token exists in localStorage,
 * we call `GET /api/auth/me` to rehydrate `AuthService.currentUser$`
 * before any route guard fires. This way a page refresh doesn't
 * lose the authenticated state.
 *
 * If the call fails (expired token, revoked user, network error)
 * the session is silently cleared and the user will land on /login
 * when a guarded route is accessed.
 */
function initializeApp(auth: AuthService): () => Promise<boolean> {
  return () => firstValueFrom(auth.restoreSession());
}

@NgModule({
  imports: [HttpClientModule],
  providers: [
    // Interceptors (order matters: auth first, then error)
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

    // Rehydrate session on app boot
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService],
      multi: true,
    },
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it only in AppModule.');
    }
  }
}
