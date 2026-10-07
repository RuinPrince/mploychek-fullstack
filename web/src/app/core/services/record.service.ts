import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RecordsResponse } from '../models/api-response.model';
import { RecordStatus, RecordType } from '../models/record.model';

export interface GetRecordsParams {
  userId?: string;
  status?: RecordStatus;
  type?: RecordType;
  delayMs?: number;
}

@Injectable({ providedIn: 'root' })
export class RecordService {
  private readonly baseUrl = `${environment.apiBaseUrl}/records`;

  constructor(private http: HttpClient) {}

  getRecords(params?: GetRecordsParams): Observable<RecordsResponse> {
    let httpParams = new HttpParams();
    if (params?.userId) httpParams = httpParams.set('userId', params.userId);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.type) httpParams = httpParams.set('type', params.type);
    if (params?.delayMs) httpParams = httpParams.set('delay', String(params.delayMs));
    return this.http.get<RecordsResponse>(this.baseUrl, { params: httpParams });
  }
}
