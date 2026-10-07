import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-empty-state',
  template: `
    <div class="empty-state">
      <mat-icon>{{ icon }}</mat-icon>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    .empty-state {
      text-align: center;
      padding: 48px 16px;
      color: rgba(0,0,0,0.54);
    }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; }
    .empty-state h3 { margin: 0 0 8px; }
    .empty-state p { margin: 0; }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'No data';
  @Input() message = '';
}
