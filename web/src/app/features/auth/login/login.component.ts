import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/api-response.model';
import { ApiError } from '../../../core/models/api-response.model';
import { UserRole } from '../../../core/models/user.model';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  showDemoHint = false;
  hidePassword = true;
  returnUrl = '/dashboard';

  readonly roles: { value: UserRole; label: string }[] = [
    { value: 'GENERAL_USER', label: 'General User' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  private destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // If already logged in, redirect away from /login
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Capture returnUrl from query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    this.loginForm = this.fb.group({
      userId: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', [Validators.required]],
    });
  }

  /** Convenience getter for template validation access. */
  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    // Mark all fields as touched to trigger validation messages
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const req: LoginRequest = this.loginForm.getRawValue() as LoginRequest;

    this.auth.login(req).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err: ApiError) => {
        this.loading = false;
        this.errorMessage = err.message;
      },
    });
  }

  dismissError(): void {
    this.errorMessage = null;
  }
}
