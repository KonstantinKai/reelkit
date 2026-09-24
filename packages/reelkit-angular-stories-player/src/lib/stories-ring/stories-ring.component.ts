import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  output,
} from '@angular/core';
import {
  getRingPresentation,
  kStoriesRingSize,
  type AuthorInfo,
} from '@reelkit/stories-core';

/**
 * Circular avatar with a gradient ring.
 *
 * The ring has two states: a group with anything left to watch gets the
 * rotating gradient, a fully watched one gets a flat muted ring. Progress
 * within a group is not drawn here — the progress bar inside the player
 * carries that.
 */
@Component({
  selector: 'rk-stories-ring',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div
      [class]="presentation().className"
      [style]="presentation().style"
      (click)="clicked.emit()"
      (keydown.enter)="clicked.emit()"
      (keydown.space)="$event.preventDefault(); clicked.emit()"
      role="button"
      tabindex="0"
      [attr.aria-label]="ariaLabel()"
    >
      <img
        class="rk-stories-ring-avatar"
        [src]="author().avatar"
        [alt]="author().name"
        [width]="presentation().avatarSize"
        [height]="presentation().avatarSize"
      />
    </div>
  `,
})
export class RkStoriesRingComponent {
  /** Only the avatar and the name are drawn; nothing keys on the id here. */
  readonly author = input.required<AuthorInfo>();

  /** A group of 0 draws no ring at all, just the avatar. */
  readonly totalStories = input.required<number>();

  /** Short of `totalStories` keeps the gradient; reaching it mutes the ring. */
  readonly viewedCount = input.required<number>();

  /**
   * Outer ring diameter in pixels.
   *
   * @default 68
   */
  readonly size = input(kStoriesRingSize);

  /**
   * Gradient colours for a group with stories left to watch.
   *
   * @default the built-in gradient
   */
  readonly gradientColors = input<string[] | undefined>(undefined);

  /**
   * Colour for a fully watched group.
   *
   * @default 'rgba(255,255,255,0.25)'
   */
  readonly viewedColor = input<string | undefined>(undefined);

  /** The ring is a button and nothing more — opening the player is yours. */
  readonly clicked = output<void>();

  protected readonly ariaLabel = computed(
    () => `${this.author().name}'s stories`,
  );

  protected readonly presentation = computed(() =>
    getRingPresentation({
      totalStories: this.totalStories(),
      viewedCount: this.viewedCount(),
      size: this.size(),
      gradientColors: this.gradientColors(),
      viewedColor: this.viewedColor(),
    }),
  );
}
