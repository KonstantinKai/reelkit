import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  contentChild,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import {
  cubeTransition,
  type TransitionTransformFn,
  type TwoAxisPosition,
  type UrlStateController,
} from '@reelkit/angular';
import type {
  StoriesGroup,
  StoriesViewedStateController,
  StoryItem,
} from '@reelkit/stories-core';
import { RkStoriesOverlayComponent } from './stories-overlay.component';
import {
  RkStoriesSlideDirective,
  RkStoriesHeaderDirective,
  RkStoriesFooterDirective,
  RkStoriesProgressBarDirective,
  RkStoriesNavigationDirective,
  RkStoriesLoadingDirective,
  RkStoriesErrorDirective,
  RkStoriesGroupPreviewDirective,
} from '../template-slots/stories-template-slots';
import { attachViewedState } from '../viewed-state/attach-viewed-state';
import type { ChromePlacement, DesktopLayout, StoriesApi } from '../types';

/**
 * Stories player whose open state lives in the URL.
 *
 * Same player as {@link RkStoriesOverlayComponent}; the difference is who
 * decides it is open. Here that is a `UrlStateController` built with
 * `createOverlayUrlState` and `urlIndexTwoAxisKey`, so the story on screen has
 * an address: it can be linked to, shared, and closed with the back button.
 *
 * The position carries both axes — the outer being the group and the inner the
 * story within it — so moving through a group rides in the URL alongside the
 * group itself. Opening pushes one history entry and every story after
 * replaces it, so a single back step always leaves the player.
 *
 * @example
 * ```ts
 * protected readonly story = createOverlayUrlState({
 *   param: 'story',
 *   ...urlIndexTwoAxisKey(() => this.groups().map((g) => g.stories.length)),
 * });
 * ```
 * ```html
 * <a [routerLink]="[]" [queryParams]="{ story: '0.0' }">Open</a>
 * <rk-stories-url-overlay [controller]="story" [groups]="groups()" />
 * ```
 *
 * @typeParam T - Story item type.
 */
@Component({
  selector: 'rk-stories-url-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [RkStoriesOverlayComponent],
  template: `
    <rk-stories-overlay
      [isOpen]="position() !== null"
      [groups]="groups()"
      [initialGroupIndex]="position()?.outer ?? 0"
      [initialStoryIndex]="position()?.inner"
      [groupTransition]="groupTransition() ?? cubeTransition"
      [defaultImageDuration]="defaultImageDuration()"
      [innerTransitionDuration]="innerTransitionDuration()"
      [minSegmentWidth]="minSegmentWidth()"
      [tapZoneSplit]="tapZoneSplit()"
      [hideUIOnPause]="hideUIOnPause()"
      [enableKeyboard]="enableKeyboard()"
      [desktopLayout]="desktopLayout()"
      [chromePlacement]="chromePlacement()"
      [ariaLabel]="ariaLabel()"
      [viewed]="viewed()"
      [resumeStoryIndex]="resumeStoryIndex()"
      [slideTemplate]="slideSlot()?.templateRef"
      [headerTemplate]="headerSlot()?.templateRef"
      [footerTemplate]="footerSlot()?.templateRef"
      [progressBarTemplate]="progressBarSlot()?.templateRef"
      [navigationTemplate]="navigationSlot()?.templateRef"
      [loadingTemplate]="loadingSlot()?.templateRef"
      [errorTemplate]="errorSlot()?.templateRef"
      [groupPreviewTemplate]="groupPreviewSlot()?.templateRef"
      (closed)="handleClosed()"
      (storyChanged)="handleStoryChanged($event)"
      (groupChanged)="groupChanged.emit($event)"
      (storyViewed)="storyViewed.emit($event)"
      (storyCompleted)="storyCompleted.emit($event)"
      (doubleTapped)="doubleTapped.emit($event)"
      (paused)="paused.emit()"
      (resumed)="resumed.emit()"
      (apiReady)="apiReady.emit($event)"
    />
    <!-- Declares the projection outlet so the slot directives are created and
         the queries below have something to match. Every slot is an
         <ng-template>, so nothing renders here. -->
    <ng-content />
  `,
})
export class RkStoriesUrlOverlayComponent<T extends StoryItem = StoryItem> {
  /**
   * Controller from `createOverlayUrlState`. Its position decides whether the
   * player is open and where it opens; this component writes back through it
   * on every story change and on close.
   */
  readonly controller = input.required<UrlStateController<TwoAxisPosition>>();

