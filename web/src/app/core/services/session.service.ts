import { Injectable } from '@angular/core';

const TOKEN_KEY = 'mploychek_token';

/**
 * SessionService wraps all localStorage access.
 * Only the JWT token is stored — the current user lives in AuthService's
 * BehaviorSubject (and is rehydrated via /api/auth/me on app load).
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }
}
