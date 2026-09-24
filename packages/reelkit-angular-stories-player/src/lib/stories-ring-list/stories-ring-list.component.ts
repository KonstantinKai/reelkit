import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { toAngularSignal } from '@reelkit/angular';
import {
  kStoriesRingListRingSize,
  type StoriesGroup,
  type StoriesViewedStateController,
} from '@reelkit/stories-core';
import { RkStoriesRingComponent } from '../stories-ring/stories-ring.component';
import { attachViewedState } from '../viewed-state/attach-viewed-state';

/**
 * Horizontal row of story rings, one per group, with the author's name under
 * each. Scrolling is native, with the scrollbar hidden.
 *
 * The rings follow the viewed store on their own: marking a story seen
 * repaints them and nothing else.
 */
@Component({
  selector: 'rk-stories-ring-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [RkStoriesRingComponent],
  template: `
    <div class="rk-stories-ring-list">
      @for (group of groups(); track group.author.id; let index = $index) {
        <div class="rk-stories-ring-list-item">
          <rk-stories-ring
            [author]="group.author"
            [totalStories]="group.stories.length"
            [viewedCount]="viewedCountOf(group.author.id)"
            [size]="ringSize()"
            (clicked)="selected.emit(index)"
          />
          <span
            class="rk-stories-ring-list-name"
            [style.max-width.px]="ringSize()"
            >{{ group.author.name }}</span
          >
        </div>
      }
    </div>
  `,
})
export class RkStoriesRingListComponent {
  private readonly _destroyRef = inject(DestroyRef);

  /** Ordered groups to draw. */
  readonly groups = input.required<StoriesGroup[]>();

  /**
   * What the viewer has seen, from `createStoriesViewedStateController`. The
   * list reads the store while it is on screen; without a controller every
   * ring shows the unwatched gradient. Hand the same controller to the player.
   */
  readonly viewed = input<StoriesViewedStateController | undefined>(undefined);

  /**
   * Diameter of each ring in pixels.
   *
   * @default 64
   */
  readonly ringSize = input(kStoriesRingListRingSize);

  /** Emitted with the group index when a ring is chosen. */
  readonly selected = output<number>();

  private readonly _viewedState = computed(() => {
    const controller = this.viewed();
    return controller
      ? toAngularSignal(controller.viewedState, this._destroyRef)
      : undefined;
  });

  constructor() {
    attachViewedState(this.viewed);
  }

  protected viewedCountOf(authorId: string): number {
    return this._viewedState()?.()?.get(authorId) ?? 0;
  }
}
