import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LoadState } from '../../../core/utils/load-state';

/**
 * Generic async-view wrapper that uses content projection.
 *
 * Shows the correct UI for each LoadState status:
 * - `loading` → skeleton loader
 * - `error`   → error-state with Retry button
 * - `empty`   → empty-state
 * - `success` → projected content (ng-content)
 *
 * Usage:
 * ```html
 * <app-async-view [state]="(data$ | async)!" (retry)="load()">
 *   <table>... your content ...</table>
 * </app-async-view>
 * ```
 */
@Component({
  standalone: false,
  selector: 'app-async-view',
  template: `
    <ng-container [ngSwitch]="state.status">
      <!-- Loading -->
      <app-skeleton-table
        *ngSwitchCase="'loading'"
        [rowCount]="skeletonRows"
        [colCount]="skeletonCols">
      </app-skeleton-table>

      <!-- Error -->
      <ng-container *ngSwitchCase="'error'">
        <app-error-state
          [title]="errorTitle"
          [message]="state.error || 'Please try again later.'">
        </app-error-state>
        <div class="retry-container">
          <button mat-stroked-button color="primary" (click)="retry.emit()">
            <mat-icon>refresh</mat-icon>
            Retry
          </button>
        </div>
      </ng-container>

      <!-- Empty -->
      <app-empty-state
        *ngSwitchCase="'empty'"
        [icon]="emptyIcon"
        [title]="emptyTitle"
        [message]="emptyMessage">
      </app-empty-state>

      <!-- Success → project the caller's content -->
      <ng-container *ngSwitchCase="'success'">
        <ng-content></ng-content>
      </ng-container>
    </ng-container>
  `,
  styles: [`
    .retry-container {
      display: flex;
      justify-content: center;
      margin-top: 16px;
    }
    .retry-container button mat-icon {
      margin-right: 4px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class AsyncViewComponent {
  // Required
  @Input() state: LoadState<unknown> = { status: 'loading' };

  // Skeleton config
  @Input() skeletonRows = 5;
  @Input() skeletonCols = 4;

  // Error config
  @Input() errorTitle = 'Something went wrong';

  // Empty config
  @Input() emptyIcon = 'inbox';
  @Input() emptyTitle = 'No data found';
  @Input() emptyMessage = '';

  // Events
  @Output() retry = new EventEmitter<void>();
}
