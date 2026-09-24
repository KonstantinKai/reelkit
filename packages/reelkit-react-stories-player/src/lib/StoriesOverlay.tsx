/* eslint-disable react-hooks/exhaustive-deps */
import {
  type ReactElement,
  type ReactNode,
  type MutableRefObject,
  useState,
  useRef,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import {
  createSignal,
  createDisposableList,
  createContentPreloader,
  createContentLoadingController,
  reaction,
  observeDomEvent,
  captureFocusForReturn,
  createFocusTrap,
  Reel,
  Observe,
  noop,
  useBodyLock,
  SoundProvider,
  useSoundState,
  cubeTransition,
  fadeTransition,
  slideTransition,
  type ReelApi,
  type Signal,
  type UrlStateController,
  type TwoAxisPosition,
  type TransitionTransformFn,
} from '@reelkit/react';
import {
  createStoriesController,
  createTimerController,
  getTapAction,
  getStoriesSize,
  isMobileWidth,
  parseDurationMs,
  type StoryItem,
  type StoriesGroup,
  type StoriesViewedStateController,
} from '@reelkit/stories-core';
import { ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';
import type {
  StoriesApi,
  HeaderRenderProps,
  FooterRenderProps,
  SlideRenderProps,
  NavigationRenderProps,
  ProgressBarRenderProps,
  LoadingRenderProps,
  ErrorRenderProps,
  DesktopLayout,
  ChromePlacement,
  GroupPreviewRenderProps,
} from './types';
import { CanvasProgressBar } from './CanvasProgressBar';
import { StoryHeader } from './StoryHeader';
import { ImageStorySlide } from './ImageStorySlide';
import { VideoStorySlide, shared as sharedVideo } from './VideoStorySlide';
import { SwipeToClose, type GestureCommonEvent } from '@reelkit/react';
import { HeartAnimation } from './HeartAnimation';
import { StoriesCarousel, type CarouselSlide } from './StoriesCarousel';
import { useAttachViewedState } from './useAttachViewedState';
import './StoriesOverlay.css';

// The slide normally ends on the transition of the card moving into the
// center. A transition that never runs — the tab hidden mid-slide, a theme
// setting the duration to zero — sends no event, so a time limit ends it
// instead: the duration the cards are themed with, plus this much.
const _kSlideTimeoutMarginMs = 700;

/**
 * Props for the {@link StoriesOverlay} component.
 *
 * Generic over `T` — pass any type extending {@link StoryItem} to use
 * custom data on story items.
 *
 * @typeParam T - Story item type. Defaults to {@link StoryItem}.
 */
export interface StoriesOverlayProps<T extends StoryItem = StoryItem> {
  /** When `true`, the overlay is rendered and body scroll is locked. */
  isOpen: boolean;

  /**
   * Accessible label for the dialog region. Announced by screen readers
   * when the overlay opens.
   *
   * @default 'Stories player'
   */
  ariaLabel?: string;

  /** Array of story groups to display. */
  groups: StoriesGroup<T>[];

  /**
   * Zero-based index of the initially visible group.
   * @default 0
   */
  initialGroupIndex?: number;

  /**
   * Zero-based index of the initially visible story within the group. Naming
   * one outright wins over anything remembered, which is what makes a shared
   * link open where it points; leave it out and the opening group resumes
   * through `resumeStoryIndex` like every other group.
   *
   * @default resumeStoryIndex(initialGroupIndex), or 0 with no resume callback
   */
  initialStoryIndex?: number;

  /**
   * Transition effect for the outer (group) slider.
   * @default cubeTransition
   */
  groupTransition?: TransitionTransformFn;

  /**
   * Default auto-advance duration for image stories in milliseconds.
   * @default 5000
   */
  defaultImageDuration?: number;

  /**
   * Tap zone split ratio (0–1). Left portion triggers prev, right triggers next.
   * @default 0.3
   */
  tapZoneSplit?: number;

  /**
   * Hide the progress bar and header while paused by a long press. A footer
   * from `renderFooter` stays.
   *
   * @default true
   */
  hideUIOnPause?: boolean;

  /**
   * Enable keyboard navigation (left/right arrows, Escape).
   * @default true
   */
  enableKeyboard?: boolean;

  /**
   * Duration of the inner (story) transition animation in milliseconds.
   * @default 200
   */
  innerTransitionDuration?: number;

  /**
   * Minimum segment width in pixels for the progress bar.
   * @default 8
   */
  minSegmentWidth?: number;

  /** Ref to access the imperative {@link StoriesApi}. */
  apiRef?: MutableRefObject<StoriesApi | null>;

  /**
   * Layout on a desktop screen. `'carousel'` shows neighbouring groups as
   * dimmed preview cards on both sides of the active story, the way the
   * Instagram desktop viewer does, and slides between groups; clicking a card
   * opens that group. Phones always show the active story alone.
   *
   * @default 'single'
   */
  desktopLayout?: DesktopLayout;

  /**
   * Where the progress bar and the header live. `'overlay'` draws one copy
   * above the player, which switches to the new group once the group changes.
   * `'group'` gives each group its own copy inside its slide, so the bar and
   * the header turn with the group, the way Instagram does it; a neighbouring
   * group shows where it stands. The desktop carousel hides the player while
   * its cards slide, so there the choice shows only once a group is open.
   *
   * With `'group'` a custom header sits inside the swipe area, and a tap on it
   * moves between stories unless it lands on a `button`, a link, or an element
   * with `role="button"`.
   *
   * @default 'overlay'
   */
  chromePlacement?: ChromePlacement;

  /**
   * What the viewer has seen, from `createStoriesViewedStateController`. Given
   * this, the player does the whole job: a group opens on its first unseen
   * story, every story shown is recorded, and the carousel cards draw a muted
   * ring for a group watched to the end. Hand the same controller to
   * `StoriesRingList`.
   *
   * The player reads storage through it in an effect that runs whether or not
   * the player is open, so the store is ready by the time it opens. A player
   * mounted only at the moment it opens (`{open && <StoriesOverlay … />}`)
   * chooses its opening story before that effect runs; call `viewed.attach()`
   * yourself in that case, in an effect that returns its dispose.
   *
   * An explicit `resumeStoryIndex` prop wins over the controller's, and
   * `onStoryViewed` still fires alongside the recording.
   */
  viewed?: StoriesViewedStateController;

  /** Callback to close the overlay. */
  onClose: () => void;

  /** Fired when the active story changes. */
  onStoryChange?: (groupIndex: number, storyIndex: number) => void;

  /** Fired when the active group changes. */
  onGroupChange?: (groupIndex: number) => void;

  /** Fired when a story becomes visible. */
  onStoryViewed?: (groupIndex: number, storyIndex: number) => void;

  /** Fired when a story's timer completes. */
  onStoryComplete?: (groupIndex: number, storyIndex: number) => void;

  /** Fired on a double-tap gesture. */
  onDoubleTap?: (groupIndex: number, storyIndex: number) => void;

  /** Fired when the player is paused. */
  onPause?: () => void;

  /** Fired when the player is resumed. */
  onResume?: () => void;

  /**
   * Which story a group should open on the first time it is reached — how a
   * remembered "seen up to here" reaches the player. The `viewed` controller
   * supplies this by itself; pass a function only to decide differently, it
   * wins over the controller's. Without either, every group starts at its
   * first story.
   *
   * Only consulted for a group not yet visited during this open; a group the
   * viewer already swiped through reopens exactly where they left it. That
   * includes the group the player opens on, unless `initialStoryIndex` names a
   * story outright.
   *
   * Called while rendering, so it must only read what a viewer has seen — a
   * handler that writes state from it would be updating one component during
   * another's render.
   *
   * @default undefined — every group opens on its first story
   */
  resumeStoryIndex?: (groupIndex: number) => number;

  /**
   * Replaces the content of a desktop carousel card. The player still
   * positions, scales and slides the card; call `onOpen` from the props to open
   * the group.
   */
  renderGroupPreview?: (props: GroupPreviewRenderProps<T>) => ReactNode;

  /** Custom header renderer. */
  renderHeader?: (props: HeaderRenderProps<T>) => ReactNode;

  /** Custom footer renderer. */
  renderFooter?: (props: FooterRenderProps<T>) => ReactNode;

  /** Custom slide renderer, replacing the default media slides. */
  renderSlide?: (props: SlideRenderProps<T>) => ReactNode;

  /** Custom desktop navigation. Replaces default prev/next chevron buttons. */
  renderNavigation?: (props: NavigationRenderProps) => ReactNode;

  /** Custom progress bar. Replaces default canvas progress bar. */
  renderProgressBar?: (props: ProgressBarRenderProps<T>) => ReactNode;

  /** Custom loading UI renderer. When not provided, shows default header spinner. */
  renderLoading?: (props: LoadingRenderProps<T>) => ReactNode;

  /** Custom error UI renderer. When not provided, shows default error icon overlay. */
  renderError?: (props: ErrorRenderProps<T>) => ReactNode;
}

const preloader = createContentPreloader();

const _kLongPressMs = 500;

function NavButton({
  children,
  onClick,
  onLongPress,
  ...rest
}: {
  children: React.ReactNode;
  onClick: () => void;
  onLongPress: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(0 as never);
  const firedRef = useRef(false);

  const onPointerDown = () => {
    firedRef.current = false;
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      onLongPress();
    }, _kLongPressMs);
  };

  const onPointerUp = () => {
    clearTimeout(timerRef.current);
    if (!firedRef.current) onClick();
  };

  return (
    <button
      className="rk-stories-nav-btn"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={() => clearTimeout(timerRef.current)}
      {...rest}
    >
      {children}
    </button>
  );
}

function StoriesContent<T extends StoryItem = StoryItem>({
  onClose,
  ariaLabel,
  groups,
  initialGroupIndex = 0,
  initialStoryIndex,
  resumeStoryIndex,
  groupTransition = cubeTransition,
  defaultImageDuration = 5000,
  tapZoneSplit = 0.3,
  hideUIOnPause = true,
  enableKeyboard = true,
  innerTransitionDuration = 200,
  minSegmentWidth = 8,
  onStoryChange,
  onGroupChange,
  onStoryViewed,
  onStoryComplete,
  onDoubleTap,
  onPause,
  onResume,
  renderHeader,
  renderFooter,
  renderSlide,
  renderNavigation,
  renderProgressBar,
  renderLoading,
  renderError,
  desktopLayout = 'single',
  chromePlacement = 'overlay',
  viewed,
  renderGroupPreview,
  apiRef,
}: Omit<StoriesOverlayProps<T>, 'isOpen'>) {
  const outerReelRef = useRef<ReelApi>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const innerReelRefs = useRef<Map<number, ReelApi>>(new Map());
  const activeGroupIndexRef = useRef(initialGroupIndex);
  // Seeded from the controller below, which is what settles an omitted
  // `initialStoryIndex` against the resume callback.
  const activeStoryIndexRef = useRef(0);

  // Stable refs for callbacks to avoid stale closures
  const propsRef = useRef({
    onStoryChange,
    onGroupChange,
    onStoryViewed,
    onStoryComplete,
    onClose,
    onDoubleTap,
    onPause,
    onResume,
    resumeStoryIndex,
    renderFooter,
    renderSlide,
    renderLoading,
    renderError,
    tapZoneSplit,
    desktopLayout,
    groups,
    viewed,
  });
  propsRef.current = {
    onStoryChange,
    onGroupChange,
    onStoryViewed,
    onStoryComplete,
    onClose,
    onDoubleTap,
    onPause,
    onResume,
    resumeStoryIndex,
    renderFooter,
    renderSlide,
    renderLoading,
    renderError,
    tapZoneSplit,
    desktopLayout,
    groups,
    viewed,
  };

  // A story shown goes to the viewed controller and to the consumer alike.
  const reportViewed = (groupIndex: number, storyIndex: number) => {
    propsRef.current.viewed?.markViewed(groupIndex, storyIndex);
    propsRef.current.onStoryViewed?.(groupIndex, storyIndex);
  };

  // The groups of the latest render. Everything below that outlives a render —
  // the controller's handlers, the effects set up on mount — reads the groups
  // through this, so a feed that pages in more of them is not frozen to the
  // ones the player opened with.
  const latestGroups = () => propsRef.current.groups;

  const heartIdRef = useRef(0);

  const {
    storiesCtrl,
    timerCtrl,
    sizeSignal,
    heartsSignal,
    longPressSignal,
    loadingCtrl,
    carouselActive,
    slideSignal,
    frozenProgress,
    updateCarouselActive,
    endSlide,
    cancelSlide,
    runTimer,
    pauseTimer,
    resumeTimer,
    restartTimer,
    followActiveGroup,
    startOrDeferTimer,
    handleTap,
    handleDoubleTap,
    handleLongPressStart,
    handleLongPressEnd,
    handleOuterDragStart,
    handleOuterDragEnd,
    handleOuterAfterChange,
    handleDurationReady,
    handleContentReady,
    handleVideoWaiting,
    handleVideoEnded,
    handleContentError,
    removeHeart,
    togglePause,
  } = useState(() => {
    const isCarouselLayout = () =>
      propsRef.current.desktopLayout === 'carousel' &&
      !isMobileWidth(window.innerWidth);
    const carouselActive = createSignal(isCarouselLayout());
    const slideSignal = createSignal<CarouselSlide | null>(null);
    // The newest story the viewer reached while a slide was running. It is not
    // on screen until the slide ends, so it is reported as viewed only then.
    let pendingViewed: [number, number] | null = null;
    // The newest timer action asked for while a slide was running.
    let pendingTimerAction: (() => void) | null = null;
    let slideTimeout: ReturnType<typeof setTimeout> | undefined;
    let cardTransitionMs = 0;
    let slideFrame = 0;

    const storiesCtrl = createStoriesController(
      {
        groupCount: groups.length,
        storyCounts: groups.map((g) => g.stories.length),
        initialGroupIndex,
        initialStoryIndex,
        defaultImageDuration,
        // An explicit prop wins over the viewed controller's answer.
        resumeStoryIndex: (groupIndex) =>
          (
            propsRef.current.resumeStoryIndex ??
            propsRef.current.viewed?.resumeStoryIndex
          )?.(groupIndex) ?? 0,
      },
      // Read callbacks off the ref at fire time, never off this closure. The
      // controller is built once and outlives every prop update, so a callback
      // captured here would freeze to the render that created it; reading the
      // ref means a later prop carrying a different callback is still honored on
      // the next fire.
      {
        onStoryChange: (groupIndex, storyIndex) =>
          propsRef.current.onStoryChange?.(groupIndex, storyIndex),
        onGroupChange: (groupIndex) => {
          propsRef.current.onGroupChange?.(groupIndex);
          settleGroupChange();
        },
        onStoryViewed: (groupIndex, storyIndex) => {
          if (slideSignal.value) pendingViewed = [groupIndex, storyIndex];
          else reportViewed(groupIndex, storyIndex);
        },
        onStoryComplete: (groupIndex, storyIndex) =>
          propsRef.current.onStoryComplete?.(groupIndex, storyIndex),
        onClose: () => propsRef.current.onClose(),
      },
    );

    // The controller settles where the player actually opens — an omitted
    // `initialStoryIndex` resolves through the resume callback — so the ref
    // that mirrors its position is seeded from it rather than from the prop.
    activeStoryIndexRef.current = storiesCtrl.state.activeStoryIndex.value;

    const timerCtrl = createTimerController({
      duration: defaultImageDuration,
      onComplete: () => storiesCtrl.onStoryTimerComplete(),
    });

    const sizeSignal = createSignal<[number, number]>(getStoriesSize());
    const heartsSignal = createSignal<{ id: number }[]>([]);
    const longPressSignal = createSignal(false);
    const loadingCtrl = createContentLoadingController();
    const knownDurations = new Map<string, number>();

    const getDuration = (story: StoryItem | undefined): number => {
      if (!story) return defaultImageDuration;
      if (story.duration) return story.duration;
      return knownDurations.get(story.src) ?? defaultImageDuration;
    };

    // While a slide runs the player is hidden behind the moving cards, so the
    // timer waits: the action is kept and run when the slide ends.
    const runTimer = (action: () => void) => {
      if (slideSignal.value) pendingTimerAction = action;
      else action();
    };

    // Stopping the timer also withdraws whatever was waiting for the slide to
    // end. Otherwise a resume asked for first would outlive the reset that
    // followed it and run the timer over a story that is still loading.
    const resetTimer = () => {
      pendingTimerAction = null;
      timerCtrl.reset();
    };

    const pauseTimer = () => {
      pendingTimerAction = null;
      timerCtrl.pause();
    };

    // Group of the story the timer was last restarted for.
    let timedGroupIndex = storiesCtrl.state.activeGroupIndex.value;

    const restartTimer = () => {
      const gi = storiesCtrl.state.activeGroupIndex.value;
      const si = storiesCtrl.state.activeStoryIndex.value;
      timedGroupIndex = gi;
      resetTimer();
      startOrDeferTimer(latestGroups()[gi]?.stories[si]);
    };

    // Picks the story's timer up where it stopped, or starts it when it never
    // ran. Content that is still loading, or failed, keeps the timer waiting.
    const resumeTimer = () => {
      if (loadingCtrl.isLoading.value || loadingCtrl.isError.value) return;
      if (timerCtrl.progress.value > 0) {
        timerCtrl.resume();
      } else {
        const gi = storiesCtrl.state.activeGroupIndex.value;
        const si = storiesCtrl.state.activeStoryIndex.value;
        timerCtrl.start(getDuration(latestGroups()[gi]?.stories[si]));
      }
    };

    // Runs once the controller has moved to another group, after the group and
    // story reactions. A group change always sets a paused player going again.
    // A group that opens on the story index the viewer just left changes no
    // story, so the story reaction stayed silent and the timer restarts here.
    const settleGroupChange = () => {
      if (storiesCtrl.state.isPaused.value) storiesCtrl.resume();
      if (timedGroupIndex !== storiesCtrl.state.activeGroupIndex.value) {
        restartTimer();
      }
    };

    const stopSlide = () => {
      clearTimeout(slideTimeout);
      cancelAnimationFrame(slideFrame);
      slideSignal.value = null;
    };

    // Ends a slide the player never came out of, on the way out: the story it
    // was opening was not shown, so it is neither reported nor timed.
    const cancelSlide = () => {
      stopSlide();
      pendingViewed = null;
      pendingTimerAction = null;
    };

    const endSlide = () => {
      if (!slideSignal.value) return;

      // The card of the opened group leaves the page now, and the cards around
      // it change places. Focus left on a card would fall to the document body,
      // outside the dialog, so it goes to the player the viewer just opened.
      const overlayEl = overlayRef.current;
      if (
        overlayEl
          ?.querySelector('.rk-stories-carousel')
          ?.contains(document.activeElement)
      ) {
        overlayEl.focus({ preventScroll: true });
      }

      stopSlide();

      const held = pendingViewed;
      const timerAction = pendingTimerAction;
      pendingViewed = null;
      pendingTimerAction = null;
      if (held) reportViewed(held[0], held[1]);
      if (!storiesCtrl.state.isPaused.value) timerAction?.();
    };

    const beginSlide = (from: number, to: number) => {
      clearTimeout(slideTimeout);
      cancelAnimationFrame(slideFrame);
      // A slide that interrupts another also drops what the first one was
      // holding for its own group.
      pauseTimer();
      slideSignal.value = { from, to, phase: 'start' };
      // Two frames: the first paints the cards around the group being left,
      // the second starts the transition from there.
      slideFrame = requestAnimationFrame(() => {
        slideFrame = requestAnimationFrame(() => {
          slideSignal.value = { from, to, phase: 'run' };
        });
      });

      // Read once the overlay is marked as sliding, which is what switches the
      // card transition on. A theme can make the slide as long as it likes
      // through `--rk-stories-card-transition`; the limit waits for all of it.
      // A slide that interrupts another in its first frame finds the cards with
      // their transition still held off, so the last duration seen stands in.
      const card = overlayRef.current?.querySelector('.rk-stories-card');
      const duration = card
        ? parseDurationMs(getComputedStyle(card).transitionDuration ?? '')
        : 0;
      if (duration > 0) cardTransitionMs = duration;
      slideTimeout = setTimeout(
        endSlide,
        cardTransitionMs + _kSlideTimeoutMarginMs,
      );
    };

    const updateCarouselActive = () => {
      carouselActive.value = isCarouselLayout();
      if (!carouselActive.value) endSlide();
    };

    // How far the story of a group being turned away from had played, by
    // group. The controller moves to the new group before the turn starts, and
    // the timer resets right after, so a progress bar drawn inside the group
    // being left would otherwise empty its segment while it is still in view.
    const frozenProgress = createSignal<ReadonlyMap<number, number>>(new Map());

    // A touch swipe has already moved the player to the new group, so it gets
    // no slide on top.
    let changingByDrag = false;

    const followActiveGroup = () => {
      const previous = activeGroupIndexRef.current;
      const groupIndex = storiesCtrl.state.activeGroupIndex.value;
      activeGroupIndexRef.current = groupIndex;

      if (!carouselActive.value) {
        // A swipe has already turned the player, so only a turn still to come
        // holds the group being left as it was.
        const frozen: ReadonlyMap<number, number> =
          previous !== groupIndex && !changingByDrag
            ? new Map([[previous, timerCtrl.progress.value]])
            : new Map();
        frozenProgress.value = frozen;
        outerReelRef.current?.goTo(groupIndex, true).then(() => {
          if (frozenProgress.value === frozen) frozenProgress.value = new Map();
        });
        return;
      }

      outerReelRef.current?.goTo(groupIndex, false);
      if (!changingByDrag && previous !== groupIndex) {
        beginSlide(previous, groupIndex);
      }
    };

    const startOrDeferTimer = (story: StoryItem | undefined) => {
      // NOTE: Skip if timer already running — handleContentReady may have
      // fired before this effect runs (cached content on re-open).
      if (timerCtrl.isRunning.value) return;

      loadingCtrl.isError.value = false;

      if (story?.src && preloader.isErrored(story.src)) {
        loadingCtrl.isLoading.value = false;
        loadingCtrl.isError.value = true;
        return;
      }

      if (story?.mediaType === 'image' && story.src) {
        if (preloader.isLoaded(story.src)) {
          loadingCtrl.isLoading.value = false;
          runTimer(() => timerCtrl.start(getDuration(story)));
        } else {
          loadingCtrl.isLoading.value = true;
        }
      } else if (story?.mediaType === 'video' && story.src) {
        loadingCtrl.isLoading.value = true;
      } else {
        loadingCtrl.isLoading.value = false;
        runTimer(() =>
          timerCtrl.start(story?.duration ?? defaultImageDuration),
        );
      }
    };

    return {
      storiesCtrl,
      timerCtrl,
      sizeSignal,
      heartsSignal,
      longPressSignal,
      loadingCtrl,
      carouselActive,
      slideSignal,
      frozenProgress,
      updateCarouselActive,
      endSlide,
      cancelSlide,
      runTimer,
      pauseTimer,
      resumeTimer,
      restartTimer,
      followActiveGroup,
      startOrDeferTimer,

      handleTap(event: GestureCommonEvent) {
        const [w] = sizeSignal.value;
        const split = propsRef.current.tapZoneSplit ?? 0.3;
        const action = getTapAction(event.localPosition[0], w, split);
        if (action === 'next') storiesCtrl.nextStory();
        else storiesCtrl.prevStory();
      },
      handleDoubleTap() {
        const id = ++heartIdRef.current;
        heartsSignal.value = [...heartsSignal.value, { id }];
        propsRef.current.onDoubleTap?.(
          storiesCtrl.state.activeGroupIndex.value,
          storiesCtrl.state.activeStoryIndex.value,
        );
      },
      handleLongPressStart() {
        longPressSignal.value = true;
        storiesCtrl.pause();
        propsRef.current.onPause?.();
      },
      handleLongPressEnd() {
        longPressSignal.value = false;
        storiesCtrl.resume();
        propsRef.current.onResume?.();
      },
      togglePause() {
        if (storiesCtrl.state.isPaused.value) {
          storiesCtrl.resume();
          propsRef.current.onResume?.();
        } else {
          storiesCtrl.pause();
          propsRef.current.onPause?.();
        }
      },
      handleOuterDragStart() {
        timerCtrl.pause();
        const gi = storiesCtrl.state.activeGroupIndex.value;
        const si = storiesCtrl.state.activeStoryIndex.value;
        if (latestGroups()[gi]?.stories[si]?.mediaType === 'video') {
          sharedVideo.getVideo().pause();
        }
      },
      handleOuterDragEnd() {
        if (!storiesCtrl.state.isPaused.value) {
          timerCtrl.resume();
          const gi = storiesCtrl.state.activeGroupIndex.value;
          const si = storiesCtrl.state.activeStoryIndex.value;
          if (latestGroups()[gi]?.stories[si]?.mediaType === 'video') {
            sharedVideo.getVideo().play().catch(noop);
          }
        }
      },
      handleOuterAfterChange(index: number) {
        // Guard: the activeGroupIndex reaction calls outerReel.goTo()
        // which triggers another afterChange → re-entry. Skip if
        // already at the target group.
        if (storiesCtrl.state.activeGroupIndex.value === index) return;

        changingByDrag = true;
        storiesCtrl.goToGroup(index);
        changingByDrag = false;
      },
      handleContentReady(groupIndex: number, storyIndex: number) {
        const story = latestGroups()[groupIndex]?.stories[storyIndex];
        if (story?.src) preloader.markLoaded(story.src);

        if (
          groupIndex === storiesCtrl.state.activeGroupIndex.value &&
          storyIndex === storiesCtrl.state.activeStoryIndex.value
        ) {
          loadingCtrl.isLoading.value = false;
          runTimer(resumeTimer);
        }
      },
      handleVideoWaiting(groupIndex: number, storyIndex: number) {
        if (
          groupIndex === storiesCtrl.state.activeGroupIndex.value &&
          storyIndex === storiesCtrl.state.activeStoryIndex.value
        ) {
          loadingCtrl.isLoading.value = true;
          pauseTimer();
        }
      },
      handleDurationReady(groupIndex: number, storyIndex: number, ms: number) {
        const story = latestGroups()[groupIndex]?.stories[storyIndex];
        if (story?.src) knownDurations.set(story.src, ms);
        // A story that names its own duration keeps it, whatever the video
        // reports.
        if (
          !story?.duration &&
          groupIndex === storiesCtrl.state.activeGroupIndex.value &&
          storyIndex === storiesCtrl.state.activeStoryIndex.value
        ) {
          runTimer(() => timerCtrl.start(ms));
        }
      },
      handleVideoEnded() {
        storiesCtrl.onStoryTimerComplete();
      },
      handleContentError(groupIndex: number, storyIndex: number) {
        const story = latestGroups()[groupIndex]?.stories[storyIndex];
        if (story?.src) preloader.markErrored(story.src);

        if (
          groupIndex === storiesCtrl.state.activeGroupIndex.value &&
          storyIndex === storiesCtrl.state.activeStoryIndex.value
        ) {
          loadingCtrl.isLoading.value = false;
          loadingCtrl.isError.value = true;
          pauseTimer();
        }
      },
      removeHeart(id: number) {
        heartsSignal.value = heartsSignal.value.filter((h) => h.id !== id);
      },
    };
  })[0];

  const soundState = useSoundState();

  const uiLayerClassName = () =>
    `rk-stories-ui-layer ${hideUIOnPause && longPressSignal.value ? 'rk-stories-ui-layer--hidden' : ''}`;

  const renderGroupProgressBar = (
    groupIndex: number,
    isActive: boolean,
    activeIndex: Signal<number>,
    progress: Signal<number>,
  ) => {
    const group = groups[groupIndex];
    if (!group) return null;

    if (renderProgressBar) {
      return (
        <>
          {renderProgressBar({
            totalStories: group.stories.length,
            activeIndex,
            progress,
            group: group as StoriesGroup<T>,
            groupIndex,
            isActive,
          })}
        </>
      );
    }

    return (
      <CanvasProgressBar
        totalStories={group.stories.length}
        activeIndex={activeIndex}
        progress={progress}
        minSegmentWidth={minSegmentWidth}
        live={isActive}
      />
    );
  };

  // A group that is not active shows the story it stands on, not playing.
  const renderGroupHeader = (groupIndex: number, isActive: boolean) => {
    const group = groups[groupIndex];
    if (!group) return null;
    const si = isActive
      ? storiesCtrl.state.activeStoryIndex.value
      : storiesCtrl.getLastStoryIndex(groupIndex);
    const isPaused = isActive && storiesCtrl.state.isPaused.value;
    const isMuted = soundState.muted.value;
    const isContentLoading = isActive && loadingCtrl.isLoading.value;
    const isContentError = isActive && loadingCtrl.isError.value;
    const story = group.stories[si];
    const isVideo = story?.mediaType === 'video';

    if (renderHeader) {
      return (
        <>
          {renderHeader({
            author: group.author,
            story: story as T,
            storyIndex: si,
            onClose,
            isPaused,
            onTogglePause: togglePause,
            isMuted,
            onToggleSound: soundState.toggle,
            isVideo: isVideo ?? false,
            groupIndex,
            isActive,
          })}
        </>
      );
    }

    return (
      <StoryHeader
        author={group.author}
        createdAt={story?.createdAt}
        onClose={onClose}
        isPaused={isPaused}
        onTogglePause={togglePause}
        isMuted={isMuted}
        onToggleSound={soundState.toggle}
        isVideo={isVideo}
        isLoading={isContentLoading}
        isError={isContentError}
      />
    );
  };

  const activeHeaderSignals = [
    storiesCtrl.state.activeGroupIndex,
    storiesCtrl.state.activeStoryIndex,
    storiesCtrl.state.isPaused,
    soundState.muted,
    loadingCtrl.isLoading,
    loadingCtrl.isError,
  ];

  const renderGroupChrome = (groupIndex: number) => (
    <Observe
      signals={[
        longPressSignal,
        storiesCtrl.state.activeGroupIndex,
        frozenProgress,
      ]}
    >
      {() => {
        const isActive =
          storiesCtrl.state.activeGroupIndex.value === groupIndex;

        return (
          <div className={uiLayerClassName()}>
            {isActive
              ? renderGroupProgressBar(
                  groupIndex,
                  true,
                  storiesCtrl.state.activeStoryIndex,
                  timerCtrl.progress,
                )
              : renderGroupProgressBar(
                  groupIndex,
                  false,
                  createSignal(storiesCtrl.getLastStoryIndex(groupIndex)),
                  createSignal(frozenProgress.value.get(groupIndex) ?? 0),
                )}
            <Observe
              signals={isActive ? activeHeaderSignals : [soundState.muted]}
            >
              {() => renderGroupHeader(groupIndex, isActive)}
            </Observe>
          </div>
        );
      }}
    </Observe>
  );

  useBodyLock(true);

  // Set on the element directly: a class in the render would re-render the
  // whole player, both sliders included, on every slide.
  const applyOverlayModifiers = () => {
    const classes = overlayRef.current?.classList;
    classes?.toggle('rk-stories-overlay--carousel', carouselActive.value);
    classes?.toggle('rk-stories-overlay--sliding', slideSignal.value !== null);
  };

  useEffect(updateCarouselActive, [desktopLayout]);

  // The controller copies the counts when it is created. A feed that pages in
  // more groups, or adds a story to one, has to be reported to it, or the new
  // ones are drawn but can never be opened.
  useEffect(() => {
    storiesCtrl.updateConfig({
      groupCount: groups.length,
      storyCounts: groups.map((group) => group.stories.length),
    });
  }, [groups]);

  useEffect(() => {
    const disposables = createDisposableList();

    const restoreFocus = captureFocusForReturn();
    disposables.push(restoreFocus);
    const overlayEl = overlayRef.current;
    if (overlayEl) {
      overlayEl.focus({ preventScroll: true });
      disposables.push(createFocusTrap(overlayEl));
    }

    disposables.push(
      reaction(() => [storiesCtrl.state.activeGroupIndex], followActiveGroup),
      reaction(() => [carouselActive, slideSignal], applyOverlayModifiers),
      reaction(
        () => [storiesCtrl.state.activeStoryIndex],
        () => {
          if (storiesCtrl.state.isPaused.value) {
            storiesCtrl.resume();
          }

          const si = storiesCtrl.state.activeStoryIndex.value;
          const gi = storiesCtrl.state.activeGroupIndex.value;
          activeStoryIndexRef.current = si;
          innerReelRefs.current.get(gi)?.goTo(si, true);

          restartTimer();
        },
      ),
      reaction(
        () => [storiesCtrl.state.isPaused],
        () => {
          const gi = storiesCtrl.state.activeGroupIndex.value;
          const si = storiesCtrl.state.activeStoryIndex.value;
          const isVideo =
            latestGroups()[gi]?.stories[si]?.mediaType === 'video';

          if (storiesCtrl.state.isPaused.value) {
            pauseTimer();
            if (isVideo) sharedVideo.getVideo().pause();
          } else {
            runTimer(resumeTimer);
            if (isVideo) sharedVideo.getVideo().play().catch(noop);
          }
        },
      ),
      reaction(
        () => [
          storiesCtrl.state.activeGroupIndex,
          storiesCtrl.state.activeStoryIndex,
        ],
        () => {
          const gi = storiesCtrl.state.activeGroupIndex.value;
          const si = storiesCtrl.state.activeStoryIndex.value;
          const group = latestGroups()[gi];
          if (!group) return;

          const nextStory = group.stories[si + 1];
          if (nextStory)
            preloader.preload(
              nextStory.src,
              nextStory.mediaType as 'image' | 'video',
            );

          const nextGroup = latestGroups()[gi + 1];
          if (nextGroup?.stories[0]) {
            preloader.preload(
              nextGroup.stories[0].src,
              nextGroup.stories[0].mediaType as 'image' | 'video',
            );
          }
        },
      ),
      observeDomEvent(window, 'resize', () => {
        sizeSignal.value = getStoriesSize();
        updateCarouselActive();
        outerReelRef.current?.adjust();
      }),
      cancelSlide,
      timerCtrl.dispose,
    );
    applyOverlayModifiers();

    // NOTE: Do NOT dispose `storiesCtrl` here. It is created once for the component's
    // lifetime (in `useState`) and survives a mount/unmount/remount, but this
    // effect's cleanup runs on every such cycle — React re-runs cleanups, and in
    // development StrictMode deliberately mounts, unmounts, then remounts. Its
    // `dispose()` clears the event callbacks for good, so the remounted overlay
    // would keep the same controller with its callbacks wiped and navigation
    // would stop writing the URL. The controller holds no timers or listeners of
    // its own — only callback references — so there is nothing to leak; those
    // references are released when the component truly unmounts and it is
    // garbage-collected.

    // The opening story is on screen without anything having been navigated to,
    // so nothing has announced it yet. Reported here rather than at creation
    // time because the controller is built while rendering, and a consumer's
    // handler is free to write state from this.
    storiesCtrl.reportInitialView();

    startOrDeferTimer(
      groups[storiesCtrl.state.activeGroupIndex.value]?.stories[
        storiesCtrl.state.activeStoryIndex.value
      ],
    );

    if (apiRef) {
      apiRef.current = {
        nextStory: () => storiesCtrl.nextStory(),
        prevStory: () => storiesCtrl.prevStory(),
        nextGroup: () => storiesCtrl.nextGroup(),
        prevGroup: () => storiesCtrl.prevGroup(),
        goToGroup: storiesCtrl.goToGroup,
        pause: storiesCtrl.pause,
        resume: storiesCtrl.resume,
      };
      disposables.push(() => {
        apiRef.current = null;
      });
    }

    return disposables.dispose;
  }, []);

  useEffect(() => {
    if (!enableKeyboard) return;
    return observeDomEvent(window, 'keydown', (e) => {
      if (e.key === 'Escape') onClose();
    });
  }, [enableKeyboard, onClose]);

  const overlay = (
    <div
      ref={overlayRef}
      className="rk-stories-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? 'Stories player'}
      tabIndex={-1}
    >
      <SwipeToClose
        direction="down"
        onClose={onClose}
        className="rk-stories-swipe-wrapper"
      >
        {renderNavigation ? (
          renderNavigation({
            onPrevStory: () => storiesCtrl.prevStory(),
            onNextStory: () => storiesCtrl.nextStory(),
            onPrevGroup: () => storiesCtrl.prevGroup(),
            onNextGroup: () => storiesCtrl.nextGroup(),
          })
        ) : (
          <NavButton
            onClick={() => storiesCtrl.prevStory()}
            onLongPress={() => storiesCtrl.prevGroup()}
            aria-label="Previous story"
          >
            <ChevronLeft size={28} />
          </NavButton>
        )}
        <div
          className="rk-stories-container"
          onContextMenu={(e) => e.preventDefault()}
        >
          <Observe signals={[sizeSignal, carouselActive]}>
            {() => (
              <Reel
                count={groups.length}
                size={sizeSignal.value}
                direction="horizontal"
                transition={
                  carouselActive.value ? slideTransition : groupTransition
                }
                enableGestures
                enableNavKeys={enableKeyboard}
                onNavKeyPress={(increment) => {
                  if (increment === -1) storiesCtrl.prevStory();
                  else storiesCtrl.nextStory();
                }}
                initialIndex={initialGroupIndex}
                apiRef={outerReelRef}
                afterChange={handleOuterAfterChange}
                onSlideDragStart={handleOuterDragStart}
                onSlideDragEnd={handleOuterDragEnd}
                onSlideDragCanceled={handleOuterDragEnd}
                onTap={handleTap}
                onDoubleTap={handleDoubleTap}
                onLongPress={handleLongPressStart}
                onLongPressEnd={handleLongPressEnd}
                itemBuilder={(groupIndex, _, itemSize) => {
                  const group = groups[groupIndex];
                  if (!group) return null;
                  const isActiveGroup =
                    activeGroupIndexRef.current === groupIndex;

                  return (
                    <div
                      className="rk-stories-slide-wrapper"
                      style={{
                        width: itemSize[0],
                        height: itemSize[1],
                      }}
                    >
                      <Reel
                        count={group.stories.length}
                        size={itemSize}
                        direction="horizontal"
                        transition={fadeTransition}
                        enableGestures={false}
                        enableNavKeys={false}
                        transitionDuration={innerTransitionDuration}
                        initialIndex={storiesCtrl.getLastStoryIndex(groupIndex)}
                        apiRef={(api) => {
                          innerReelRefs.current.set(groupIndex, api);
                        }}
                        itemBuilder={(storyIndex, __, storySize) => {
                          const story = group.stories[storyIndex] as T;
                          if (!story) return null;
                          const isActive =
                            isActiveGroup &&
                            activeStoryIndexRef.current === storyIndex;

                          return (
                            <div
                              className="rk-stories-story"
                              style={{
                                width: storySize[0],
                                height: storySize[1],
                              }}
                            >
                              {propsRef.current.renderSlide ? (
                                propsRef.current.renderSlide({
                                  story,
                                  index: storyIndex,
                                  groupIndex,
                                  isActive,
                                  size: storySize,
                                  activeGroupIndex:
                                    storiesCtrl.state.activeGroupIndex,
                                  activeStoryIndex:
                                    storiesCtrl.state.activeStoryIndex,
                                  onDurationReady: (ms) =>
                                    handleDurationReady(
                                      groupIndex,
                                      storyIndex,
                                      ms,
                                    ),
                                  onReady: () =>
                                    handleContentReady(groupIndex, storyIndex),
                                  onWaiting: () =>
                                    handleVideoWaiting(groupIndex, storyIndex),
                                  onError: () =>
                                    handleContentError(groupIndex, storyIndex),
                                  onEnded: handleVideoEnded,
                                })
                              ) : story.mediaType === 'video' ? (
                                <VideoStorySlide
                                  src={story.src}
                                  poster={story.poster}
                                  groupIndex={groupIndex}
                                  storyIndex={storyIndex}
                                  activeGroupIndex={
                                    storiesCtrl.state.activeGroupIndex
                                  }
                                  activeStoryIndex={
                                    storiesCtrl.state.activeStoryIndex
                                  }
                                  onDurationReady={(ms) =>
                                    handleDurationReady(
                                      groupIndex,
                                      storyIndex,
                                      ms,
                                    )
                                  }
                                  onPlaying={() =>
                                    handleContentReady(groupIndex, storyIndex)
                                  }
                                  onWaiting={() =>
                                    handleVideoWaiting(groupIndex, storyIndex)
                                  }
                                  onEnded={handleVideoEnded}
                                  onError={() =>
                                    handleContentError(groupIndex, storyIndex)
                                  }
                                />
                              ) : (
                                <ImageStorySlide
                                  src={story.src}
                                  aspectRatio={story.aspectRatio}
                                  onLoad={() =>
                                    handleContentReady(groupIndex, storyIndex)
                                  }
                                  onError={() =>
                                    handleContentError(groupIndex, storyIndex)
                                  }
                                />
                              )}

                              <Observe
                                signals={[
                                  loadingCtrl.isLoading,
                                  loadingCtrl.isError,
                                  storiesCtrl.state.activeGroupIndex,
                                  storiesCtrl.state.activeStoryIndex,
                                ]}
                              >
                                {() => {
                                  if (
                                    storiesCtrl.state.activeGroupIndex.value !==
                                      groupIndex ||
                                    storiesCtrl.state.activeStoryIndex.value !==
                                      storyIndex
                                  )
                                    return null;

                                  if (loadingCtrl.isError.value) {
                                    return propsRef.current.renderError ? (
                                      <>
                                        {propsRef.current.renderError({
                                          story,
                                          storyIndex,
                                          groupIndex,
                                        })}
                                      </>
                                    ) : (
                                      <div
                                        className="rk-stories-error"
                                        role="img"
                                        aria-label="Content unavailable"
                                      >
                                        <ImageOff
                                          size={48}
                                          strokeWidth={1.5}
                                          aria-hidden="true"
                                        />
                                        <span className="rk-stories-error-text">
                                          Content unavailable
                                        </span>
                                      </div>
                                    );
                                  }

                                  if (
                                    loadingCtrl.isLoading.value &&
                                    propsRef.current.renderLoading
                                  ) {
                                    return (
                                      <>
                                        {propsRef.current.renderLoading({
                                          story,
                                          storyIndex,
                                          groupIndex,
                                        })}
                                      </>
                                    );
                                  }

                                  return null;
                                }}
                              </Observe>
                            </div>
                          );
                        }}
                      />

                      {chromePlacement === 'group' &&
                        renderGroupChrome(groupIndex)}

                      {propsRef.current.renderFooter && (
                        <Observe
                          signals={[
                            storiesCtrl.state.activeGroupIndex,
                            storiesCtrl.state.activeStoryIndex,
                          ]}
                        >
                          {() => {
                            if (
                              storiesCtrl.state.activeGroupIndex.value !==
                              groupIndex
                            )
                              return null;
                            const si = storiesCtrl.state.activeStoryIndex.value;
                            const s = group.stories[si] as T;
                            if (!s) return null;
                            return (
                              <>
                                {propsRef.current.renderFooter!({
                                  author: group.author,
                                  story: s,
                                  storyIndex: si,
                                })}
                              </>
                            );
                          }}
                        </Observe>
                      )}
                    </div>
                  );
                }}
              />
            )}
          </Observe>
          {chromePlacement === 'overlay' && (
            <Observe signals={[longPressSignal]}>
              {() => (
                <div className={uiLayerClassName()}>
                  <Observe signals={[storiesCtrl.state.activeGroupIndex]}>
                    {() =>
                      renderGroupProgressBar(
                        storiesCtrl.state.activeGroupIndex.value,
                        true,
                        storiesCtrl.state.activeStoryIndex,
                        timerCtrl.progress,
                      )
                    }
                  </Observe>

                  <Observe signals={activeHeaderSignals}>
                    {() =>
                      renderGroupHeader(
                        storiesCtrl.state.activeGroupIndex.value,
                        true,
                      )
                    }
                  </Observe>
                </div>
              )}
            </Observe>
          )}

          <Observe signals={[heartsSignal]}>
            {() => (
              <>
                {heartsSignal.value.map((heart) => (
                  <HeartAnimation
                    key={heart.id}
                    onComplete={() => removeHeart(heart.id)}
                  />
                ))}
              </>
            )}
          </Observe>
        </div>

        {renderNavigation ? null : (
          <NavButton
            onClick={() => storiesCtrl.nextStory()}
            onLongPress={() => storiesCtrl.nextGroup()}
            aria-label="Next story"
          >
            <ChevronRight size={28} />
          </NavButton>
        )}
      </SwipeToClose>

      <Observe
        signals={[
          carouselActive,
          sizeSignal,
          slideSignal,
          storiesCtrl.state.activeGroupIndex,
        ]}
      >
        {() =>
          carouselActive.value ? (
            <StoriesCarousel<T>
              groups={groups}
              activeGroupIndex={storiesCtrl.state.activeGroupIndex.value}
              slide={slideSignal.value}
              activeSize={sizeSignal.value}
              storyIndexFor={storiesCtrl.getLastStoryIndex}
              viewedState={viewed?.viewedState}
              renderGroupPreview={renderGroupPreview}
              renderFrame={
                propsRef.current.renderSlide
                  ? (story, groupIndex) =>
                      propsRef.current.renderSlide?.({
                        story,
                        index: storiesCtrl.getLastStoryIndex(groupIndex),
                        groupIndex,
                        isActive: false,
                        size: sizeSignal.value,
                        activeGroupIndex: storiesCtrl.state.activeGroupIndex,
                        activeStoryIndex: storiesCtrl.state.activeStoryIndex,
                        onDurationReady: noop,
                        onReady: noop,
                        onWaiting: noop,
                        onError: noop,
                        onEnded: noop,
                      })
                  : undefined
              }
              onOpen={storiesCtrl.goToGroup}
              onSlideEnd={endSlide}
            />
          ) : null
        }
      </Observe>
    </div>
  );

  return createPortal(overlay, document.body);
}

/**
 * Full-screen, Instagram-style stories player overlay.
 *
 * Renders a portal containing two nested {@link Reel} sliders: an outer
 * horizontal slider with flip transitions for group navigation, and inner
 * horizontal sliders with fade transitions for story-to-story navigation
 * within each group.
 */
export function StoriesOverlay<T extends StoryItem = StoryItem>(
  props: StoriesOverlayProps<T>,
): ReactElement | null {
  useAttachViewedState(props.viewed);

  if (!props.isOpen) return null;

  return (
    <SoundProvider>
      <StoriesContent {...props} />
    </SoundProvider>
  );
}

/**
 * Props for {@link StoriesUrlOverlay}. Every {@link StoriesOverlay} prop except
 * the open-state trio — the URL owns whether the player is open and which group
 * and story it shows, so `isOpen`, `initialGroupIndex`, and `initialStoryIndex`
 * are supplied from the controller, not the caller.
 *
 * @typeParam T - Story item type.
 */
export type StoriesUrlOverlayProps<T extends StoryItem = StoryItem> = Omit<
  StoriesOverlayProps<T>,
  'isOpen' | 'initialGroupIndex' | 'initialStoryIndex' | 'onClose'
> & {
  /**
   * URL-state controller from `useOverlayUrlState`, spread with
   * `urlIndexTwoAxisKey(...)`. Its `position` — a `{ outer, inner }` object, the
   * outer axis being the group and the inner the story within it — drives
   * whether the player is open and where it opens; the overlay writes back
   * through it on every navigation and on close.
   */
  controller: UrlStateController<TwoAxisPosition>;

  /** Called after the player closes. The URL drives closing, not this. */
  onClose?: () => void;
};

/**
 * URL-driven stories player. The address bar owns the open state: the player
 * opens when the parameter names a group and story, and closes when it clears.
 * Prefer a link on each ring as the open action — the href does it with no
 * handler, and the open is then shareable and closed by the back button.
 *
 * The position is a two-axis object, so inner (story-within-group) navigation
 * rides in the URL alongside the outer group: a single history entry covers the
 * whole session and one back step always closes.
 *
 * @typeParam T - Story item type.
 */
export function StoriesUrlOverlay<T extends StoryItem = StoryItem>(
  props: StoriesUrlOverlayProps<T>,
): ReactElement | null {
  const { controller, onClose, onStoryChange, onGroupChange, ...base } = props;

  const latest = useRef({ base, onClose, onStoryChange, onGroupChange });
  latest.current = { base, onClose, onStoryChange, onGroupChange };

  useAttachViewedState(base.viewed);

  return (
    <Observe signals={[controller.position]}>
      {() => {
        const position = controller.position.value;
        if (position === null) return null;

        return (
          <SoundProvider>
            <StoriesContent<T>
              {...(latest.current.base as StoriesOverlayProps<T>)}
              initialGroupIndex={position.outer}
              initialStoryIndex={position.inner}
              onClose={() => {
                controller.set(null);
                latest.current.onClose?.();
              }}
              onStoryChange={(groupIndex, storyIndex) => {
                controller.set({ outer: groupIndex, inner: storyIndex });
                latest.current.onStoryChange?.(groupIndex, storyIndex);
              }}
              onGroupChange={(groupIndex) => {
                latest.current.onGroupChange?.(groupIndex);
              }}
            />
          </SoundProvider>
        );
      }}
    </Observe>
  );
}
