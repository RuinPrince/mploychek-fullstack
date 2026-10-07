import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { UserService, CreateUserPayload, UpdateUserPayload } from '../../../core/services/user.service';
import { DelayService } from '../../../core/services/delay.service';
import { User } from '../../../core/models/user.model';

@Component({
  standalone: false,
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;
  isEditMode: boolean;
  isSubmitting = new BehaviorSubject<boolean>(false);
  serverError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private delayService: DelayService,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user?: User }
  ) {
    this.isEditMode = !!data?.user;

    this.userForm = this.fb.group({
      userId: [
        { value: '', disabled: this.isEditMode }, 
        [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]
      ],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [Validators.minLength(6)] : [Validators.required, Validators.minLength(6)]],
      role: ['GENERAL_USER', Validators.required],
      status: ['ACTIVE', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.user) {
      this.userForm.patchValue({
        userId: this.data.user.userId,
        name: this.data.user.name,
        email: this.data.user.email,
        role: this.data.user.role,
        status: this.data.user.status,
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.serverError = null;
    this.isSubmitting.next(true);

    const formVal = this.userForm.getRawValue();
    const delay = this.delayService.current;

    const req$ = this.isEditMode
      ? this.userService.updateUser(this.data.user!.userId, this.cleanUpdatePayload(formVal), delay)
      : this.userService.createUser(formVal as CreateUserPayload, delay);

    req$.pipe(
      finalize(() => this.isSubmitting.next(false))
    ).subscribe({
      next: (res) => {
        this.dialogRef.close(res.user);
      },
      error: (err) => {
        const msg = err.message || 'An unknown error occurred';
        if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('already exists')) {
          if (msg.toLowerCase().includes('email')) {
             this.userForm.get('email')?.setErrors({ serverError: msg });
          } else {
             this.userForm.get('userId')?.setErrors({ serverError: msg });
          }
        } else {
          this.serverError = msg;
        }
      }
    });
  }

  private cleanUpdatePayload(val: any): UpdateUserPayload {
    const payload: UpdateUserPayload = {
      name: val.name,
      email: val.email,
      role: val.role,
      status: val.status,
    };
    if (val.password) {
      payload.password = val.password;
    }
    return payload;
  }
}
