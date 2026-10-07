import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-not-found',
  template: `
    <div style="text-align:center; padding:80px 16px;">
      <h1 style="font-size:72px; margin:0; color:#ccc;">404</h1>
      <p style="font-size:18px; color:#666;">Page not found</p>
      <a routerLink="/dashboard" style="color:#3f51b5;">Go to Dashboard</a>
    </div>
  `,
})
export class NotFoundComponent {}
