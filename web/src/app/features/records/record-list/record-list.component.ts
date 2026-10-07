import { Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, startWith, debounceTime } from 'rxjs/operators';

import { RecordService, GetRecordsParams } from '../../../core/services/record.service';
import { AuthService } from '../../../core/services/auth.service';
import { DelayService } from '../../../core/services/delay.service';
import { withLoadState, LoadState } from '../../../core/utils/load-state';
import { VerificationRecord, RecordStatus, RecordType } from '../../../core/models/record.model';

@Component({
  standalone: false,
  selector: 'app-record-list',
  templateUrl: './record-list.component.html',
  styleUrls: ['./record-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordListComponent implements OnInit, AfterViewInit {
  filterForm: FormGroup;
  isAdmin = false;
  
  private retryTrigger = new BehaviorSubject<void>(undefined);

  recordsState$!: Observable<LoadState<MatTableDataSource<VerificationRecord>>>;

  // We instantiate a static DataSource so it exists before data arrives.
  // When data arrives, we just update ds.data. This plays nicely with OnPush.
  dataSource = new MatTableDataSource<VerificationRecord>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly statuses: { label: string; value: RecordStatus | '' }[] = [
    { label: 'All Statuses', value: '' },
    { label: 'Verified', value: 'VERIFIED' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  readonly types: { label: string; value: RecordType | '' }[] = [
    { label: 'All Types', value: '' },
    { label: 'Employment', value: 'EMPLOYMENT' },
    { label: 'Education', value: 'EDUCATION' },
    { label: 'Address', value: 'ADDRESS' },
    { label: 'Identity', value: 'IDENTITY' },
    { label: 'Criminal', value: 'CRIMINAL' },
  ];

  constructor(
    private fb: FormBuilder,
    private recordService: RecordService,
    private auth: AuthService,
    private delayService: DelayService
  ) {
    this.isAdmin = this.auth.hasRole('ADMIN');
    
    this.filterForm = this.fb.group({
      userId: [''], // Only useful for admins
      status: [''],
      type: [''],
    });
  }

  ngOnInit(): void {
    const filters$ = this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      debounceTime(300)
    );

    this.recordsState$ = combineLatest([
      filters$,
      this.retryTrigger
    ]).pipe(
      switchMap(([filters]) => {
        const params: GetRecordsParams = {
          delayMs: this.delayService.current
        };

        if (filters.status) params.status = filters.status;
        if (filters.type) params.type = filters.type;
        if (this.isAdmin && filters.userId) params.userId = filters.userId;

        // Fetch using switchMap to cancel stale requests
        return this.recordService.getRecords(params).pipe(
          map(res => res.records),
          withLoadState(),
          map(state => {
            if (state.status === 'success' && state.data) {
              // Update the existing MatTableDataSource
              this.dataSource.data = state.data;
              return { ...state, data: this.dataSource };
            }
            // For loading/error/empty, we can safely cast
            return state as unknown as LoadState<MatTableDataSource<VerificationRecord>>;
          })
        );
      })
    );
  }

  ngAfterViewInit(): void {
    // Attach paginator and sort to the static dataSource
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  retry(): void {
    this.retryTrigger.next();
  }
}