  /** The groups to play, in order. */
  readonly groups = input.required<StoriesGroup<T>[]>();

  readonly groupTransition = input<TransitionTransformFn | undefined>(
    undefined,
  );
  readonly defaultImageDuration = input(5000);
  readonly innerTransitionDuration = input(200);
  readonly minSegmentWidth = input(8);
  readonly tapZoneSplit = input(0.3);
  readonly hideUIOnPause = input(true);
  readonly enableKeyboard = input(true);
  readonly desktopLayout = input<DesktopLayout>('single');
  readonly chromePlacement = input<ChromePlacement>('overlay');
  readonly ariaLabel = input('Stories player');
  readonly viewed = input<StoriesViewedStateController | undefined>(undefined);
  readonly resumeStoryIndex = input<
    ((groupIndex: number) => number) | undefined
  >(undefined);

  /** Emitted after the player closes. The URL drives closing, not this. */
  readonly closed = output<void>();

  readonly storyChanged = output<{ groupIndex: number; storyIndex: number }>();
  readonly groupChanged = output<number>();
  readonly storyViewed = output<{ groupIndex: number; storyIndex: number }>();
  readonly storyCompleted = output<{
    groupIndex: number;
    storyIndex: number;
  }>();
  readonly doubleTapped = output<{ groupIndex: number; storyIndex: number }>();
  readonly paused = output<void>();
  readonly resumed = output<void>();
  readonly apiReady = output<StoriesApi>();

  /**
   * The slot queries run here, not on the inner player.
   *
   * A content query does not reach through a wrapper's own `<ng-content>`, so
   * projecting the consumer's templates inward would leave every slot
   * unmatched. Reading them here — where the content is direct — and passing
   * each template down as an input is what makes the wrapper work.
   */
  protected readonly slideSlot = contentChild(RkStoriesSlideDirective);
  protected readonly headerSlot = contentChild(RkStoriesHeaderDirective);
  protected readonly footerSlot = contentChild(RkStoriesFooterDirective);
  protected readonly progressBarSlot = contentChild(
    RkStoriesProgressBarDirective,
  );
  protected readonly navigationSlot = contentChild(
    RkStoriesNavigationDirective,
  );
  protected readonly loadingSlot = contentChild(RkStoriesLoadingDirective);
  protected readonly errorSlot = contentChild(RkStoriesErrorDirective);
  protected readonly groupPreviewSlot = contentChild(
    RkStoriesGroupPreviewDirective,
  );

  protected readonly position = signal<TwoAxisPosition | null>(null);

  /** Default for the group transition, so the input stays optional. */
  protected readonly cubeTransition = cubeTransition;

  constructor() {
    // The viewed store is read here as well as inside the player: this
    // component exists before the player opens, and the opening story is
    // chosen while the player first renders.
    attachViewedState(this.viewed);

    // The controller arrives as an input, so it cannot be read in a field
    // initialiser. An effect defers until it is bound and re-subscribes if a
    // different controller is passed, dropping the old subscription with it.
    effect((onCleanup) => {
      const controller = this.controller();
      this.position.set(controller.position.value);
      onCleanup(
        controller.position.observe(() => {
          this.position.set(controller.position.value);
        }),
      );
    });
  }

  protected handleClosed(): void {
    this.controller().set(null);
    this.closed.emit();
  }

  protected handleStoryChanged(change: {
    groupIndex: number;
    storyIndex: number;
  }): void {
    this.controller().set({
      outer: change.groupIndex,
      inner: change.storyIndex,
    });
    this.storyChanged.emit(change);
  }
}
