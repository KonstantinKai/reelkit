import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="container">
      <div class="code">404</div>
      <h1>Page not found</h1>
      <p>This page doesn't exist or has been moved.</p>
      <a routerLink="/" class="btn">Back to demos</a>
    </div>
  `,
  styles: [
    `
      .container {
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #111;
        color: #fff;
        text-align: center;
        padding: 0 24px;
      }

      .code {
        font-size: 120px;
        font-weight: 800;
        color: rgba(255, 255, 255, 0.08);
        line-height: 1;
        margin-bottom: 8px;
      }

      h1 {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      p {
        color: rgba(255, 255, 255, 0.5);
        font-size: 14px;
        margin-bottom: 32px;
      }

      .btn {
        padding: 10px 24px;
        border-radius: 8px;
        background-color: #fff;
        color: #000;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
      }
    `,
  ],
})
export class NotFoundComponent {}
