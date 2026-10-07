import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UsersResponse, UserResponse } from '../models/api-response.model';
import { User, UserRole, UserStatus } from '../models/user.model';

// ── Request param shapes ──

export interface GetUsersParams {
  search?: string;
  status?: UserStatus;
  delayMs?: number;
}

export interface CreateUserPayload {
  userId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status?: UserStatus;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(params?: GetUsersParams): Observable<UsersResponse> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.delayMs) httpParams = httpParams.set('delay', String(params.delayMs));
    return this.http.get<UsersResponse>(this.baseUrl, { params: httpParams });
  }

  getUser(userId: string, delayMs?: number): Observable<UserResponse> {
    let httpParams = new HttpParams();
    if (delayMs) httpParams = httpParams.set('delay', String(delayMs));
    return this.http.get<UserResponse>(`${this.baseUrl}/${userId}`, { params: httpParams });
  }

  createUser(data: CreateUserPayload, delayMs?: number): Observable<UserResponse> {
    let httpParams = new HttpParams();
    if (delayMs) httpParams = httpParams.set('delay', String(delayMs));
    return this.http.post<UserResponse>(this.baseUrl, data, { params: httpParams });
  }

  updateUser(userId: string, data: UpdateUserPayload, delayMs?: number): Observable<UserResponse> {
    let httpParams = new HttpParams();
    if (delayMs) httpParams = httpParams.set('delay', String(delayMs));
    return this.http.put<UserResponse>(`${this.baseUrl}/${userId}`, data, { params: httpParams });
  }

  deactivateUser(userId: string, delayMs?: number): Observable<UserResponse> {
    let httpParams = new HttpParams();
    if (delayMs) httpParams = httpParams.set('delay', String(delayMs));
    return this.http.delete<UserResponse>(`${this.baseUrl}/${userId}`, { params: httpParams });
  }
}
