import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { PageHeaderComponent } from './components/page-header/page-header.component';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { ErrorStateComponent } from './components/error-state/error-state.component';
import { SkeletonTableComponent } from './components/skeleton-table/skeleton-table.component';
import { AsyncViewComponent } from './components/async-view/async-view.component';

const COMPONENTS = [
  PageHeaderComponent,
  StatusBadgeComponent,
  EmptyStateComponent,
  ErrorStateComponent,
  SkeletonTableComponent,
  AsyncViewComponent,
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [CommonModule, MatIconModule, MatButtonModule],
  exports: [...COMPONENTS],
})
export class SharedModule {}
