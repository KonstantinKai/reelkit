import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { ICON_HEART } from '../icons/icons';

const MILLION = 1_000_000;
const THOUSAND = 1_000;

/**
 * Instagram/TikTok-style gradient overlay displayed at the bottom of each slide.
 *
 * Shows author avatar + name, a short description (2-line clamp), and a
 * like count with a heart icon. Renders nothing when all props are omitted.
 */
@Component({
  selector: 'rk-slide-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (hasContent()) {
      <div class="rk-reel-slide-overlay">
        @if (author()) {
          <div class="rk-reel-slide-overlay-author">
            @if (!avatarError()) {
              <img
                class="rk-reel-slide-overlay-avatar"
                [src]="author()!.avatar"
                [alt]="author()!.name"
                (error)="avatarError.set(true)"
              />
            }
            <span class="rk-reel-slide-overlay-name">{{ author()!.name }}</span>
          </div>
        }
        @if (description()) {
          <p class="rk-reel-slide-overlay-description">{{ description() }}</p>
        }
        @if (likes() !== undefined) {
          <div
            class="rk-reel-slide-overlay-likes"
            [attr.aria-label]="likes()! + ' likes'"
          >
            <span
              [innerHTML]="iconHeart"
              class="rk-slide-overlay-heart"
              aria-hidden="true"
            ></span>
            <span aria-hidden="true">{{ formatLikes(likes()!) }}</span>
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      .rk-slide-overlay-heart {
        display: flex;
        align-items: center;
      }
      .rk-slide-overlay-heart svg {
        pointer-events: none;
      }
    `,
  ],
})
export class RkSlideOverlayComponent {
  /** Author info. When provided, renders an avatar image and display name. */
  readonly author = input<{ name: string; avatar: string } | undefined>(
    undefined,
  );

  /**
   * Tracks avatar load failure to hide broken image gracefully.
   * Resets to `false` automatically via `linkedSignal` whenever `author`
   * changes, so navigating to a new slide gives the next avatar a fresh load
   * attempt. This replaces the previous `effect()`-sets-signal anti-pattern.
   */
  protected readonly avatarError = linkedSignal(() => {
    void this.author();
    return false;
  });

  /** Description text. Clamped to 2 lines via CSS. */
  readonly description = input<string | undefined>(undefined);

  /** Like count. Formatted compactly (e.g. 1.2K, 3.5M). Shown with a heart icon. */
  readonly likes = input<number | undefined>(undefined);

  readonly hasContent = computed(
    () =>
      this.author() != null ||
      this.description() != null ||
      this.likes() != null,
  );

  private readonly _sanitizer = inject(DomSanitizer);

  protected readonly iconHeart: SafeHtml =
    this._sanitizer.bypassSecurityTrustHtml(ICON_HEART);

  /**
   * Formats a like count into a compact human-readable string.
   * - >= 1,000,000 → "1.2M"
   * - >= 1,000 → "4.5K"
   * - < 1,000 → raw number as string
   */
  protected formatLikes(count: number): string {
    if (count >= MILLION) {
      return `${(count / MILLION).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (count >= THOUSAND) {
      return `${(count / THOUSAND).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return String(count);
  }
}
