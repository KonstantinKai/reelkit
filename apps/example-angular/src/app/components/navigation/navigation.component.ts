import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

const links = [
  { to: '/', label: 'Full Page Slider' },
  { to: '/reel-player', label: 'Reel Player' },
  { to: '/reel-player-custom', label: 'Custom Player' },
  { to: '/image-preview', label: 'Image Gallery' },
  { to: '/image-preview-custom', label: 'Custom Gallery' },
  { to: '/image-preview-video', label: 'Video Gallery' },
];

@Component({
  selector: 'app-navigation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="nav">
      @for (link of links; track link.to) {
        <a
          [routerLink]="link.to"
          routerLinkActive="nav-link--active"
          [routerLinkActiveOptions]="{ exact: link.to === '/' }"
          class="nav-link"
        >
          {{ link.label }}
        </a>
      }
    </nav>
  `,
  styles: [
    `
      .nav {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        box-sizing: border-box;
        z-index: 1000;
        display: flex;
        gap: 6px;
        padding: 8px 12px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        background: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.6) 0%,
          rgba(0, 0, 0, 0) 100%
        );
      }

      .nav::-webkit-scrollbar {
        display: none;
      }

      .nav-link {
        padding: 6px 12px;
        background-color: rgba(0, 0, 0, 0.5);
        color: #fff;
        text-decoration: none;
        border-radius: 8px;
        font-size: 0.8rem;
        transition: background-color 0.2s;
        white-space: nowrap;
        flex-shrink: 0;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      .nav-link--active {
        background-color: rgba(255, 255, 255, 0.9);
        color: #000;
      }
    `,
  ],
})
export class NavigationComponent {
  protected readonly links = links;
}
