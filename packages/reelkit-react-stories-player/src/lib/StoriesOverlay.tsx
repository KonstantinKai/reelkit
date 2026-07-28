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
  type ReelApi,
  type UrlStateController,
  type TwoAxisPosition,
  type TransitionTransformFn,
} from '@reelkit/react';
import {
  createStoriesController,
  createTimerController,
  getTapAction,
  type StoryItem,
  type StoriesGroup,
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
} from './types';
import { CanvasProgressBar } from './CanvasProgressBar';
import { StoryHeader } from './StoryHeader';
import { ImageStorySlide } from './ImageStorySlide';
import { VideoStorySlide, shared as sharedVideo } from './VideoStorySlide';
import { SwipeToClose, type GestureCommonEvent } from '@reelkit/react';
import { HeartAnimation } from './HeartAnimation';
import './StoriesOverlay.css';

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
   * Zero-based index of the initially visible story within the group.
   * @default 0
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
   * Whether to hide story UI (header, footer) when paused via long press.
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

const getSize = (): [number, number] => {
  if (typeof window === 'undefined') return [0, 0];
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (vw < 768) return [vw, vh];
  const maxH = vh - 40;
  const maxW = Math.min(vw * 0.35, 480);
  const height = Math.min(maxW / (9 / 16), maxH);
  const width = height * (9 / 16);
  return [width, height];
};

