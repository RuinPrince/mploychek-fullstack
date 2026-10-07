import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-page-header',
  template: `
    <div class="page-header">
      <div class="header-text">
        <h1>{{ title }}</h1>
        <p *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .page-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: var(--space-6); 
    }
    .page-header h1 { 
      margin: 0; 
      font-size: 24px; 
      font-weight: 700;
      font-family: var(--font-heading); 
    }
    .page-header p { 
      margin: 4px 0 0; 
      color: var(--color-text-secondary); 
      font-size: 14px;
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
