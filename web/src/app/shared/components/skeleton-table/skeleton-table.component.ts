import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-skeleton-table',
  template: `
    <div class="skeleton-table">
      <div class="skeleton-row" *ngFor="let row of rows">
        <div class="skeleton-cell" *ngFor="let col of cols"></div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-table { padding: 16px; }
    .skeleton-row { display: flex; gap: 16px; margin-bottom: 12px; }
    .skeleton-cell {
      flex: 1;
      height: 20px;
      border-radius: 4px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class SkeletonTableComponent {
  @Input() rowCount = 5;
  @Input() colCount = 4;

  get rows(): number[] { return Array(this.rowCount).fill(0); }
  get cols(): number[] { return Array(this.colCount).fill(0); }
}
