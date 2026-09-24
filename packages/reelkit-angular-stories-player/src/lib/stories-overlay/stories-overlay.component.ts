import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
  output,
  type TemplateRef,
} from '@angular/core';
import { cubeTransition, type TransitionTransformFn } from '@reelkit/angular';
import type {
  StoryItem,
  StoriesGroup,
  StoriesViewedStateController,
} from '@reelkit/stories-core';
import { RkStoriesContentComponent } from '../stories-content/stories-content.component';
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
import type {
  DesktopLayout,
  ChromePlacement,
  StoriesApi,
  StoriesErrorContext,
  StoriesGroupPreviewContext,
  StoriesHeaderContext,
  StoriesFooterContext,
  StoriesProgressBarContext,
  StoriesNavigationContext,
  StoriesLoadingContext,
  StoriesSlideContext,
} from '../types';

/**
 * Instagram-style stories player.
 *
 * The player itself lives in a child this component creates when `isOpen`
 * turns true and destroys when it turns false, which is what react and vue
 * get from mounting and unmounting theirs. Everything with a memory — where
 * each group was left, whether the opening story was reported, the timer and
 * the sound setting — belongs to that child, so closing the player forgets it
 * and opening it again is an opening rather than a resume.
 *
 * What survives a close lives here: the inputs, the projected slot templates,
 * and the viewed-state controller, which a ring list outside the player reads
 * whether the player is open or not.
 */
@Component({
  selector: 'rk-stories-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RkStoriesContentComponent],
  template: `
    @if (isOpen()) {
      <rk-stories-content
        [ariaLabel]="ariaLabel()"
        [groups]="groups()"
        [initialGroupIndex]="initialGroupIndex()"
        [initialStoryIndex]="initialStoryIndex()"
        [groupTransition]="groupTransition()"
        [defaultImageDuration]="defaultImageDuration()"
        [innerTransitionDuration]="innerTransitionDuration()"
        [minSegmentWidth]="minSegmentWidth()"
        [viewed]="viewed()"
        [resumeStoryIndex]="resumeStoryIndex()"
        [tapZoneSplit]="tapZoneSplit()"
        [hideUIOnPause]="hideUIOnPause()"
        [enableKeyboard]="enableKeyboard()"
        [desktopLayout]="desktopLayout()"
        [chromePlacement]="chromePlacement()"
        [slideTemplate]="slideTpl()"
        [headerTemplate]="headerTpl()"
        [footerTemplate]="footerTpl()"
        [progressBarTemplate]="progressBarTpl()"
        [navigationTemplate]="navigationTpl()"
        [loadingTemplate]="loadingTpl()"
        [errorTemplate]="errorTpl()"
        [groupPreviewTemplate]="groupPreviewTpl()"
        (closed)="closed.emit()"
        (doubleTapped)="doubleTapped.emit($event)"
        (paused)="paused.emit()"
        (resumed)="resumed.emit()"
        (storyChanged)="storyChanged.emit($event)"
        (groupChanged)="groupChanged.emit($event)"
        (storyViewed)="storyViewed.emit($event)"
        (storyCompleted)="storyCompleted.emit($event)"
        (apiReady)="apiReady.emit($event)"
      />
    }
  `,
})
export class RkStoriesOverlayComponent<T extends StoryItem = StoryItem> {
  /**
   * Renders the player and locks body scroll while true. Required, as in the
   * react and vue players: the host owns the open state and always says it.
   */
  readonly isOpen = input.required<boolean>();

  /**
   * Accessible name of the dialog, announced when the player opens.
   *
   * @default 'Stories player'
   */
  readonly ariaLabel = input('Stories player');

  /** The groups to play, in order. */
  readonly groups = input.required<StoriesGroup<T>[]>();

  /**
   * Group the player opens on.
   *
   * @default 0
   */
  readonly initialGroupIndex = input(0);

  /**
   * Story the player opens on. Naming one outright wins over anything
   * remembered, which is what makes a shared link open where it points.
   *
   * @default the resumed story, or the first
   */
  readonly initialStoryIndex = input<number | undefined>(undefined);

