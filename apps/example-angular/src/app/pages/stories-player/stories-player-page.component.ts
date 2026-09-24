import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  RkStoriesOverlayComponent,
  RkStoriesRingListComponent,
  RkStoriesSlideDirective,
  createStoriesViewedStateController,
  type ChromePlacement,
  type DesktopLayout,
} from '@reelkit/angular-stories-player';
import {
  cubeTransition,
  fadeTransition,
  flipTransition,
  slideTransition,
  zoomTransition,
  type TransitionTransformFn,
} from '@reelkit/angular';
import { SegmentedComponent } from '../../components/segmented/segmented.component';
import { persistedSignal } from '../../util/persisted-signal';
import {
  generateGroups,
  kLoadMoreCount,
  nextPage,
  type CustomStory,
} from './stories-feed';
import { StoryCardComponent } from './story-card.component';

const _kTransitions: { label: string; fn: TransitionTransformFn }[] = [
  { label: 'cube', fn: cubeTransition },
  { label: 'flip', fn: flipTransition },
  { label: 'fade', fn: fadeTransition },
  { label: 'zoom', fn: zoomTransition },
  { label: 'slide', fn: slideTransition },
];

@Component({
  selector: 'app-stories-player-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RkStoriesOverlayComponent,
    RkStoriesRingListComponent,
    RkStoriesSlideDirective,
    SegmentedComponent,
    StoryCardComponent,
  ],
  styles: [
    `
      /* A stylesheet rather than inline styles, for the media query: the
         button is for desktop screens only, above the same 768px at which the
         player counts as a phone. It sits one step above the player overlay
         (--rk-stories-overlay-z, 9999). */
      .load-more-groups {
        display: none;
        position: fixed;
        right: 24px;
        bottom: 24px;
        z-index: 10000;
        padding: 10px 18px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
        font-size: 0.85rem;
        cursor: pointer;
        backdrop-filter: blur(8px);
        transition: background 150ms;
      }

      .load-more-groups:hover {
        background: rgba(255, 255, 255, 0.22);
      }

      @media (min-width: 769px) {
        .load-more-groups {
          display: block;
        }
      }
    `,
  ],
  template: `
    <div
      style="min-height: 100dvh; background-color: #111; padding: 56px 16px 16px;"
    >
      <div style="max-width: 1200px; margin: 0 auto;">
        <h1
          style="color: #fff; font-size: 1.5rem; margin-bottom: 24px; font-weight: 500;"
        >
          Stories Player Demo
        </h1>
        <p
          style="color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-bottom: 24px;"
        >
          Click on a story ring to open the player. Tap left/right to navigate
          stories, swipe left/right to switch users. Tap-and-hold to pause,
          double-tap to like.
        </p>
        <p
          style="color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-bottom: 24px;"
        >
          The feed can grow while the player is open. With the Carousel layout
          on a desktop screen, a “Load more” button sits in the corner of the
          open player and adds {{ loadMoreCount }} more authors to the end of
          the feed, the way a real one pages in. Go to the last group and press
          it: the new cards appear beside the player, a click opens them, and
          the player moves on to them instead of closing after the last group.
        </p>

        <div style="display: flex; gap: 8px; margin-bottom: 24px;">
          @for (option of transitions; track option.label) {
            <button
              type="button"
              (click)="transition.set(option.fn)"
              [style.padding]="'6px 14px'"
              [style.border-radius.px]="8"
              [style.border]="'none'"
              [style.font-size]="'0.8rem'"
              [style.cursor]="'pointer'"
              [style.background]="
                transition() === option.fn ? '#fff' : 'rgba(255,255,255,0.15)'
              "
              [style.color]="transition() === option.fn ? '#000' : '#fff'"
            >
              {{ option.label }}
            </button>
          }
          <button
            type="button"
            (click)="viewed.forget()"
            style="margin-left: auto; padding: 6px 14px; border-radius: 8px; border: none; font-size: 0.8rem; cursor: pointer; background: rgba(255,255,255,0.15); color: #fff;"
          >
            clear seen
          </button>
        </div>

        <div
          style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 24px;"
        >
          <app-segmented
            legend="Remember seen"
            [options]="rememberOptions"
            [value]="rememberSeen() ? 'on' : 'off'"
            (picked)="rememberSeen.set($event === 'on')"
          />
          <app-segmented
            legend="Desktop layout"
            [options]="layoutOptions"
            [value]="desktopLayout()"
            (picked)="desktopLayout.set($any($event))"
          />
          <app-segmented
            legend="Progress & header"
            [options]="placementOptions"
            [value]="chromePlacement()"
            (picked)="chromePlacement.set($any($event))"
          />
        </div>

        <rk-stories-ring-list
          [groups]="groups()"
          [viewed]="rememberSeen() ? viewed : undefined"
          (selected)="open($event)"
        />
      </div>

      <rk-stories-overlay
        [isOpen]="isOpen()"
        [groups]="groups()"
        [initialGroupIndex]="selectedGroup()"
        [groupTransition]="transition()"
        [desktopLayout]="desktopLayout()"
        [chromePlacement]="chromePlacement()"
        [viewed]="rememberSeen() ? viewed : undefined"
        (closed)="isOpen.set(false)"
      >
        <!-- The feed carries stories with no media of their own — a promo on a
             gradient, a numbered one in the long group — so the page draws a
             story itself rather than leaving those blank. -->
        <ng-template
          rkStoriesSlide
          let-story
          let-index="index"
          let-groupIndex="groupIndex"
          let-size="size"
          let-activeGroupIndex="activeGroupIndex"
          let-activeStoryIndex="activeStoryIndex"
          let-onReady="onReady"
          let-onError="onError"
          let-onWaiting="onWaiting"
          let-onEnded="onEnded"
          let-onDurationReady="onDurationReady"
        >
          <app-story-card
            [story]="$any(story)"
            [index]="index"
            [groupIndex]="groupIndex"
            [size]="size"
            [activeGroupIndex]="activeGroupIndex"
            [activeStoryIndex]="activeStoryIndex"
            [onReady]="onReady"
            [onError]="onError"
            [onWaiting]="onWaiting"
            [onEnded]="onEnded"
            [onDurationReady]="onDurationReady"
          />
        </ng-template>
      </rk-stories-overlay>

      <!-- Only while the player is open, only on the carousel layout, and only
           on a desktop screen: it sits in the corner of the open player, which
           is where there is room for it beside the cards. -->
      @if (isOpen() && desktopLayout() === 'carousel') {
        <button type="button" class="load-more-groups" (click)="loadMore()">
          Load more ({{ groups().length }} groups)
        </button>
      }
    </div>
  `,
})
export class StoriesPlayerPageComponent {
  protected readonly transitions = _kTransitions;
  protected readonly loadMoreCount = kLoadMoreCount;

