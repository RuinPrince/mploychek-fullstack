import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-status-badge',
  template: `<span class="badge" [ngClass]="statusClass">{{ status }}</span>`,
  styles: [`
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .badge-verified, .badge-active { background: var(--color-verified-bg); color: var(--color-verified); }
    .badge-pending { background: var(--color-pending-bg); color: var(--color-pending); }
    .badge-rejected { background: var(--color-rejected-bg); color: var(--color-rejected); }
    .badge-inactive { background: var(--color-inactive-bg); color: var(--color-inactive); }
  `]
})
export class StatusBadgeComponent {
  @Input() status = '';

  get statusClass(): string {
    return 'badge-' + this.status.toLowerCase();
  }
}
