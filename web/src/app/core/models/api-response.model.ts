import { User, UserRole } from './user.model';
import { VerificationRecord } from './record.model';

// ── Request shapes ──

export interface LoginRequest {
  userId: string;
  password: string;
  role: UserRole;
}

// ── Response shapes ──

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface MeResponse {
  success: boolean;
  user: User;
}

export interface UsersResponse {
  success: boolean;
  count: number;
  users: User[];
}

export interface UserResponse {
  success: boolean;
  user: User;
}

export interface RecordsResponse {
  success: boolean;
  count: number;
  records: VerificationRecord[];
}

// ── Error shape ──

/**
 * Normalised error produced by the errorInterceptor.
 * Every API error is mapped into this shape so consumers
 * never need to inspect raw HttpErrorResponse.
 */
export interface ApiError {
  status: number;
  message: string;
  code: string;
  errors?: Record<string, string>;  // field-level validation errors
}