  protected readonly rememberOptions = [
    { label: 'On', value: 'on' },
    { label: 'Off', value: 'off' },
  ];

  protected readonly layoutOptions = [
    { label: 'Single', value: 'single' },
    { label: 'Carousel', value: 'carousel' },
  ];

  protected readonly placementOptions = [
    { label: 'Overlay', value: 'overlay' },
    { label: 'Group', value: 'group' },
  ];

  protected readonly isOpen = signal(false);
  protected readonly selectedGroup = signal(0);
  protected readonly transition = signal<TransitionTransformFn>(cubeTransition);
  /**
   * The switches outlive a reload, the way every other switch in this app
   * does: a demo gets flipped, refreshed and looked at again. The keys match
   * the React and Vue demos, so the three read the same stored choice.
   */
  protected readonly desktopLayout = persistedSignal<DesktopLayout>(
    'reelkit-stories-player-desktop-layout',
    'single',
  );

  protected readonly rememberSeen = persistedSignal(
    'reelkit-stories-player-remember-seen',
    true,
  );

  protected readonly chromePlacement = persistedSignal<ChromePlacement>(
    'reelkit-stories-player-chrome-placement',
    'overlay',
  );

  /**
   * The feed grows: "Load more" hands over a longer array while the player is
   * open, and the player takes the new groups on without losing its place.
   */
  protected readonly groups = signal(generateGroups());

  /**
   * One controller for what has been seen, handed to both the ring list and
   * the player. It reads the groups through the signal, so groups added later
   * are counted too.
   */
  protected readonly viewed = createStoriesViewedStateController<CustomStory>({
    storageKey: 'reelkit-angular-stories-seen',
    groups: () => this.groups(),
  });

  protected open(groupIndex: number): void {
    this.selectedGroup.set(groupIndex);
    this.isOpen.set(true);
  }

  protected loadMore(): void {
    this.groups.update((groups) => [...groups, ...nextPage(groups.length)]);
  }
}
