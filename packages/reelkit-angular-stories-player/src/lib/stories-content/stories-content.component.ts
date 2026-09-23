import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  type OnInit,
  ViewEncapsulation,
  afterNextRender,
  type Signal,
  computed,
  effect,
  signal,
  inject,
  input,
  output,
  untracked,
  viewChild,
  type TemplateRef,
} from '@angular/core';
import {
  BodyLockService,
  ReelComponent,
  RkReelItemDirective,
  RkSwipeToCloseDirective,
  SoundStateService,
  captureFocusForReturn,
  createFocusTrap,
  createContentLoadingController,
  createContentPreloader,
  createDisposableList,
  createSignal,
  cubeTransition,
  fadeTransition,
  noop,
  observeDomEvent,
  reaction,
  slideTransition,
  toAngularSignal,
  type ContentLoadingController,
  type GestureCommonEvent,
  type CoreSignal,
  type ReelApi,
  type TransitionTransformFn,
} from '@reelkit/angular';
import {
  createStoriesController,
  createTimerController,
  getStoriesSize,
  getTapAction,
  isMobileWidth,
  parseDurationMs,
  type StoriesController,
  type StoryItem,
  type StoriesGroup,
  type StoriesViewedStateController,
  type TimerController,
} from '@reelkit/stories-core';
import { NgTemplateOutlet } from '@angular/common';
import {
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
  ChevronLeft,
  ChevronRight,
  ImageOff,
} from 'lucide-angular';
import { RkHeartAnimationComponent } from '../heart-animation/heart-animation.component';
import { RkCanvasProgressBarComponent } from '../canvas-progress-bar/canvas-progress-bar.component';
import { RkStoryHeaderComponent } from '../story-header/story-header.component';
import {
  RkStoriesCarouselComponent,
  type CarouselSlide,
} from '../stories-carousel/stories-carousel.component';
import { RkImageStorySlideComponent } from '../image-story-slide/image-story-slide.component';
import {
  RkVideoStorySlideComponent,
  sharedStoryVideo,
} from '../video-story-slide/video-story-slide.component';
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

const preloader = createContentPreloader();

/** How long a navigation button must be held before it skips a whole group. */
const _kNavLongPressMs = 500;

/**
 * A slide normally ends on the transition of the card reaching the centre. One
 * that never runs sends no event, so the cards' own duration plus this much is
 * the limit before the slide is ended anyway.
 */
const _kSlideTimeoutMarginMs = 700;

/**
 * The running stories player: everything that only exists while it is open.
 *
 * Two axes of movement sit on two nested sliders: the outer one carries the
 * groups and the inner ones carry the stories of each group. The engine in
 * `@reelkit/stories-core` owns where the viewer is; the sliders are told to
 * follow it, never the other way round, which is what keeps a tap, a swipe
 * and the auto-advance timer from disagreeing.
 *
 * @internal `RkStoriesOverlayComponent` is the player a consumer reaches for.
 * It creates this on open and destroys it on close, so the engine, the timer
 * and the sound setting last exactly as long as one viewing — the lifetime
 * react's `StoriesContent` and vue's equivalent get from mounting.
 */
