import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  RkStoriesOverlayComponent,
  RkStoriesHeaderDirective,
  RkStoriesFooterDirective,
  RkStoriesProgressBarDirective,
  RkStoriesNavigationDirective,
  RkStoriesLoadingDirective,
  RkStoriesErrorDirective,
} from '@reelkit/angular-stories-player';
import { HtmlProgressBarComponent } from './html-progress-bar.component';
import {
  customDemos,
  customGroups,
  type CustomDemo,
} from './custom-stories-feed';

/**
 * One card per slot the player lets a page replace, each opening the player
 * with that slot filled and nothing else changed. The same six the react and
 * vue demos show, so the three can be read side by side.
 */
@Component({
  selector: 'app-stories-player-custom-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RkStoriesOverlayComponent,
    RkStoriesHeaderDirective,
    RkStoriesFooterDirective,
    RkStoriesProgressBarDirective,
    RkStoriesNavigationDirective,
    RkStoriesLoadingDirective,
    RkStoriesErrorDirective,
    HtmlProgressBarComponent,
  ],
  styles: [
    `
      .demo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
      }

      .demo-card {
        background-color: #1a1a1a;
        border-radius: 12px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .demo-card h2 {
        color: #fff;
        font-size: 1.1rem;
        font-weight: 500;
      }

      .demo-card p {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.8rem;
        line-height: 1.5;
        flex: 1;
      }

      .pill {
        padding: 6px 14px;
        border: none;
        border-radius: 8px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: background 150ms;
        background: rgba(255, 255, 255, 0.15);
        color: #fff;
      }

      .pill--solid {
        background-color: #fff;
        color: #000;
        font-weight: 500;
      }

      .pill--accent {
        background: rgba(99, 102, 241, 0.3);
        color: #a78bfa;
        backdrop-filter: blur(8px);
      }

      .pill--glass {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(8px);
      }

      .custom-header {
        position: absolute;
        top: 40px;
        left: 12px;
        right: 12px;
        z-index: 20;
        display: flex;
        align-items: center;
        justify-content: space-between;
        pointer-events: auto;
      }

      .custom-header .author {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .custom-header img {
        width: 28px;
        height: 28px;
        border-radius: 50%;
      }

      .custom-header .name {
        color: #fff;
        font-size: 13px;
        font-weight: 600;
      }

      .custom-header .actions {
        display: flex;
        gap: 8px;
      }

      .custom-header .pill {
        font-size: 0.7rem;
      }

      .custom-footer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 16px 12px;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 10;
        pointer-events: auto;
      }

      .custom-footer input {
        flex: 1;
        padding: 8px 12px;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 13px;
        outline: none;
      }

      .nav-column {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex-shrink: 0;
      }

      .nav-gap {
        width: 16px;
      }

      .loading-badge {
        position: absolute;
        top: 22px;
        right: 72px;
        z-index: 20;
        color: #fff;
        font-size: 12px;
        background: rgba(99, 102, 241, 0.8);
        padding: 4px 12px;
        border-radius: 12px;
        pointer-events: none;
      }

      .error-panel {
        position: absolute;
        inset: 0;
        z-index: 5;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        background: linear-gradient(145deg, #2d1b1b 0%, #1a1a2e 100%);
        color: #ff6b6b;
        pointer-events: none;
      }

      .error-panel .mark {
        font-size: 48px;
      }

      .error-panel .label {
        font-size: 14px;
      }

      /* The tokens cascade into the overlay rendered inside this element, so
         the demo rebrands the player without touching a component. */
      .themed {
        --rk-stories-overlay-bg: #0f172a;
        --rk-stories-container-radius: 24px;
        --rk-stories-nav-bg: rgba(99, 102, 241, 0.35);
        --rk-stories-nav-bg-hover: rgba(168, 85, 247, 0.65);
        --rk-stories-top-shade-bg: linear-gradient(
          to bottom,
          rgba(99, 102, 241, 0.5) 0%,
          transparent 100%
        );
        --rk-stories-header-name-fg: #fef3c7;
        --rk-stories-ring-spin-duration: 2s;
      }
    `,
  ],
  template: `
    <div
      style="min-height: 100dvh; background-color: #111; padding: 56px 16px 16px;"
    >
      <div style="max-width: 900px; margin: 0 auto;">
        <h1
          style="color: #fff; font-size: 1.5rem; margin-bottom: 8px; font-weight: 500;"
        >
          Custom Stories Player
        </h1>
        <p
          style="color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-bottom: 32px;"
        >
          Demonstrates template slot customization: headers, footers,
          navigation, progress bars, and loading/error states.
        </p>

        <div class="demo-grid">
          @for (demo of demos; track demo.id) {
            <div class="demo-card">
              <h2>{{ demo.title }}</h2>
              <p>{{ demo.description }}</p>
              <button
                type="button"
                class="pill pill--solid"
                (click)="activeDemo.set(demo.id)"
              >
                Open Demo
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Custom Header -->
      <rk-stories-overlay
        [isOpen]="activeDemo() === 'custom-header'"
        [groups]="groups"
        (closed)="activeDemo.set(null)"
      >
        <ng-template
          rkStoriesHeader
          let-author
          let-onClose="onClose"
          let-isPaused="isPaused"
          let-onTogglePause="onTogglePause"
          let-isMuted="isMuted"
          let-onToggleSound="onToggleSound"
          let-isVideo="isVideo"
        >
          <div class="custom-header">
            <div class="author">
              <img [src]="author.avatar" [alt]="author.name" />
              <span class="name">{{ author.name }}</span>
            </div>
            <div class="actions">
              @if (isVideo) {
                <button type="button" class="pill" (click)="onToggleSound()">
                  {{ isMuted ? 'Unmute' : 'Mute' }}
                </button>
              }
              <button type="button" class="pill" (click)="onTogglePause()">
                {{ isPaused ? 'Play' : 'Pause' }}
              </button>
              <button type="button" class="pill" (click)="onClose()">
                Close
              </button>
            </div>
          </div>
        </ng-template>
      </rk-stories-overlay>

      <!-- Custom Footer -->
      <rk-stories-overlay
        [isOpen]="activeDemo() === 'custom-footer'"
        [groups]="groups"
        (closed)="activeDemo.set(null)"
      >
        <ng-template rkStoriesFooter let-author="author">
          <div class="custom-footer">
            <input
              type="text"
              [placeholder]="'Reply to ' + author.name + '…'"
            />
            <button type="button" class="pill">Send</button>
          </div>
        </ng-template>
      </rk-stories-overlay>

      <!-- Custom Navigation -->
      <rk-stories-overlay
        [isOpen]="activeDemo() === 'custom-navigation'"
        [groups]="groups"
        (closed)="activeDemo.set(null)"
      >
        <ng-template rkStoriesNavigation let-nav>
          <div class="nav-column">
            <button
              type="button"
              class="pill pill--accent"
              (click)="nav.onPrevGroup()"
            >
              Prev Group
            </button>
            <button
              type="button"
              class="pill pill--glass"
              (click)="nav.onPrevStory()"
            >
              Prev
            </button>
          </div>
          <div class="nav-gap"></div>
          <div class="nav-column">
            <button
              type="button"
              class="pill pill--accent"
              (click)="nav.onNextGroup()"
            >
              Next Group
            </button>
            <button
              type="button"
              class="pill pill--glass"
              (click)="nav.onNextStory()"
            >
              Next
            </button>
          </div>
        </ng-template>
      </rk-stories-overlay>

      <!-- Custom Progress Bar -->
      <rk-stories-overlay
        [isOpen]="activeDemo() === 'custom-progress'"
        [groups]="groups"
        (closed)="activeDemo.set(null)"
      >
        <ng-template
          rkStoriesProgressBar
          let-total="totalStories"
          let-activeIndex="activeIndex"
          let-progress="progress"
        >
          <app-html-progress-bar
            [totalStories]="total"
            [activeIndex]="activeIndex"
            [progress]="progress"
          />
        </ng-template>
      </rk-stories-overlay>

      <!-- Custom Loading / Error -->
      <rk-stories-overlay
        [isOpen]="activeDemo() === 'custom-loading-error'"
        [groups]="groups"
        (closed)="activeDemo.set(null)"
      >
        <ng-template rkStoriesLoading let-story>
          <div class="loading-badge">Loading {{ story.mediaType }}…</div>
        </ng-template>
        <ng-template rkStoriesError let-story>
          <div class="error-panel">
            <div class="mark">!</div>
            <div class="label">Failed to load {{ story.mediaType }}</div>
          </div>
        </ng-template>
      </rk-stories-overlay>

      <!-- Themed via CSS Tokens -->
      <div class="themed">
        <rk-stories-overlay
          [isOpen]="activeDemo() === 'theming'"
          [groups]="groups"
          (closed)="activeDemo.set(null)"
        />
      </div>
    </div>
  `,
})
export class StoriesPlayerCustomPageComponent {
  protected readonly demos = customDemos;
  protected readonly groups = customGroups;

  /** Which card was opened, or null with the page at rest. */
  protected readonly activeDemo = signal<CustomDemo['id'] | null>(null);
}
