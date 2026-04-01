/* eslint-disable react-hooks/exhaustive-deps */
import { type ReactElement, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  createSignal,
  createDisposableList,
  createContentPreloader,
  createContentLoadingController,
  reaction,
  observeDomEvent,
  Reel,
  Observe,
  noop,
  useBodyLock,
  SoundProvider,
  useSoundState,
  cubeTransition,
  fadeTransition,
  type ReelApi,
} from '@reelkit/react';
import {
  createStoriesController,
  createTimerController,
  getTapAction,
  type StoryItem,
  type StoriesGroup,
} from '@reelkit/stories-core';
import { ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';
import type { StoriesOverlayProps } from './types';
import { CanvasProgressBar } from './CanvasProgressBar';
import { StoryHeader } from './StoryHeader';
import { ImageStorySlide } from './ImageStorySlide';
import { VideoStorySlide, shared as sharedVideo } from './VideoStorySlide';
import { SwipeToClose, type GestureCommonEvent } from '@reelkit/react';
import { HeartAnimation } from './HeartAnimation';
import './StoriesOverlay.css';

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
}: StoriesOverlayProps<T>) {
  const outerReelRef = useRef<ReelApi>(null);
  const innerReelRefs = useRef<Map<number, ReelApi>>(new Map());
  const activeGroupIndexRef = useRef(initialGroupIndex);
  const activeStoryIndexRef = useRef(initialStoryIndex);

  // Stable refs for callbacks to avoid stale closures
  const propsRef = useRef({
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
      {
        onStoryChange,
        onGroupChange,
        onStoryViewed,
        onStoryComplete,
        onClose,
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

  useBodyLock(true);

  useEffect(() => {
    const disposables = createDisposableList();

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
      storiesCtrl.dispose,
    );

    startOrDeferTimer(groups[initialGroupIndex]?.stories[initialStoryIndex]);

    if (apiRef) {
      apiRef.current = {
        nextStory: storiesCtrl.nextStory,
        prevStory: storiesCtrl.prevStory,
        nextGroup: storiesCtrl.nextGroup,
        prevGroup: storiesCtrl.prevGroup,
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
      else if (e.key === 'ArrowLeft') storiesCtrl.prevStory();
      else if (e.key === 'ArrowRight') storiesCtrl.nextStory();
    });
  }, [enableKeyboard, onClose]);

  const overlay = (
    <div className="rk-stories-overlay">
      <SwipeToClose
        direction="down"
        onClose={onClose}
        className="rk-stories-swipe-wrapper"
      >
        {renderNavigation ? (
          renderNavigation({
            onPrevStory: storiesCtrl.prevStory,
            onNextStory: storiesCtrl.nextStory,
            onPrevGroup: storiesCtrl.prevGroup,
            onNextGroup: storiesCtrl.nextGroup,
          })
        ) : (
          <NavButton
            onClick={storiesCtrl.prevStory}
            onLongPress={storiesCtrl.prevGroup}
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
                useNavKeys={false}
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
                        useNavKeys={false}
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
                              style={{
                                width: storySize[0],
                                height: storySize[1],
                                position: 'relative',
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
                  className="rk-stories-ui-layer"
                  style={{ opacity: uiHidden ? 0 : 1 }}
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
            onClick={storiesCtrl.nextStory}
            onLongPress={storiesCtrl.nextGroup}
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
