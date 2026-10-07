import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../models/user.model';
import { LoginRequest, LoginResponse, MeResponse } from '../models/api-response.model';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  /** Holds the currently authenticated user, or null. */
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  readonly currentUser$: Observable<User | null> = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private session: SessionService,
    private router: Router
  ) {}

  // ── Public API ───────────────────────────────────────────────

  /**
   * POST /api/auth/login
   * On success the token is persisted via SessionService and
   * currentUser$ is updated with the returned user.
   */
  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, req)
      .pipe(
        tap((res) => {
          this.session.setToken(res.token);
          this.userSubject.next(res.user);
        })
      );
  }

  /** Clears session state and navigates to /login. */
  logout(): void {
    this.session.clearToken();
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  /** Synchronous check — true when a user is loaded in memory. */
  isAuthenticated(): boolean {
    return this.userSubject.value !== null;
  }

  /** Synchronous role check against the in-memory user. */
  hasRole(role: UserRole): boolean {
    return this.userSubject.value?.role === role;
  }

  /**
   * GET /api/auth/me — fetch the current user profile.
   * Used by the dashboard to independently load profile data
   * with the simulated delay. Does NOT update currentUser$.
   */
  getMe(delayMs?: number): Observable<MeResponse> {
    let params = new HttpParams();
    if (delayMs) params = params.set('delay', String(delayMs));
    return this.http.get<MeResponse>(`${this.baseUrl}/me`, { params });
  }

  // ── App Initializer ──────────────────────────────────────────

  /**
   * Called once by APP_INITIALIZER at application startup.
   *
   * If a token exists in localStorage we call GET /api/auth/me
   * to restore `currentUser$` before any route guard runs.
   * If the call fails (expired token, network error, etc.)
   * we silently clear the session so the user lands on /login.
   *
   * Returns an Observable<boolean> that always completes (never errors)
   * so the app always boots — even if rehydration fails.
   */
  restoreSession(): Observable<boolean> {
    if (!this.session.hasToken()) {
      return of(false);
    }

    return this.http.get<MeResponse>(`${this.baseUrl}/me`).pipe(
      tap((res) => this.userSubject.next(res.user)),
      map(() => true),
      catchError(() => {
        this.session.clearToken();
        this.userSubject.next(null);
        return of(false);
      })
    );
  }
}
