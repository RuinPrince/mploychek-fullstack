import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { filter, map } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { DelayService } from '../../core/services/delay.service';
import { User } from '../../core/models/user.model';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  standalone: false,
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  user: User | null = null;
  pageTitle = 'Dashboard';
  sidebarOpen = true;
  isMobile = false;
  selectedDelay = 0;

  readonly navItems: NavItem[] = [
    { icon: 'dashboard',    label: 'Dashboard', route: '/dashboard' },
    { icon: 'fact_check',   label: 'Records',   route: '/records' },
    { icon: 'people',       label: 'Users',     route: '/users', adminOnly: true },
  ];

  constructor(
    public auth: AuthService,
    public delayService: DelayService,
    private router: Router,
    private breakpoint: BreakpointObserver
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.auth.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((u) => (this.user = u));

    // Track page title from route
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map((e) => this.getTitleFromUrl(e.urlAfterRedirects)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((title) => (this.pageTitle = title));

    // Responsive sidebar
    this.breakpoint
      .observe('(max-width: 768px)')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.isMobile = result.matches;
        this.sidebarOpen = !result.matches;
      });
  }

  get userInitials(): string {
    if (!this.user) return '?';
    const parts = this.user.name.split(' ');
    return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  }

  get visibleNavItems(): NavItem[] {
    return this.navItems.filter(
      (item) => !item.adminOnly || this.user?.role === 'ADMIN'
    );
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeMobileSidebar(): void {
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  onDelayChange(value: number): void {
    this.selectedDelay = value;
    this.delayService.set(value);
  }

  logout(): void {
    this.auth.logout();
  }

  private getTitleFromUrl(url: string): string {
    const segment = url.split('/').filter(Boolean)[0] || 'dashboard';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }
}
