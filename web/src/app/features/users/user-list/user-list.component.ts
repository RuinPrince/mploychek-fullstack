import { Component, OnInit, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, startWith, debounceTime, take } from 'rxjs/operators';

import { UserService, GetUsersParams } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { DelayService } from '../../../core/services/delay.service';
import { withLoadState, LoadState } from '../../../core/utils/load-state';
import { User, UserStatus } from '../../../core/models/user.model';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';

@Component({
  standalone: false,
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit {
  filterForm: FormGroup;
  private retryTrigger = new BehaviorSubject<void>(undefined);

  usersState$!: Observable<LoadState<MatTableDataSource<User>>>;
  dataSource = new MatTableDataSource<User>([]);
  
  currentUserId = '';

  readonly statuses: { label: string; value: UserStatus | '' }[] = [
    { label: 'All Statuses', value: '' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
  ];

  private destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private auth: AuthService,
    private delayService: DelayService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.auth.currentUser$?.pipe(take(1)).subscribe((u: User | null) => {
      this.currentUserId = u?.userId || '';
    });
    
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
    });
  }

  ngOnInit(): void {
    const filters$ = this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      debounceTime(300)
    );

    this.usersState$ = combineLatest([
      filters$,
      this.retryTrigger
    ]).pipe(
      switchMap(([filters]) => {
        const params: GetUsersParams = {
          delayMs: this.delayService.current
        };

        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;

        return this.userService.getUsers(params).pipe(
          map(res => res.users),
          withLoadState(),
          map(state => {
            if (state.status === 'success' && state.data) {
              this.dataSource.data = state.data;
              return { ...state, data: this.dataSource };
            }
            return state as unknown as LoadState<MatTableDataSource<User>>;
          })
        );
      })
    );
  }

  retry(): void {
    this.retryTrigger.next();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result: User | undefined) => {
      if (result) {
        this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
        this.retry(); // Refresh the list
      }
    });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px',
      data: { user }
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result: User | undefined) => {
      if (result) {
        this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
        this.retry(); // Refresh the list
      }
    });
  }

  deactivateUser(user: User): void {
    if (user.userId === this.currentUserId) return;

    const data: ConfirmDialogData = {
      title: 'Deactivate User',
      message: `Are you sure you want to deactivate ${user.name}? They will no longer be able to log in.`,
      confirmText: 'Deactivate',
      isDestructive: true
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(confirmed => {
      if (confirmed) {
        this.userService.deactivateUser(user.userId, this.delayService.current)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.snackBar.open('User deactivated successfully', 'Close', { duration: 3000 });
            this.retry();
          },
          error: (err) => {
            const msg = err.message || 'Failed to deactivate user';
            this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: 'error-snackbar' });
          }
        });
      }
    });
  }
}