function StoriesContent<T extends StoryItem = StoryItem>({
  onClose,
  ariaLabel,
  groups,
  initialGroupIndex = 0,
  initialStoryIndex = 0,
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
  apiRef,
}: Omit<StoriesOverlayProps<T>, 'isOpen'>) {
  const outerReelRef = useRef<ReelApi>(null);
  const innerReelRefs = useRef<Map<number, ReelApi>>(new Map());
  const activeGroupIndexRef = useRef(initialGroupIndex);
  const activeStoryIndexRef = useRef(initialStoryIndex);

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
    renderFooter,
    renderSlide,
    renderLoading,
    renderError,
    tapZoneSplit,
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
    renderFooter,
    renderSlide,
    renderLoading,
    renderError,
    tapZoneSplit,
  };

  const heartIdRef = useRef(0);

  const {
    storiesCtrl,
    timerCtrl,
    sizeSignal,
    heartsSignal,
    longPressSignal,
    loadingCtrl,
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
    const storiesCtrl = createStoriesController(
      {
        groupCount: groups.length,
        storyCounts: groups.map((g) => g.stories.length),
        initialGroupIndex,
        initialStoryIndex,
        defaultImageDuration,
      },
      // Read callbacks off the ref at fire time, never off this closure. The
      // controller is built once and outlives every prop update, so a callback
      // captured here would freeze to the render that created it; reading the
      // ref means a later prop carrying a different callback is still honored on
      // the next fire.
      {
        onStoryChange: (groupIndex, storyIndex) =>
          propsRef.current.onStoryChange?.(groupIndex, storyIndex),
        onGroupChange: (groupIndex) =>
          propsRef.current.onGroupChange?.(groupIndex),
        onStoryViewed: (groupIndex, storyIndex) =>
          propsRef.current.onStoryViewed?.(groupIndex, storyIndex),
        onStoryComplete: (groupIndex, storyIndex) =>
          propsRef.current.onStoryComplete?.(groupIndex, storyIndex),
        onClose: () => propsRef.current.onClose(),
      },
    );

    const timerCtrl = createTimerController({
      duration: defaultImageDuration,
      onComplete: () => storiesCtrl.onStoryTimerComplete(),
    });

    const sizeSignal = createSignal<[number, number]>(getSize());
    const heartsSignal = createSignal<{ id: number }[]>([]);
    const longPressSignal = createSignal(false);
    const loadingCtrl = createContentLoadingController();
    const knownDurations = new Map<string, number>();

    const getDuration = (story: StoryItem | undefined): number => {
      if (!story) return defaultImageDuration;
      if (story.duration) return story.duration;
      return knownDurations.get(story.src) ?? defaultImageDuration;
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
          timerCtrl.start(getDuration(story));
        } else {
          loadingCtrl.isLoading.value = true;
        }
      } else if (story?.mediaType === 'video' && story.src) {
        loadingCtrl.isLoading.value = true;
      } else {
        loadingCtrl.isLoading.value = false;
        timerCtrl.start(story?.duration ?? defaultImageDuration);
      }
    };

    return {
      storiesCtrl,
      timerCtrl,
      sizeSignal,
      heartsSignal,
      longPressSignal,
      loadingCtrl,
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
        if (groups[gi]?.stories[si]?.mediaType === 'video') {
          sharedVideo.getVideo().pause();
        }
      },
      handleOuterDragEnd() {
        if (!storiesCtrl.state.isPaused.value) {
          timerCtrl.resume();
          const gi = storiesCtrl.state.activeGroupIndex.value;
          const si = storiesCtrl.state.activeStoryIndex.value;
          if (groups[gi]?.stories[si]?.mediaType === 'video') {
            sharedVideo.getVideo().play().catch(noop);
          }
        }
      },
      handleOuterAfterChange(index: number) {
        // Guard: the activeGroupIndex reaction calls outerReel.goTo()
        // which triggers another afterChange → re-entry. Skip if
        // already at the target group.
        if (storiesCtrl.state.activeGroupIndex.value === index) return;

        const prevSi = storiesCtrl.state.activeStoryIndex.value;
        timerCtrl.reset();
        storiesCtrl.goToGroup(index);
        const si = storiesCtrl.state.activeStoryIndex.value;
        // If activeStoryIndex didn't change, the reaction won't fire — handle here
        if (si === prevSi) {
          startOrDeferTimer(groups[index]?.stories[si]);
        }
      },
      handleContentReady(groupIndex: number, storyIndex: number) {
        const story = groups[groupIndex]?.stories[storyIndex];
        if (story?.src) preloader.markLoaded(story.src);

        if (
          groupIndex === storiesCtrl.state.activeGroupIndex.value &&
          storyIndex === storiesCtrl.state.activeStoryIndex.value
        ) {
          loadingCtrl.isLoading.value = false;
          if (timerCtrl.progress.value > 0) {
            timerCtrl.resume();
          } else {
            timerCtrl.start(getDuration(story));
          }
        }
      },
      handleVideoWaiting(groupIndex: number, storyIndex: number) {
        if (
          groupIndex === storiesCtrl.state.activeGroupIndex.value &&
          storyIndex === storiesCtrl.state.activeStoryIndex.value
        ) {
          loadingCtrl.isLoading.value = true;
          timerCtrl.pause();
        }
      },
      handleDurationReady(groupIndex: number, storyIndex: number, ms: number) {
        const story = groups[groupIndex]?.stories[storyIndex];
        if (story?.src) knownDurations.set(story.src, ms);
        if (
          groupIndex === storiesCtrl.state.activeGroupIndex.value &&
          storyIndex === storiesCtrl.state.activeStoryIndex.value
        ) {
          timerCtrl.start(ms);
        }
      },
      handleVideoEnded() {
        storiesCtrl.onStoryTimerComplete();
      },
      handleContentError(groupIndex: number, storyIndex: number) {
        const story = groups[groupIndex]?.stories[storyIndex];
        if (story?.src) preloader.markErrored(story.src);

        if (
          groupIndex === storiesCtrl.state.activeGroupIndex.value &&
          storyIndex === storiesCtrl.state.activeStoryIndex.value
        ) {
          loadingCtrl.isLoading.value = false;
          loadingCtrl.isError.value = true;
          timerCtrl.pause();
        }
      },
      removeHeart(id: number) {
        heartsSignal.value = heartsSignal.value.filter((h) => h.id !== id);
      },
    };
  })[0];

  const soundState = useSoundState();
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useBodyLock(true);

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
      reaction(
        () => [storiesCtrl.state.activeGroupIndex],
        () => {
          const gi = storiesCtrl.state.activeGroupIndex.value;
          activeGroupIndexRef.current = gi;
          outerReelRef.current?.goTo(gi, true);
        },
      ),
      reaction(
        () => [storiesCtrl.state.activeStoryIndex],
        () => {
          if (storiesCtrl.state.isPaused.value) {
            storiesCtrl.resume();
          }
          timerCtrl.reset();

          const si = storiesCtrl.state.activeStoryIndex.value;
          const gi = storiesCtrl.state.activeGroupIndex.value;
          activeStoryIndexRef.current = si;
          innerReelRefs.current.get(gi)?.goTo(si, true);

          startOrDeferTimer(groups[gi]?.stories[si]);
        },
      ),
      reaction(
        () => [storiesCtrl.state.isPaused],
        () => {
          const gi = storiesCtrl.state.activeGroupIndex.value;
          const si = storiesCtrl.state.activeStoryIndex.value;
          const isVideo = groups[gi]?.stories[si]?.mediaType === 'video';

          if (storiesCtrl.state.isPaused.value) {
            timerCtrl.pause();
            if (isVideo) sharedVideo.getVideo().pause();
          } else {
            timerCtrl.resume();
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
          const group = groups[gi];
          if (!group) return;

          const nextStory = group.stories[si + 1];
          if (nextStory)
            preloader.preload(
              nextStory.src,
              nextStory.mediaType as 'image' | 'video',
            );

          const nextGroup = groups[gi + 1];
          if (nextGroup?.stories[0]) {
            preloader.preload(
              nextGroup.stories[0].src,
              nextGroup.stories[0].mediaType as 'image' | 'video',
            );
          }
        },
      ),
      observeDomEvent(window, 'resize', () => {
        sizeSignal.value = getSize();
        outerReelRef.current?.adjust();
      }),
      timerCtrl.dispose,
    );

    // Do NOT dispose `storiesCtrl` here. It is created once for the component's
    // lifetime (in `useState`) and survives a mount/unmount/remount, but this
    // effect's cleanup runs on every such cycle — React re-runs cleanups, and in
    // development StrictMode deliberately mounts, unmounts, then remounts. Its
    // `dispose()` clears the event callbacks for good, so the remounted overlay
    // would keep the same controller with its callbacks wiped and navigation
    // would stop writing the URL. The controller holds no timers or listeners of
    // its own — only callback references — so there is nothing to leak; those
    // references are released when the component truly unmounts and it is
    // garbage-collected.

    startOrDeferTimer(groups[initialGroupIndex]?.stories[initialStoryIndex]);

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
    return observeDomEvent(window, 'keydown', (e) => {
      if (e.key === 'Escape') onClose();
    });
  }, [onClose]);

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
          <Observe signals={[sizeSignal]}>
            {() => (
              <Reel
                count={groups.length}
                size={sizeSignal.value}
                direction="horizontal"
                transition={groupTransition}
                enableGestures
                enableNavKeys
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
          <Observe signals={[longPressSignal]}>
            {() => {
              const uiHidden = hideUIOnPause && longPressSignal.value;

              return (
                <div
                  className={`rk-stories-ui-layer ${uiHidden ? 'rk-stories-ui-layer--hidden' : ''}`}
                >
                  <Observe signals={[storiesCtrl.state.activeGroupIndex]}>
                    {() => {
                      const group =
                        groups[storiesCtrl.state.activeGroupIndex.value];
                      if (!group) return null;

                      if (renderProgressBar) {
                        return (
                          <>
                            {renderProgressBar({
                              totalStories: group.stories.length,
                              activeIndex: storiesCtrl.state.activeStoryIndex,
                              progress: timerCtrl.progress,
                              group: group as StoriesGroup<T>,
                            })}
                          </>
                        );
                      }

                      return (
                        <CanvasProgressBar
                          totalStories={group.stories.length}
                          activeIndex={storiesCtrl.state.activeStoryIndex}
                          progress={timerCtrl.progress}
                          minSegmentWidth={minSegmentWidth}
                        />
                      );
                    }}
                  </Observe>

                  <Observe
                    signals={[
                      storiesCtrl.state.activeGroupIndex,
                      storiesCtrl.state.activeStoryIndex,
                      storiesCtrl.state.isPaused,
                      soundState.muted,
                      loadingCtrl.isLoading,
                      loadingCtrl.isError,
                    ]}
                  >
                    {() => {
                      const gi = storiesCtrl.state.activeGroupIndex.value;
                      const si = storiesCtrl.state.activeStoryIndex.value;
                      const isPaused = storiesCtrl.state.isPaused.value;
                      const isMuted = soundState.muted.value;
                      const isContentLoading = loadingCtrl.isLoading.value;
                      const isContentError = loadingCtrl.isError.value;
                      const group = groups[gi];
                      if (!group) return null;
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
                    }}
                  </Observe>
                </div>
              );
            }}
          </Observe>

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
