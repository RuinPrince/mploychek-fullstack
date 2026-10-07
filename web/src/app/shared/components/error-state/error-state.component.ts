import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-error-state',
  template: `
    <div class="error-state">
      <mat-icon>error_outline</mat-icon>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    .error-state {
      text-align: center;
      padding: 48px 16px;
      color: #c62828;
    }
    .error-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; }
    .error-state h3 { margin: 0 0 8px; }
    .error-state p { margin: 0; color: rgba(0,0,0,0.54); }
  `]
})
export class ErrorStateComponent {
  @Input() title = 'Something went wrong';
  @Input() message = 'Please try again later.';
}