  /**
   * Transition between groups.
   *
   * @default cubeTransition
   */
  readonly groupTransition = input<TransitionTransformFn>(cubeTransition);

  /**
   * How long an image story stays up, in milliseconds. A video reports its
   * own length instead.
   *
   * @default 5000
   */
  readonly defaultImageDuration = input(5000);

  /**
   * Length of the transition between stories of one group, in milliseconds.
   *
   * @default 200
   */
  readonly innerTransitionDuration = input(200);

  /**
   * Narrowest a progress segment gets before the bar starts scrolling a
   * window of segments instead, in pixels.
   *
   * @default 8
   */
  readonly minSegmentWidth = input(8);

  /**
   * What the viewer has seen, from `createStoriesViewedStateController`. With
   * it the player opens each group on its first unseen story and records
   * every story shown. Hand the same controller to the ring list.
   */
  readonly viewed = input<StoriesViewedStateController | undefined>(undefined);

  /**
   * Which story a group opens on the first time it is reached. The `viewed`
   * controller answers this by itself; pass a function only to decide
   * differently, and it wins over the controller's answer.
   */
  readonly resumeStoryIndex = input<
    ((groupIndex: number) => number) | undefined
  >(undefined);

  /**
   * Share of the story's width that counts as the "back" zone on a tap, from
   * 0 to 1. The rest of the width moves forward.
   *
   * @default 0.3
   */
  readonly tapZoneSplit = input(0.3);

  /**
   * Hide the progress bar and header while paused by a long press. A footer
   * from the `rkStoriesFooter` template stays.
   *
   * @default true
   */
  readonly hideUIOnPause = input(true);

  /**
   * Arrow keys move through stories and Escape closes the player.
   *
   * @default true
   */
  readonly enableKeyboard = input(true);

  /**
   * Layout on a desktop screen. `'carousel'` draws neighbouring groups as
   * cards either side of the active story and slides between them. Phones
   * always show the active story alone.
   *
   * @default 'single'
   */
  readonly desktopLayout = input<DesktopLayout>('single');

  /**
   * Where the progress bar and the header live. `'overlay'` draws one copy
   * above the player, which switches to the new group once the group changes.
   * `'group'` gives each group its own copy inside its slide, so the bar and
   * the header turn with the group, the way Instagram does it; a neighbouring
   * group shows where it stands. The desktop carousel hides the player while
   * its cards slide, so there the choice shows only once a group is open.
   *
   * With `'group'` a header template sits inside the swipe area, and a tap on
   * it moves between stories unless it lands on a `button`, a link, or an
   * element with `role="button"`.
   *
   * @default 'overlay'
   */
  readonly chromePlacement = input<ChromePlacement>('overlay');

  /**
   * The slide slot as a template rather than projected content. A wrapper
   * such as the URL overlay queries the slot itself and passes it down, since
   * a content query does not reach through its own `<ng-content>`.
   */
  readonly slideTemplate = input<
    TemplateRef<StoriesSlideContext<T>> | undefined
  >(undefined);

  /**
   * The header slot as a template rather than projected content. A wrapper
   * such as the URL overlay queries the slot itself and passes it down, since
   * a content query does not reach through its own `<ng-content>`.
   */
  readonly headerTemplate = input<
    TemplateRef<StoriesHeaderContext<T>> | undefined
  >(undefined);

  /**
   * The footer slot as a template rather than projected content. A wrapper
   * such as the URL overlay queries the slot itself and passes it down, since
   * a content query does not reach through its own `<ng-content>`.
   */
  readonly footerTemplate = input<
    TemplateRef<StoriesFooterContext<T>> | undefined
  >(undefined);

  /**
   * The progressBar slot as a template rather than projected content. A wrapper
   * such as the URL overlay queries the slot itself and passes it down, since
   * a content query does not reach through its own `<ng-content>`.
   */
  readonly progressBarTemplate = input<
    TemplateRef<StoriesProgressBarContext<T>> | undefined
  >(undefined);

  /**
   * The navigation slot as a template rather than projected content. A wrapper
   * such as the URL overlay queries the slot itself and passes it down, since
   * a content query does not reach through its own `<ng-content>`.
   */
  readonly navigationTemplate = input<
    TemplateRef<StoriesNavigationContext> | undefined
  >(undefined);

