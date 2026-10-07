import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { RecordService } from '../../../core/services/record.service';
import { DelayService } from '../../../core/services/delay.service';
import { withLoadState, LoadState } from '../../../core/utils/load-state';
import { User } from '../../../core/models/user.model';
import { VerificationRecord } from '../../../core/models/record.model';

interface RecordStats {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
}

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  profileState$!: Observable<LoadState<User>>;
  recordsState$!: Observable<LoadState<VerificationRecord[]>>;
  statsState$!: Observable<LoadState<RecordStats>>;

  /** Time-based greeting */
  greeting = '';

  constructor(
    public auth: AuthService,
    private recordService: RecordService,
    private delayService: DelayService
  ) {}

  ngOnInit(): void {
    this.greeting = this.getGreeting();
    this.loadAll();
  }

  /** Re-fires both API calls independently */
  loadAll(): void {
    this.loadProfile();
    this.loadRecords();
  }

  // ── Private loaders ─────────────────────────────────────────

  private loadProfile(): void {
    this.profileState$ = this.auth.getMe(this.delayService.current).pipe(
      map(res => res.user),
      withLoadState()
    );
  }

  private loadRecords(): void {
    const records$ = this.recordService
      .getRecords({ delayMs: this.delayService.current })
      .pipe(map(res => res.records));

    // Feed the full list into recordsState (latest 5 for the panel)
    this.recordsState$ = records$.pipe(
      map(records => records.slice(0, 5)),
      withLoadState()
    );

    // Compute stats from the same API call
    this.statsState$ = this.recordService
      .getRecords({ delayMs: this.delayService.current })
      .pipe(
        map(res => {
          const records = res.records;
          return {
            total: records.length,
            verified: records.filter(r => r.status === 'VERIFIED').length,
            pending: records.filter(r => r.status === 'PENDING').length,
            rejected: records.filter(r => r.status === 'REJECTED').length,
          } as RecordStats;
        }),
        withLoadState()
      );
  }

  // ── Helpers ─────────────────────────────────────────────────

  private getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  /** Generate initials from a name string */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  /** Human-readable role label */
  getRoleLabel(role: string): string {
    return role === 'ADMIN' ? 'Admin' : 'General User';
  }
}