@Component({
  selector: 'rk-stories-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    SoundStateService,
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({ ChevronLeft, ChevronRight, ImageOff }),
      multi: true,
    },
  ],
  imports: [
    NgTemplateOutlet,
    RkSwipeToCloseDirective,
    LucideAngularModule,
    ReelComponent,
    RkStoryHeaderComponent,
    RkStoriesCarouselComponent,
    RkReelItemDirective,
    RkCanvasProgressBarComponent,
    RkHeartAnimationComponent,
    RkImageStorySlideComponent,
    RkVideoStorySlideComponent,
  ],
  template: `
    <div
      #overlay
      class="rk-stories-overlay"
      [class.rk-stories-overlay--carousel]="carouselActive()"
      [class.rk-stories-overlay--sliding]="slide() !== null"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="ariaLabel()"
      tabindex="-1"
    >
      <!-- The arrows are flex siblings of the player, not overlaid on it:
           that is the layout the stylesheet lays out, and it keeps them
           clear of the story on a wide screen. -->
      <div
        class="rk-stories-swipe-wrapper"
        [rkSwipeToClose]="true"
        rkSwipeToCloseDirection="down"
        (dismissed)="closed.emit()"
      >
        @if (navigationTpl(); as tpl) {
          <ng-container
            [ngTemplateOutlet]="tpl"
            [ngTemplateOutletInjector]="slotInjector"
            [ngTemplateOutletContext]="navigationContext()"
          />
        } @else {
          <button
            class="rk-stories-nav-btn"
            type="button"
            aria-label="Previous story"
            (pointerdown)="onNavPressStart(-1)"
            (pointerup)="onNavPressEnd(-1)"
            (pointerleave)="onNavPressCancel()"
          >
            <lucide-angular [img]="ChevronLeftIcon" [size]="28" />
          </button>
        }

        <div
          class="rk-stories-container"
          (contextmenu)="$event.preventDefault()"
        >
          <rk-reel
            [count]="groups().length"
            direction="horizontal"
            [size]="size()"
            [initialIndex]="initialGroupIndex()"
            [transition]="outerTransition()"
            [enableNavKeys]="enableKeyboard()"
            [interceptNavKeys]="true"
            (navKeyPressed)="onNavKey($event)"
            (apiReady)="onOuterApiReady($event)"
            (afterChange)="onOuterAfterChange($event.index)"
            (slideDragStart)="onOuterDragStart()"
            (slideDragEnd)="onOuterDragEnd()"
            (slideDragCanceled)="onOuterDragEnd()"
            (tapped)="onTap($event)"
            (doubleTapped)="onDoubleTap()"
            (longPressStarted)="onLongPressStart()"
            (longPressEnded)="onLongPressEnd()"
          >
            <ng-template rkReelItem let-groupIndex>
              <div
                class="rk-stories-slide-wrapper"
                [style.width.px]="size()[0]"
                [style.height.px]="size()[1]"
              >
                <rk-reel
                  class="rk-stories-stories"
                  [count]="storiesOf(groupIndex).length"
                  direction="horizontal"
                  [size]="size()"
                  [initialIndex]="initialStoryIndexFor(groupIndex)"
                  [enableGestures]="false"
                  [enableNavKeys]="false"
                  [transition]="fadeTransition"
                  [transitionDuration]="innerTransitionDuration()"
                  (apiReady)="onInnerApiReady(groupIndex, $event)"
                >
                  <ng-template rkReelItem let-storyIndex>
                    @let story = storiesOf(groupIndex)[storyIndex];
                    <div
                      class="rk-stories-story"
                      [style.width.px]="size()[0]"
                      [style.height.px]="size()[1]"
                    >
                      @if (story && slideTpl(); as tpl) {
                        <ng-container
                          [ngTemplateOutlet]="tpl"
                          [ngTemplateOutletInjector]="slotInjector"
                          [ngTemplateOutletContext]="
                            slideContext(groupIndex, storyIndex)
                          "
                        />
                      } @else if (story) {
                        @if (story.mediaType === 'video') {
                          <rk-video-story-slide
                            [src]="story.src"
                            [poster]="story.poster"
                            [groupIndex]="groupIndex"
                            [storyIndex]="storyIndex"
                            [activeGroupIndex]="
                              storiesCtrl.state.activeGroupIndex
                            "
                            [activeStoryIndex]="
                              storiesCtrl.state.activeStoryIndex
                            "
                            (durationReady)="
                              onDurationReady(groupIndex, storyIndex, $event)
                            "
                            (playbackStarted)="
                              onContentReady(groupIndex, storyIndex)
                            "
                            (buffering)="onVideoWaiting(groupIndex, storyIndex)"
                            (finished)="onVideoEnded(groupIndex, storyIndex)"
                            (failed)="onContentError(groupIndex, storyIndex)"
                          />
                        } @else {
                          <rk-image-story-slide
                            [src]="story.src"
                            [aspectRatio]="story.aspectRatio"
                            (loaded)="onContentReady(groupIndex, storyIndex)"
                            (failed)="onContentError(groupIndex, storyIndex)"
                          />
                        }
                      }

                      <!-- Loading and error belong to the story on screen,
                           not to the group: three groups are rendered at a
                           time, and the controller reports one state. -->
                      @if (isShowing(groupIndex, storyIndex)) {
                        @if (isError()) {
                          @if (errorTpl(); as tpl) {
                            <ng-container
                              [ngTemplateOutlet]="tpl"
                              [ngTemplateOutletInjector]="slotInjector"
                              [ngTemplateOutletContext]="
                                statusContext(groupIndex)
                              "
                            />
                          } @else {
                            <div
                              class="rk-stories-error"
                              role="img"
                              aria-label="Content unavailable"
                            >
                              <lucide-angular
                                [img]="ImageOffIcon"
                                [size]="48"
                              />
                              <span class="rk-stories-error-text">
                                Content unavailable
                              </span>
                            </div>
                          }
                        } @else if (isLoading() && loadingTpl(); as tpl) {
                          <ng-container
                            [ngTemplateOutlet]="tpl"
                            [ngTemplateOutletInjector]="slotInjector"
                            [ngTemplateOutletContext]="
                              statusContext(groupIndex)
                            "
                          />
                        }
                      }
                    </div>
                  </ng-template>
                </rk-reel>

                <!-- The footer belongs to the story playing, so a neighbouring
                     group seen mid-turn shows none. -->
                @if (groupIndex === activeGroupIndex() && footerTpl(); as tpl) {
                  <ng-container
                    [ngTemplateOutlet]="tpl"
                    [ngTemplateOutletInjector]="slotInjector"
                    [ngTemplateOutletContext]="footerContext(groupIndex)"
                  />
                }

                @if (chromePlacement() === 'group') {
                  <div
                    class="rk-stories-ui-layer"
                    [class.rk-stories-ui-layer--hidden]="!chromeVisible()"
                  >
                    <ng-container
                      [ngTemplateOutlet]="chrome"
                      [ngTemplateOutletContext]="{ $implicit: groupIndex }"
                    />
                  </div>
                }
              </div>
            </ng-template>
          </rk-reel>

          <!-- The progress bar and the header are drawn either once over the
               whole player, switching to the new group after it changes, or
               once inside every group slide above, turning with the group.
               The hearts belong to the player either way, never to a group. -->
          @if (chromePlacement() === 'overlay') {
            <div
              class="rk-stories-ui-layer"
              [class.rk-stories-ui-layer--hidden]="!chromeVisible()"
            >
              <ng-container
                [ngTemplateOutlet]="chrome"
                [ngTemplateOutletContext]="{ $implicit: activeGroupIndex() }"
              />

              @for (heart of hearts(); track heart) {
                <rk-heart-animation (completed)="removeHeart(heart)" />
              }
            </div>
          } @else {
            @for (heart of hearts(); track heart) {
              <rk-heart-animation (completed)="removeHeart(heart)" />
            }
          }

          <ng-template #chrome let-groupIndex>
            @if (groups()[groupIndex]; as group) {
              @let bar = progressBarContext(groupIndex);
              @if (progressBarTpl(); as tpl) {
                <ng-container
                  [ngTemplateOutlet]="tpl"
                  [ngTemplateOutletInjector]="slotInjector"
                  [ngTemplateOutletContext]="bar"
                />
              } @else {
                <rk-canvas-progress-bar
                  [totalStories]="bar.totalStories"
                  [activeIndex]="bar.activeIndex"
                  [progress]="bar.progress"
                  [live]="bar.isActive"
                  [minSegmentWidth]="minSegmentWidth()"
                />
              }

              @let header = headerContext(groupIndex);
              @if (headerTpl(); as tpl) {
                <ng-container
                  [ngTemplateOutlet]="tpl"
                  [ngTemplateOutletInjector]="slotInjector"
                  [ngTemplateOutletContext]="header"
                />
              } @else {
                <rk-story-header
                  [author]="group.author"
                  [createdAt]="
                    header.story ? header.story.createdAt : undefined
                  "
                  [isPaused]="header.isPaused"
                  [isMuted]="header.isMuted"
                  [isVideo]="header.isVideo"
                  [isLoading]="header.isActive && isLoading()"
                  [isError]="header.isActive && isError()"
                  [showPauseButton]="true"
                  [showSoundButton]="true"
                  (closed)="closed.emit()"
                  (pauseToggled)="togglePause()"
                  (soundToggled)="soundState.toggle()"
                />
              }
            }
          </ng-template>
        </div>

        @if (!navigationTpl()) {
          <button
            class="rk-stories-nav-btn"
            type="button"
            aria-label="Next story"
            (pointerdown)="onNavPressStart(1)"
            (pointerup)="onNavPressEnd(1)"
            (pointerleave)="onNavPressCancel()"
          >
            <lucide-angular [img]="ChevronRightIcon" [size]="28" />
          </button>
        }
      </div>

      <!-- Last in the dialog, so the keyboard reaches the player's own
           controls before the cards. The stylesheet keeps the cards painted
           beneath the player whatever the order. -->
      @if (carouselActive()) {
        <rk-stories-carousel
          [groups]="groups()"
          [activeGroupIndex]="activeGroupIndex()"
          [slide]="slide()"
          [activeSize]="size()"
          [storyIndexFor]="storyIndexForCard"
          [viewedState]="viewedState()"
          [previewTemplate]="groupPreviewTpl()"
          [frameTemplate]="slideTpl() ?? undefined"
          [frameContext]="cardFrameContext"
          (opened)="storiesCtrl.goToGroup($event)"
          (slideEnded)="endSlide()"
        />
      }
    </div>
  `,
})
export class RkStoriesContentComponent<T extends StoryItem = StoryItem>
  implements OnInit
{
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _bodyLock = inject(BodyLockService);

  private readonly _overlayRef =
    viewChild<ElementRef<HTMLDivElement>>('overlay');

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
   * Hides the header and footer while a press is held, so the story is
   * unobstructed.
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
   * Where the progress bar and the header live: one copy above the player, or
   * one inside every group slide.
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

  // Built in ngOnInit, not here: the groups arrive as a required input, and
  // an input cannot be read while the component is still being constructed.
  protected storiesCtrl!: StoriesController;
  protected timerCtrl!: TimerController;
  protected readonly loadingCtrl: ContentLoadingController =
    createContentLoadingController();

  /** Box the player draws into; the resize listener keeps it current. */
  protected readonly sizeSignal =
    createSignal<[number, number]>(getStoriesSize());

  protected readonly size = toAngularSignal(this.sizeSignal, this._destroyRef);

  private _outerReel: ReelApi | null = null;
  private readonly _innerReels = new Map<number, ReelApi>();
  private readonly _knownDurations = new Map<string, number>();

  /** Group the timer was last restarted for. */
  private _timedGroupIndex = 0;

  /** Group the cards were last laid out around. */
  private _lastGroupIndex = 0;

  /** Serialises slider moves; see `_queueSliderMove`. */
  private _sliderQueue: Promise<void> = Promise.resolve();

  /**
   * How far the story of a group being turned away from had played, by
   * group. The controller moves to the new group before the turn starts, and
   * the timer resets right after, so a progress bar drawn inside the group
   * being left would otherwise empty its segment while it is still in view.
   */
  protected readonly frozenProgress = signal<ReadonlyMap<number, number>>(
    new Map(),
  );

  /** Signals of the bars of groups that are not playing; see `_stillSignalsFor`. */
  private readonly _stillSignals = new Map<
    number,
    { activeIndex: CoreSignal<number>; progress: CoreSignal<number> }
  >();

  /** Set while a swipe is what moved the player, so it gets no slide on top. */
  private _changingByDrag = false;

  /** One entry per heart currently floating up from a double tap. */
  protected readonly hearts = signal<number[]>([]);

  protected readonly soundState = inject(SoundStateService);

  protected isLoading!: Signal<boolean>;
  protected isError!: Signal<boolean>;
  protected isPaused!: Signal<boolean>;
  protected activeGroupIndex!: Signal<number>;
  protected activeStoryIndex!: Signal<number>;
  protected progress!: Signal<number>;

  /** The interface steps aside while a press is held, if asked to. */
  protected readonly chromeVisible = computed(
    () => !(this.longPressed() && this.hideUIOnPause()),
  );

  // The slots are resolved by the overlay, which owns the projected content;
  // this component is its child, so a `contentChild` here would see none of it.
  protected readonly slideTpl = computed(() => this.slideTemplate() ?? null);
  protected readonly headerTpl = computed(() => this.headerTemplate() ?? null);
  protected readonly footerTpl = computed(() => this.footerTemplate() ?? null);
  protected readonly progressBarTpl = computed(
    () => this.progressBarTemplate() ?? null,
  );
  protected readonly navigationTpl = computed(
    () => this.navigationTemplate() ?? null,
  );
  protected readonly loadingTpl = computed(
    () => this.loadingTemplate() ?? null,
  );
  protected readonly errorTpl = computed(() => this.errorTemplate() ?? null);

  private _heartId = 0;

  /** True while the desktop carousel is the layout in use. */
  protected readonly carouselActive = signal(false);

  /**
   * Stories of one group cross-fade into each other; only whole groups get
   * the configured transition. The carousel overrides it too, because there
   * the cards beside the player move with the slider and a three-dimensional
   * transition would turn them as they travel.
   */
  protected readonly fadeTransition = fadeTransition;
  protected readonly outerTransition = computed(() =>
    this.carouselActive() ? slideTransition : this.groupTransition(),
  );

  /** The group change the cards are animating, or null at rest. */
  protected readonly slide = signal<CarouselSlide | null>(null);

  protected readonly viewedState = computed(
    () => this.viewed()?.viewedState ?? undefined,
  );

  protected readonly groupPreviewTpl = computed(() =>
    this.groupPreviewTemplate(),
  );

  /**
   * The newest story reached while the cards were sliding. It is not on
   * screen until they arrive, so it counts as seen only then.
   */
  private _pendingViewed: [number, number] | null = null;

  /** The newest timer action asked for while the cards were sliding. */
  private _pendingTimerAction: (() => void) | null = null;

  private _slideTimeout: ReturnType<typeof setTimeout> | undefined;
  private _slideFrame = 0;
  private _cardTransitionMs = 0;

  private _navLongPressTimer: ReturnType<typeof setTimeout> | undefined;
  private _navLongPressFired = false;

  protected readonly ChevronLeftIcon = ChevronLeft;
  protected readonly ChevronRightIcon = ChevronRight;
  protected readonly ImageOffIcon = ImageOff;

  /** True while a press is being held, which hides the interface. */
  protected readonly longPressed = signal(false);

  private readonly _injector = inject(Injector);

  /**
   * Every slot template renders through this, so a component a slot draws
   * resolves services against the player rather than against the component
   * the template was written in. Angular's element injectors follow where a
   * template was declared; react's context and vue's provide follow where it
   * renders, which is why neither of them has to think about this and why a
   * slot drawing an `rk-video-story-slide` would otherwise find no
   * `SoundStateService` and be dropped without a word.
   */
  protected readonly slotInjector = this._injector;

  private _releaseFocus: (() => void) | null = null;
  private _releaseFocusTrap: (() => void) | null = null;

  constructor() {
    // A feed that pages in more groups while the player is open reshapes the
    // engine rather than restarting it, so the story on screen stays put.
    effect(() => {
      const next = this.groups();
      untracked(() =>
        this.storiesCtrl.updateConfig({
          groupCount: next.length,
          storyCounts: next.map((group) => group.stories.length),
        }),
      );
    });

    effect(() => {
      this.desktopLayout();
      untracked(() => this._updateCarouselActive());
    });
  }

  ngOnInit(): void {
    const groups = untracked(() => this.groups());

    this.storiesCtrl = createStoriesController(
      {
        groupCount: groups.length,
        storyCounts: groups.map((group) => group.stories.length),
        initialGroupIndex: untracked(() => this.initialGroupIndex()),
        initialStoryIndex: untracked(() => this.initialStoryIndex()),
        defaultImageDuration: untracked(() => this.defaultImageDuration()),
        // An explicit input wins over the viewed controller's answer.
        resumeStoryIndex: (groupIndex) =>
          (this.resumeStoryIndex() ?? this.viewed()?.resumeStoryIndex)?.(
            groupIndex,
          ) ?? 0,
      },
      {
        onStoryChange: (groupIndex, storyIndex) =>
          this.storyChanged.emit({ groupIndex, storyIndex }),
        onGroupChange: (groupIndex) => {
          this.groupChanged.emit(groupIndex);
          this._settleGroupChange();
        },
        onStoryViewed: (groupIndex, storyIndex) => {
          // Behind the sliding cards the story is not on screen yet, so it is
          // reported once they arrive.
          if (this.slide()) {
            this._pendingViewed = [groupIndex, storyIndex];
            return;
          }
          this.viewed()?.markViewed(groupIndex, storyIndex);
          this.storyViewed.emit({ groupIndex, storyIndex });
        },
        onStoryComplete: (groupIndex, storyIndex) =>
          this.storyCompleted.emit({ groupIndex, storyIndex }),
        onClose: () => this.closed.emit(),
      },
    );

    this.timerCtrl = createTimerController({
      duration: untracked(() => this.defaultImageDuration()),
      onComplete: () => this.storiesCtrl.onStoryTimerComplete(),
    });

    this._timedGroupIndex = this.storiesCtrl.state.activeGroupIndex.value;
    this._lastGroupIndex = this._timedGroupIndex;

    this.isLoading = toAngularSignal(
      this.loadingCtrl.isLoading,
      this._destroyRef,
    );
    this.isError = toAngularSignal(this.loadingCtrl.isError, this._destroyRef);
    this.isPaused = toAngularSignal(
      this.storiesCtrl.state.isPaused,
      this._destroyRef,
    );
    this.activeGroupIndex = toAngularSignal(
      this.storiesCtrl.state.activeGroupIndex,
      this._destroyRef,
    );
    this.activeStoryIndex = toAngularSignal(
      this.storiesCtrl.state.activeStoryIndex,
      this._destroyRef,
    );
    this.progress = toAngularSignal(this.timerCtrl.progress, this._destroyRef);

    const disposables = createDisposableList();
    disposables.push(
      reaction(
        () => [this.storiesCtrl.state.activeGroupIndex],
        () => this._followActiveGroup(),
      ),
      reaction(
        () => [this.storiesCtrl.state.activeStoryIndex],
        () => this._followActiveStory(),
      ),
      reaction(
        () => [this.storiesCtrl.state.isPaused],
        () => this._followPaused(),
      ),
      reaction(
        () => [
          this.storiesCtrl.state.activeGroupIndex,
          this.storiesCtrl.state.activeStoryIndex,
        ],
        () => this._preloadAhead(),
      ),
      observeDomEvent(window, 'resize', () => {
        this.sizeSignal.value = getStoriesSize();
        this._updateCarouselActive();
        this._outerReel?.adjust();
      }),
      observeDomEvent(window, 'keydown', (event) => {
        if (!this.enableKeyboard()) return;
        if ((event as KeyboardEvent).key === 'Escape') this.closed.emit();
      }),
      () => this.timerCtrl.dispose(),
    );

    // The player runs for exactly as long as this component exists: the
    // overlay creates it on open and destroys it on close, the way react's
    // `StoriesContent` and vue's render-null do. It stops before the timer is
    // disposed, since stopping may still touch the timer.
    this._start();
    this._destroyRef.onDestroy(() => this._stop());
    this._destroyRef.onDestroy(disposables.dispose);
  }

  /** Whether this slide is the one the viewer is looking at. */
  protected isShowing(groupIndex: number, storyIndex: number): boolean {
    return (
      groupIndex === this.activeGroupIndex() &&
      storyIndex === this.activeStoryIndex()
    );
  }

  /** The story a group is currently showing, if it has one. */
  protected activeStoryOf(groupIndex: number): T | undefined {
    return this.storiesOf(groupIndex)[this.activeStoryIndex()];
  }

  // A group that is not active shows the story it stands on, not playing.
  protected headerContext(groupIndex: number): StoriesHeaderContext<T> {
    const isActive = groupIndex === this.activeGroupIndex();
    const storyIndex = isActive
      ? this.activeStoryIndex()
      : this.storiesCtrl.getLastStoryIndex(groupIndex);
    const story = this.storiesOf(groupIndex)[storyIndex];
    return {
      $implicit: this.groups()[groupIndex].author,
      story: story as T,
      storyIndex,
      isPaused: isActive && this.isPaused(),
      isMuted: this.soundState.muted(),
      isVideo: story?.mediaType === 'video',
      groupIndex,
      isActive,
      onToggleSound: () => this.soundState.toggle(),
      onTogglePause: () => this.togglePause(),
      onClose: () => this.closed.emit(),
    };
  }

  protected footerContext(groupIndex: number): StoriesFooterContext<T> {
    return {
      $implicit: this.activeStoryOf(groupIndex) as T,
      author: this.groups()[groupIndex].author,
      storyIndex: this.activeStoryIndex(),
    };
  }

  protected progressBarContext(
    groupIndex: number,
  ): StoriesProgressBarContext<T> {
    const isActive = groupIndex === this.activeGroupIndex();
    const still = isActive ? null : this._stillSignalsFor(groupIndex);
    return {
      $implicit: this.groups()[groupIndex],
      totalStories: this.storiesOf(groupIndex).length,
      activeIndex:
        still?.activeIndex ?? this.storiesCtrl.state.activeStoryIndex,
      progress: still?.progress ?? this.timerCtrl.progress,
      groupIndex,
      isActive,
    };
  }

  /**
   * The signals a group that is not playing draws its bar from: the story it
   * stands on, and how far that story played if the player is turning away
   * from it. The template asks on every change detection, so the same signals
   * come back until one of those two numbers moves; new ones every time would
   * restart the bar on every pass.
   */
  private _stillSignalsFor(groupIndex: number): {
    activeIndex: CoreSignal<number>;
    progress: CoreSignal<number>;
  } {
    const storyIndex = this.storiesCtrl.getLastStoryIndex(groupIndex);
    const progress = this.frozenProgress().get(groupIndex) ?? 0;
    const known = this._stillSignals.get(groupIndex);
    if (
      known &&
      known.activeIndex.value === storyIndex &&
      known.progress.value === progress
    ) {
      return known;
    }
    const fresh = {
      activeIndex: createSignal(storyIndex),
      progress: createSignal(progress),
    };
    this._stillSignals.set(groupIndex, fresh);
    return fresh;
  }

  protected navigationContext(): StoriesNavigationContext {
    return {
      $implicit: {
        onPrevStory: () => this.storiesCtrl.prevStory(),
        onNextStory: () => this.storiesCtrl.nextStory(),
        onPrevGroup: () => this.storiesCtrl.prevGroup(),
        onNextGroup: () => this.storiesCtrl.nextGroup(),
      },
    };
  }

  protected statusContext(groupIndex: number): StoriesLoadingContext<T> {
    return {
      $implicit: this.activeStoryOf(groupIndex) as T,
      storyIndex: this.activeStoryIndex(),
      groupIndex,
    };
  }

  protected slideContext(
    groupIndex: number,
    storyIndex: number,
  ): StoriesSlideContext<T> {
    return {
      $implicit: this.storiesOf(groupIndex)[storyIndex] as T,
      index: storyIndex,
      groupIndex,
      isActive:
        groupIndex === this.activeGroupIndex() &&
        storyIndex === this.activeStoryIndex(),
      size: this.size(),
      activeGroupIndex: this.storiesCtrl.state.activeGroupIndex,
      activeStoryIndex: this.storiesCtrl.state.activeStoryIndex,
      onDurationReady: (durationMs) =>
        this.onDurationReady(groupIndex, storyIndex, durationMs),
      onReady: () => this.onContentReady(groupIndex, storyIndex),
      onWaiting: () => this.onVideoWaiting(groupIndex, storyIndex),
      onError: () => this.onContentError(groupIndex, storyIndex),
      onEnded: () => this.onVideoEnded(groupIndex, storyIndex),
    };
  }

  /** Stories of a group, for a template that only has its index. */
  protected storiesOf(groupIndex: number): T[] {
    return (this.groups()[groupIndex]?.stories ?? []) as T[];
  }

  /**
   * Where a group's slider is born. The engine's answer, for every group and
   * not only the active one: a group beside the active one is rendered before
   * the viewer reaches it, and it opens where it was left. Starting it at its
   * first story instead shows that story for a frame on the way back, then
   * slides to the real one.
   */
  protected initialStoryIndexFor(groupIndex: number): number {
    return this.storiesCtrl.getLastStoryIndex(groupIndex);
  }

  protected onOuterApiReady(api: ReelApi): void {
    this._outerReel = api;
    this.apiReady.emit(this._buildApi());
  }

  protected onInnerApiReady(groupIndex: number, api: ReelApi): void {
    this._innerReels.set(groupIndex, api);
  }

  protected onOuterAfterChange(index: number): void {
    // The activeGroupIndex reaction calls goTo, which lands here again. Ignore
    // the echo, or the controller is told to move to where it already is.
    if (this.storiesCtrl.state.activeGroupIndex.value === index) return;

    this._changingByDrag = true;
    this.storiesCtrl.goToGroup(index);
    this._changingByDrag = false;
  }

  /**
   * A tap moves within the group: the side of the story decides which way.
   * Groups move by swipe and by the navigation buttons, never by tapping.
   */
  protected onTap(event: GestureCommonEvent): void {
    const [width] = this.sizeSignal.value;
    const action = getTapAction(
      event.localPosition[0],
      width,
      this.tapZoneSplit(),
    );
    if (action === 'next') this.storiesCtrl.nextStory();
    else this.storiesCtrl.prevStory();
  }

  protected onDoubleTap(): void {
    this.hearts.update((hearts) => [...hearts, ++this._heartId]);
    this.doubleTapped.emit({
      groupIndex: this.storiesCtrl.state.activeGroupIndex.value,
      storyIndex: this.storiesCtrl.state.activeStoryIndex.value,
    });
  }

  protected removeHeart(id: number): void {
    this.hearts.update((hearts) => hearts.filter((heart) => heart !== id));
  }

  protected onLongPressStart(): void {
    this.longPressed.set(true);
    this.storiesCtrl.pause();
    this.paused.emit();
  }

  protected onLongPressEnd(): void {
    this.longPressed.set(false);
    this.storiesCtrl.resume();
    this.resumed.emit();
  }

  /** Flips between paused and playing, the way the header's button does. */
  protected togglePause(): void {
    if (this.storiesCtrl.state.isPaused.value) {
      this.storiesCtrl.resume();
      this.resumed.emit();
    } else {
      this.storiesCtrl.pause();
      this.paused.emit();
    }
  }

  protected onOuterDragStart(): void {
    this.timerCtrl.pause();
    if (this._activeStory()?.mediaType === 'video') sharedStoryVideo().pause();
  }

  protected onOuterDragEnd(): void {
    if (this.storiesCtrl.state.isPaused.value) return;
    this.timerCtrl.resume();
    if (this._activeStory()?.mediaType === 'video') {
      sharedStoryVideo().play().catch(noop);
    }
  }

  // A story that names its own duration keeps it, whatever the video reports.
  protected onDurationReady(
    groupIndex: number,
    storyIndex: number,
    durationMs: number,
  ): void {
    const story = this.storiesOf(groupIndex)[storyIndex];
    if (story?.src) this._knownDurations.set(story.src, durationMs);
    if (!this._isActive(groupIndex, storyIndex) || story?.duration) return;
    if (this.timerCtrl.isRunning.value) this.timerCtrl.start(durationMs);
  }

  protected onContentReady(groupIndex: number, storyIndex: number): void {
    const story = this.groups()[groupIndex]?.stories[storyIndex];
    if (story?.src) preloader.markLoaded(story.src);

    if (!this._isActive(groupIndex, storyIndex)) return;

    this.loadingCtrl.isLoading.value = false;
    this._runTimer(() => this._resumeTimer());
  }

  protected onVideoWaiting(groupIndex: number, storyIndex: number): void {
    if (!this._isActive(groupIndex, storyIndex)) return;
    this.loadingCtrl.isLoading.value = true;
    this._pauseTimer();
  }

  protected onVideoEnded(groupIndex: number, storyIndex: number): void {
    if (!this._isActive(groupIndex, storyIndex)) return;
    this.storiesCtrl.onStoryTimerComplete();
  }

  protected onContentError(groupIndex: number, storyIndex: number): void {
    const story = this.groups()[groupIndex]?.stories[storyIndex];
    if (story?.src) preloader.markErrored(story.src);

    if (!this._isActive(groupIndex, storyIndex)) return;
    this.loadingCtrl.isLoading.value = false;
    this.loadingCtrl.isError.value = true;
    this._pauseTimer();
  }

  private _isActive(groupIndex: number, storyIndex: number): boolean {
    return (
      groupIndex === this.storiesCtrl.state.activeGroupIndex.value &&
      storyIndex === this.storiesCtrl.state.activeStoryIndex.value
    );
  }

  private _buildApi(): StoriesApi {
    return {
      nextStory: () => this.storiesCtrl.nextStory(),
      prevStory: () => this.storiesCtrl.prevStory(),
      nextGroup: () => this.storiesCtrl.nextGroup(),
      prevGroup: () => this.storiesCtrl.prevGroup(),
      goToGroup: (index) => this.storiesCtrl.goToGroup(index),
      pause: () => this.storiesCtrl.pause(),
      resume: () => this.storiesCtrl.resume(),
    };
  }

  private _start(): void {
    this._bodyLock.lock();

    // The opening story is on screen without anything having been navigated
    // to, so nothing has announced it yet.
    this.storiesCtrl.reportInitialView();
    this._restartTimer();

    afterNextRender(
      () => {
        const overlay = this._overlayRef()?.nativeElement;
        if (!overlay) return;
        this._releaseFocus = captureFocusForReturn();
        overlay.focus({ preventScroll: true });
        this._releaseFocusTrap = createFocusTrap(overlay);
      },
      { injector: this._injector },
    );
  }

  private _stop(): void {
    this._cancelSlide();
    this.timerCtrl.reset();
    this._bodyLock.unlock();
    this._releaseFocusTrap?.();
    this._releaseFocusTrap = null;
    this._releaseFocus?.();
    this._releaseFocus = null;
  }

  /** A pause stops the timer and the video alike; a resume starts both. */
  private _followPaused(): void {
    const isVideo = this._activeStory()?.mediaType === 'video';

    if (this.storiesCtrl.state.isPaused.value) {
      this._pauseTimer();
      if (isVideo) sharedStoryVideo().pause();
      return;
    }

    this._resumeTimer();
    if (isVideo) sharedStoryVideo().play().catch(noop);
  }

  /** The next story, and the next group's first, so neither arrives blank. */
  private _preloadAhead(): void {
    const groupIndex = this.storiesCtrl.state.activeGroupIndex.value;
    const storyIndex = this.storiesCtrl.state.activeStoryIndex.value;
    const groups = this.groups();

    const nextStory = groups[groupIndex]?.stories[storyIndex + 1];
    if (nextStory) {
      preloader.preload(
        nextStory.src,
        nextStory.mediaType as 'image' | 'video',
      );
    }

    const nextGroupFirst = groups[groupIndex + 1]?.stories[0];
    if (nextGroupFirst) {
      preloader.preload(
        nextGroupFirst.src,
        nextGroupFirst.mediaType as 'image' | 'video',
      );
    }
  }

  private _activeStory(): StoryItem | undefined {
    return this.groups()[this.storiesCtrl.state.activeGroupIndex.value]
      ?.stories[this.storiesCtrl.state.activeStoryIndex.value];
  }

  /** Which story a card previews: where that group was left, or its resume. */
  protected readonly storyIndexForCard = (groupIndex: number): number =>
    this.storiesCtrl.getLastStoryIndex(groupIndex);

  /**
   * A card's own story, drawn by the consumer's slide template. Videos are
   * left out: every video plays through one shared element, which belongs to
   * the story on screen.
   */
  protected readonly cardFrameContext = (
    groupIndex: number,
  ): StoriesSlideContext<T> | null => {
    const storyIndex = this.storyIndexForCard(groupIndex);
    const story = this.storiesOf(groupIndex)[storyIndex];
    if (!story || story.mediaType === 'video') return null;
    // Nothing on a card reports to the player: a frame that called these
    // would drive the timer and the loading state of the story on screen.
    return {
      ...this.slideContext(groupIndex, storyIndex),
      isActive: false,
      onDurationReady: noop,
      onReady: noop,
      onWaiting: noop,
      onError: noop,
      onEnded: noop,
    };
  };

  /**
   * While the cards slide the player is behind them, so a timer action waits
   * and runs when they arrive. Otherwise it runs now.
   */
  private _runTimer(action: () => void): void {
    if (this.slide()) this._pendingTimerAction = action;
    else action();
  }

  /**
   * Stopping the timer also withdraws whatever was waiting for the slide to
   * end. Otherwise a start asked for first would outlive the reset, the pause
   * or the failure that followed it, and run the timer over a story that is
   * loading, paused or broken.
   */
  private _resetTimer(): void {
    this._pendingTimerAction = null;
    this.timerCtrl.reset();
  }

  private _pauseTimer(): void {
    this._pendingTimerAction = null;
    this.timerCtrl.pause();
  }

  /**
   * Ends a slide the player never came out of, on the way out: the story it
   * was opening was never on screen, so it is neither reported nor timed.
   */
  private _cancelSlide(): void {
    clearTimeout(this._slideTimeout);
    cancelAnimationFrame(this._slideFrame);
    this._pendingViewed = null;
    this._pendingTimerAction = null;
    this.slide.set(null);
  }

  protected endSlide(): void {
    clearTimeout(this._slideTimeout);
    cancelAnimationFrame(this._slideFrame);
    if (!this.slide()) return;

    // The card of the opened group leaves the page now. Focus left on a card
    // would fall to the document body, outside the dialog, so it goes to the
    // player the viewer just opened.
    const overlay = this._overlayRef()?.nativeElement;
    if (
      overlay
        ?.querySelector('.rk-stories-carousel')
        ?.contains(document.activeElement)
    ) {
      overlay.focus({ preventScroll: true });
    }

    this.slide.set(null);

    const pendingViewed = this._pendingViewed;
    this._pendingViewed = null;
    if (pendingViewed) {
      const [groupIndex, storyIndex] = pendingViewed;
      this.viewed()?.markViewed(groupIndex, storyIndex);
      this.storyViewed.emit({ groupIndex, storyIndex });
    }

    const pendingAction = this._pendingTimerAction;
    this._pendingTimerAction = null;
    if (!this.storiesCtrl.state.isPaused.value) pendingAction?.();
  }

  /**
   * Lays the cards out around the group being left, then moves them to their
   * places around the one being opened. A transition that never runs — a
   * hidden tab, a theme with no duration — ends the slide on a timer instead.
   */
  private _beginSlide(from: number, to: number): void {
    // A slide that interrupts another one drops the first one's deadline,
    // which would otherwise end the new slide early.
    clearTimeout(this._slideTimeout);
    cancelAnimationFrame(this._slideFrame);
    this._pauseTimer();
    this.slide.set({ from, to, phase: 'start' });

    this._slideFrame = requestAnimationFrame(() => {
      this._slideFrame = requestAnimationFrame(() => {
        this.slide.set({ from, to, phase: 'run' });
      });
    });

    const card =
      this._overlayRef()?.nativeElement.querySelector('.rk-stories-card');
    const duration = card
      ? parseDurationMs(getComputedStyle(card).transitionDuration ?? '')
      : 0;
    if (duration > 0) this._cardTransitionMs = duration;
    this._slideTimeout = setTimeout(
      () => this.endSlide(),
      this._cardTransitionMs + _kSlideTimeoutMarginMs,
    );
  }

  private _updateCarouselActive(): void {
    const active =
      this.desktopLayout() === 'carousel' && !isMobileWidth(window.innerWidth);
    this.carouselActive.set(active);
    if (!active) this.endSlide();
  }

  private _followActiveGroup(): void {
    const previous = this._lastGroupIndex;
    const groupIndex = this.storiesCtrl.state.activeGroupIndex.value;
    this._lastGroupIndex = groupIndex;

    if (!this.carouselActive()) {
      // A swipe has already turned the player, so only a turn still to come
      // holds the group being left as it was.
      const frozen: ReadonlyMap<number, number> =
        previous !== groupIndex && !this._changingByDrag
          ? new Map([[previous, this.timerCtrl.progress.value]])
          : new Map();
      this.frozenProgress.set(frozen);
      this._queueSliderMove(() => this._outerReel?.goTo(groupIndex, true)).then(
        () => {
          if (this.frozenProgress() === frozen)
            this.frozenProgress.set(new Map());
        },
      );
      return;
    }

    this._queueSliderMove(() => this._outerReel?.goTo(groupIndex, false));
    if (!this._changingByDrag && previous !== groupIndex) {
      this._beginSlide(previous, groupIndex);
    }
  }

  private _followActiveStory(): void {
    // A new story always plays. The timer restarts below either way, so a
    // pause kept here would leave the header showing one nobody is holding.
    if (this.storiesCtrl.state.isPaused.value) this.storiesCtrl.resume();
    this._queueSliderMove(() => {
      const groupIndex = this.storiesCtrl.state.activeGroupIndex.value;
      const storyIndex = this.storiesCtrl.state.activeStoryIndex.value;
      return this._innerReels.get(groupIndex)?.goTo(storyIndex, true);
    });
    this._restartTimer();
  }

  /**
   * Slider moves run one after another, never on top of each other.
   *
   * A slider ignores a `goTo` while it is still animating, so a viewer tapping
   * faster than a transition — or the auto-advance timer landing mid-slide —
   * would have that move dropped and the slider would fall behind the engine
   * for good. Queueing instead re-reads where the engine *now* is when the
   * previous move finishes, so the slider catches up in one step and skips the
   * stories the viewer already went past.
   *
   * The returned promise settles once this move has finished.
   */
  private _queueSliderMove(
    move: () => Promise<void> | undefined,
  ): Promise<void> {
    this._sliderQueue = this._sliderQueue.then(async () => {
      try {
        await move();
      } catch {
        // A slider torn down mid-move is not worth stopping the queue for.
      }
    });
    return this._sliderQueue;
  }

  /**
   * A group change always sets a paused player going again. A group that
   * opens on the story index the viewer just left changes no story, so the
   * story reaction stayed silent and the timer restarts here.
   */
  private _settleGroupChange(): void {
    if (this.storiesCtrl.state.isPaused.value) this.storiesCtrl.resume();
    if (
      this._timedGroupIndex !== this.storiesCtrl.state.activeGroupIndex.value
    ) {
      this._restartTimer();
    }
  }

  private _restartTimer(): void {
    const groupIndex = this.storiesCtrl.state.activeGroupIndex.value;
    const storyIndex = this.storiesCtrl.state.activeStoryIndex.value;
    this._timedGroupIndex = groupIndex;
    this._resetTimer();
    this._startOrDeferTimer(this.groups()[groupIndex]?.stories[storyIndex]);
  }

  /**
   * Picks the story's timer up where it stopped, or starts it when it never
   * ran. Content still loading, or failed, keeps the timer waiting.
   */
  private _resumeTimer(): void {
    if (this.loadingCtrl.isLoading.value || this.loadingCtrl.isError.value) {
      return;
    }
    if (this.timerCtrl.progress.value > 0) {
      this.timerCtrl.resume();
      return;
    }
    const groupIndex = this.storiesCtrl.state.activeGroupIndex.value;
    const storyIndex = this.storiesCtrl.state.activeStoryIndex.value;
    this.timerCtrl.start(
      this._durationOf(this.groups()[groupIndex]?.stories[storyIndex]),
    );
  }

  /**
   * An image already in the cache starts its timer at once; one still
   * arriving, and every video, waits for the slide to report itself ready.
   */
  private _startOrDeferTimer(story: StoryItem | undefined): void {
    if (this.timerCtrl.isRunning.value) return;

    this.loadingCtrl.isError.value = false;

    if (story?.src && preloader.isErrored(story.src)) {
      this.loadingCtrl.isLoading.value = false;
      this.loadingCtrl.isError.value = true;
      return;
    }

    if (story?.mediaType === 'image' && story.src) {
      if (preloader.isLoaded(story.src)) {
        this.loadingCtrl.isLoading.value = false;
        this._runTimer(() => this.timerCtrl.start(this._durationOf(story)));
      } else {
        this.loadingCtrl.isLoading.value = true;
      }
      return;
    }

    if (story?.mediaType === 'video' && story.src) {
      this.loadingCtrl.isLoading.value = true;
      return;
    }

    this.loadingCtrl.isLoading.value = false;
    this._runTimer(() =>
      this.timerCtrl.start(story?.duration ?? this.defaultImageDuration()),
    );
  }

  protected onNavKey(increment: -1 | 1): void {
    if (increment === -1) this.storiesCtrl.prevStory();
    else this.storiesCtrl.nextStory();
  }

  /**
   * A click on a navigation button moves one story; holding it moves a whole
   * group, which is how a viewer skips past someone quickly.
   */
  protected onNavPressStart(direction: -1 | 1): void {
    this._navLongPressFired = false;
    this._navLongPressTimer = setTimeout(() => {
      this._navLongPressFired = true;
      if (direction === -1) this.storiesCtrl.prevGroup();
      else this.storiesCtrl.nextGroup();
    }, _kNavLongPressMs);
  }

  protected onNavPressEnd(direction: -1 | 1): void {
    clearTimeout(this._navLongPressTimer);
    if (this._navLongPressFired) return;
    if (direction === -1) this.storiesCtrl.prevStory();
    else this.storiesCtrl.nextStory();
  }

  protected onNavPressCancel(): void {
    clearTimeout(this._navLongPressTimer);
  }

  private _durationOf(story: StoryItem | undefined): number {
    if (!story) return this.defaultImageDuration();
    if (story.duration) return story.duration;
    return this._knownDurations.get(story.src) ?? this.defaultImageDuration();
  }
}