  /**
   * The loading slot as a template rather than projected content. A wrapper
   * such as the URL overlay queries the slot itself and passes it down, since
   * a content query does not reach through its own `<ng-content>`.
   */
  readonly loadingTemplate = input<
    TemplateRef<StoriesLoadingContext<T>> | undefined
  >(undefined);

  /**
   * The error slot as a template rather than projected content. A wrapper
   * such as the URL overlay queries the slot itself and passes it down, since
   * a content query does not reach through its own `<ng-content>`.
   */
  readonly errorTemplate = input<
    TemplateRef<StoriesErrorContext<T>> | undefined
  >(undefined);

  /**
   * The groupPreview slot as a template rather than projected content. A wrapper
   * such as the URL overlay queries the slot itself and passes it down, since
   * a content query does not reach through its own `<ng-content>`.
   */
  readonly groupPreviewTemplate = input<
    TemplateRef<StoriesGroupPreviewContext<T>> | undefined
  >(undefined);

  /** The viewer closed the player. */
  readonly closed = output<void>();

  /** A double tap landed, which is the reaction gesture. */
  readonly doubleTapped = output<{ groupIndex: number; storyIndex: number }>();

  /** Playback paused, by a held press or by the pause control. */
  readonly paused = output<void>();

  /** Playback resumed. */
  readonly resumed = output<void>();

  /** The active story changed, within a group or across one. */
  readonly storyChanged = output<{ groupIndex: number; storyIndex: number }>();

  /** The active group changed. */
  readonly groupChanged = output<number>();

  /** A story came on screen. */
  readonly storyViewed = output<{ groupIndex: number; storyIndex: number }>();

  /** A story's timer ran out. */
  readonly storyCompleted = output<{
    groupIndex: number;
    storyIndex: number;
  }>();

  /** The imperative handle, once the player is ready to take orders. */
  readonly apiReady = output<StoriesApi>();

  constructor() {
    // Outside the open gate, as react's `useAttachViewedState` is: a ring list
    // beside a closed player still reads what has been seen.
    attachViewedState(this.viewed);
  }

  // A template named outright wins over one projected into the player, so a
  // component can drive a slot a wrapping component already filled.
  protected readonly slideTpl = computed(
    () => this.slideTemplate() ?? this._slideSlot()?.templateRef ?? undefined,
  );

  protected readonly headerTpl = computed(
    () => this.headerTemplate() ?? this._headerSlot()?.templateRef ?? undefined,
  );

  protected readonly footerTpl = computed(
    () => this.footerTemplate() ?? this._footerSlot()?.templateRef ?? undefined,
  );

  protected readonly progressBarTpl = computed(
    () =>
      this.progressBarTemplate() ??
      this._progressBarSlot()?.templateRef ??
      undefined,
  );

  protected readonly navigationTpl = computed(
    () =>
      this.navigationTemplate() ??
      this._navigationSlot()?.templateRef ??
      undefined,
  );

  protected readonly loadingTpl = computed(
    () =>
      this.loadingTemplate() ?? this._loadingSlot()?.templateRef ?? undefined,
  );

  protected readonly errorTpl = computed(
    () => this.errorTemplate() ?? this._errorSlot()?.templateRef ?? undefined,
  );

  protected readonly groupPreviewTpl = computed(
    () =>
      this.groupPreviewTemplate() ??
      this._groupPreviewSlot()?.templateRef ??
      undefined,
  );

  private readonly _slideSlot = contentChild(RkStoriesSlideDirective);
  private readonly _headerSlot = contentChild(RkStoriesHeaderDirective);
  private readonly _footerSlot = contentChild(RkStoriesFooterDirective);
  private readonly _progressBarSlot = contentChild(
    RkStoriesProgressBarDirective,
  );
  private readonly _navigationSlot = contentChild(RkStoriesNavigationDirective);
  private readonly _loadingSlot = contentChild(RkStoriesLoadingDirective);
  private readonly _errorSlot = contentChild(RkStoriesErrorDirective);
  private readonly _groupPreviewSlot = contentChild(
    RkStoriesGroupPreviewDirective,
  );
}
