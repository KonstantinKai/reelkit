/* eslint-disable react-hooks/exhaustive-deps */
import React, { type ReactNode, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronUp, ChevronDown, ImageOff } from 'lucide-react';
import {
  noop,
  createSignal,
  createContentLoadingController,
  createContentPreloader,
  createDisposableList,
  reaction,
  observeDomEvent,
  captureFocusForReturn,
  createFocusTrap,
  Reel,
  Observe,
  type ReelApi,
  type ReelProps,
  SoundProvider,
  useSoundState,
} from '@reelkit/react';
import { useBodyLock } from '@reelkit/react';
import type {
  BaseContentItem,
  ContentItem,
  ControlsRenderProps,
  NavigationRenderProps,
  NestedSlideRenderProps,
  SlideRenderProps,
} from './types';
import MediaSlide from './MediaSlide';
import { captureFrame } from '@reelkit/react';
import PlayerControls from './PlayerControls';
import SlideOverlay from './SlideOverlay';
import { shared as sharedVideo } from './VideoSlide';
import './ReelPlayerOverlay.css';

/**
 * Subset of {@link ReelProps} that are forwarded to the underlying `Reel`
 * component. These control the slider's transition, gesture, and
 * navigation behavior.
 */
export type ReelProxyProps = Pick<
  ReelProps,
  | 'transitionDuration'
  | 'swipeDistanceFactor'
  | 'loop'
  | 'enableNavKeys'
  | 'enableWheel'
  | 'wheelDebounceMs'
>;

/**
 * Props for the {@link ReelPlayerOverlay} component.
 *
 * Generic over `T` — pass any type extending {@link BaseContentItem} to use
 * custom data. Defaults to {@link ContentItem} for backward compatibility.
 *
 * @typeParam T - Content item type. Must have `id` and `media` fields at minimum.
 */
export interface ReelPlayerOverlayProps<T extends BaseContentItem = ContentItem>
  extends ReelProxyProps {
  /**
   * Aspect ratio (width / height) for the player container on desktop.
   * On mobile (< 768px viewport), the player always uses full viewport.
   *
   * @default 0.5625 (9:16)
   * @example
   * ```tsx
   * // Standard 9:16 (default)
   * <ReelPlayerOverlay aspectRatio={9 / 16} ... />
   *
   * // Wider 3:4
   * <ReelPlayerOverlay aspectRatio={3 / 4} ... />
   * ```
   */
  aspectRatio?: number;

  /** When `true`, the overlay is rendered and body scroll is locked. */
  isOpen: boolean;

  /**
   * Accessible label for the dialog region. Announced by screen readers
   * when the overlay opens.
   *
   * @default 'Video player'
   */
  ariaLabel?: string;

  /** Array of content items to display as vertical slides. */
  content: T[];

  /** Zero-based index of the initially visible slide. Defaults to `0`. */
  initialIndex?: number;

  /**
   * Ref to access the Reel API
   */
  apiRef?: React.MutableRefObject<ReelApi | null>;

  /**
   * Callback fired after slide change
   */
  onSlideChange?: (index: number) => void;

  /** Callback to close the overlay. Triggered by close button or Escape key. */
  onClose: () => void;

  /**
   * Custom overlay on top of each slide. Replaces default SlideOverlay.
   * Return `null` to hide the overlay entirely.
   */
  renderSlideOverlay?: (item: T, index: number, isActive: boolean) => ReactNode;

  /**
   * Custom full slide renderer. Receives all props needed to render
   * `VideoSlide`, `ImageSlide`, or `NestedSlider` (multi-media) with
   * proper playback and drag coordination.
   *
   * Return `null` to fall back to the default MediaSlide + overlay.
   * Use `props.defaultContent` to wrap the default rendering with your
   * own additions.
   */
  renderSlide?: (props: SlideRenderProps<T>) => ReactNode | null;

  /**
   * Custom controls. Replaces default PlayerControls.
   */
  renderControls?: (props: ControlsRenderProps<T>) => ReactNode;

  /**
   * Custom navigation arrows. Replaces default ChevronUp/Down.
   */
  renderNavigation?: (props: NavigationRenderProps) => ReactNode;

  /**
   * Custom navigation for the nested horizontal slider (multi-media posts).
   * Replaces default ChevronLeft/Right arrows inside nested slides.
   */
  renderNestedNavigation?: (props: NavigationRenderProps) => ReactNode;

  /**
   * Custom slide renderer for nested horizontal slider items (multi-media posts).
   * Use `props.defaultContent` to wrap the default ImageSlide/VideoSlide with your own styles.
   */
  renderNestedSlide?: (props: NestedSlideRenderProps) => ReactNode;

  /** Custom loading indicator. Replaces default wave loader. */
  renderLoading?: (props: { item: T; activeIndex: number }) => ReactNode;

  /** Custom error indicator. Replaces default error icon. */
  renderError?: (props: { item: T; activeIndex: number }) => ReactNode;
}

const _kDefaultAspectRatio = 9 / 16;
const _kMobileBreakpoint = 768;
const _kPreloadRange = 2;

const preloader = createContentPreloader({ maxCacheSize: 1000 });

/**
 * Inner content of the player overlay. Renders the `Reel` slider, controls,
 * navigation arrows, and manages video/sound/resize lifecycle.
 *
 * Must be rendered inside a {@link SoundProvider}.
 * @internal
 */
function ReelPlayerContent<T extends BaseContentItem = ContentItem>(
  props: ReelPlayerOverlayProps<T>,
) {
  const { initialIndex = 0, apiRef } = props;

  const propsRef = useRef(props);
  propsRef.current = props;

  const internalSliderRef = useRef<ReelApi>(null);
  const sliderRef = apiRef ?? internalSliderRef;
  const innerSliderRef = useRef<ReelApi>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoPausedOnDragRef = useRef(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const soundState = useSoundState();

  const [
    {
      sizeSignal,
      loadingCtrl,
      indexSignal,
      innerMediaTypeSignal,
      getSize,
      handleBeforeChange,
      handleAfterChange,
      handleSlideDragStart,
      handleSlideDragEnd,
      handleSlideDragCanceled,
      handlePrev,
      handleNext,
      itemBuilder,
    },
  ] = useState(() => {
    const getSize = (): [number, number] => {
      if (typeof window === 'undefined') return [0, 0];
      const ratio = propsRef.current.aspectRatio ?? _kDefaultAspectRatio;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      if (windowWidth < _kMobileBreakpoint) {
        return [windowWidth, windowHeight];
      }

      let width = windowHeight * ratio;
      let height = windowHeight;

      if (width > windowWidth) {
        width = windowWidth;
        height = windowWidth / ratio;
      }

      return [width, height];
    };

    const sizeSignal = createSignal<[number, number]>(getSize());
    const loadingCtrl = createContentLoadingController(true, initialIndex);
    const indexSignal = createSignal(initialIndex);
    const innerMediaTypeSignal = createSignal<'image' | 'video' | null>(null);

    const hasVideoContent = (index: number): boolean => {
      const item = propsRef.current.content[index];
      return item?.media.some((m) => m.type === 'video') ?? false;
    };

    const handleVideoRef = (ref: HTMLVideoElement | null) => {
      videoRef.current = ref;
    };

    const handleActiveMediaTypeChange = (type: 'image' | 'video') => {
      innerMediaTypeSignal.value = type;
    };

    const overlayNode = (item: T, index: number, isActive: boolean) => {
      const { renderSlideOverlay } = propsRef.current;
      if (renderSlideOverlay) {
        return renderSlideOverlay(item, index, isActive);
      }
      const record = item as Record<string, unknown>;
      const author =
        'author' in item
          ? (record['author'] as { name: string; avatar: string } | undefined)
          : undefined;
      const description =
        'description' in item
          ? (record['description'] as string | undefined)
          : undefined;
      const likes =
        'likes' in item ? (record['likes'] as number | undefined) : undefined;
      return (
        <SlideOverlay author={author} description={description} likes={likes} />
      );
    };

    return {
      sizeSignal,
      loadingCtrl,
      indexSignal,
      innerMediaTypeSignal,
      getSize,
      handleVideoRef,
      handleActiveMediaTypeChange,
      handleBeforeChange: () => {
        soundState.disabled.value = true;
        if (videoRef.current) {
          videoRef.current.pause();
          const key = videoRef.current.dataset['slideKey'];
          const frame = captureFrame(videoRef.current);
          if (key && frame) {
            sharedVideo.capturedFrames.set(key, frame);
          }
        }
      },
      handleAfterChange: (index: number) => {
        loadingCtrl.setActiveIndex(index);
        const src = propsRef.current.content[index]?.media[0]?.src;
        if (src && preloader.isErrored(src)) {
          loadingCtrl.onError(index);
        } else if (src && preloader.isLoaded(src)) {
          loadingCtrl.onReady(index);
        }
        innerMediaTypeSignal.value = null;
        if (hasVideoContent(index)) {
          soundState.disabled.value = false;
        }
        indexSignal.value = index;
        propsRef.current.onSlideChange?.(index);
      },
      handleSlideDragStart: () => {
        innerSliderRef.current?.unobserve();
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          videoPausedOnDragRef.current = true;
        }
      },
      handleSlideDragEnd: () => {
        innerSliderRef.current?.observe();
      },
      handleSlideDragCanceled: () => {
        if (videoPausedOnDragRef.current && videoRef.current) {
          videoRef.current.play().catch(noop);
        }
        videoPausedOnDragRef.current = false;
      },
      handlePrev: () => {
        sliderRef.current?.prev();
      },
      handleNext: () => {
        sliderRef.current?.next();
      },
      itemBuilder: (
        index: number,
        _indexInRange: number,
        itemSize: [number, number],
      ) => {
        const {
          content: items,
          renderSlide: render,
          renderNestedNavigation: nestedNav,
          renderNestedSlide: nestedSlide,
          enableWheel: wheel = true,
        } = propsRef.current;
        const item = items[index] as T;
        const isActive = index === indexSignal.value;
        const onReady = () => {
          loadingCtrl.onReady(index);
          const src = item.media[0]?.src;
          if (src) preloader.markLoaded(src);
        };
        const onWaiting = () => loadingCtrl.onWaiting(index);
        const onError = () => {
          const src = item.media[0]?.src;
          if (src) preloader.markErrored(src);
          loadingCtrl.onError(index);
        };

        const defaultContent = (
          <>
            <MediaSlide
              content={item}
              isActive={isActive}
              size={itemSize}
              innerSliderRef={innerSliderRef}
              enableWheel={wheel}
              onVideoRef={isActive ? handleVideoRef : undefined}
              onReady={onReady}
              onWaiting={onWaiting}
              onError={onError}
              onActiveMediaTypeChange={
                isActive ? handleActiveMediaTypeChange : undefined
              }
              renderNestedNavigation={nestedNav}
              renderNestedSlide={nestedSlide}
            />
            {overlayNode(item, index, isActive)}
          </>
        );

        if (render) {
          const custom = render({
            item,
            index,
            size: itemSize,
            isActive,
            slideKey: item.id,
            onVideoRef: isActive ? handleVideoRef : undefined,
            innerSliderRef,
            onActiveMediaTypeChange: isActive
              ? handleActiveMediaTypeChange
              : undefined,
            renderNestedNavigation: nestedNav,
            enableWheel: wheel,
            defaultContent,
            onReady,
            onWaiting,
            onError,
          });
          if (custom !== null) {
            return (
              <div
                className="rk-reel-slide-wrapper"
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${index + 1} of ${items.length}`}
                style={{
                  width: itemSize[0],
                  height: itemSize[1],
                  position: 'relative',
                }}
              >
                {custom}
              </div>
            );
          }
        }

        return (
          <div
            className="rk-reel-slide-wrapper"
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${index + 1} of ${items.length}`}
            style={{
              width: itemSize[0],
              height: itemSize[1],
              position: 'relative',
            }}
          >
            {defaultContent}
          </div>
        );
      },
    };
  });

  useBodyLock(true);

  useEffect(() => {
    const disposables = createDisposableList();

    disposables.push(captureFocusForReturn());
    const overlayEl = overlayRef.current;
    if (overlayEl) {
      overlayEl.focus({ preventScroll: true });
      disposables.push(createFocusTrap(overlayEl));
    }

    const preloadNeighbors = () => {
      const items = propsRef.current.content;
      const idx = indexSignal.value;
      const start = idx - _kPreloadRange < 0 ? 0 : idx - _kPreloadRange;
      const end =
        idx + _kPreloadRange > items.length - 1
          ? items.length - 1
          : idx + _kPreloadRange;
      for (let i = start; i <= end; i++) {
        if (i === idx) continue;
        for (const m of items[i].media) {
          if (m.type === 'video') {
            if (m.poster) preloader.preload(m.poster, 'image');
          } else {
            preloader.preload(m.src, 'image');
          }
        }
      }
    };

    disposables.push(
      observeDomEvent(window, 'resize', () => {
        sizeSignal.value = getSize();
        sliderRef.current?.adjust();
      }),
      observeDomEvent(window, 'keydown', (e) => {
        if (e.key === 'Escape') {
          propsRef.current.onClose();
        }
      }),
      reaction(() => [indexSignal], preloadNeighbors),
    );

    preloadNeighbors();

    const initialIdx = indexSignal.value;
    const initialSrc = propsRef.current.content[initialIdx]?.media[0]?.src;
    if (initialSrc) {
      disposables.push(
        preloader.onLoaded(initialSrc, () => loadingCtrl.onReady(initialIdx)),
      );
    }

    return disposables.dispose;
  }, []);

  return createPortal(
    <div
      ref={overlayRef}
      className="rk-reel-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={props.ariaLabel ?? 'Video player'}
      tabIndex={-1}
    >
      <div className="rk-reel-container">
        <Observe signals={[sizeSignal]}>
          {() => {
            const {
              content: items,
              loop: loopProp = false,
              enableNavKeys: navKeys = true,
              enableWheel: wheel = true,
              wheelDebounceMs: wheelMs,
              transitionDuration: duration,
              swipeDistanceFactor: swipeFactor,
              initialIndex: startIndex = 0,
            } = propsRef.current;
            return (
              <Reel
                count={items.length}
                size={sizeSignal.value}
                direction="vertical"
                loop={loopProp}
                enableNavKeys={navKeys}
                enableWheel={wheel}
                wheelDebounceMs={wheelMs}
                transitionDuration={duration}
                swipeDistanceFactor={swipeFactor}
                initialIndex={startIndex}
                apiRef={sliderRef}
                beforeChange={handleBeforeChange}
                afterChange={handleAfterChange}
                onSlideDragStart={handleSlideDragStart}
                onSlideDragEnd={handleSlideDragEnd}
                onSlideDragCanceled={handleSlideDragCanceled}
                itemBuilder={itemBuilder}
              />
            );
          }}
        </Observe>

        <Observe
          signals={[loadingCtrl.isLoading, loadingCtrl.isError, indexSignal]}
        >
          {() => {
            const idx = indexSignal.value;
            const {
              renderLoading,
              renderError,
              content: items,
            } = propsRef.current;
            const currentItem = items[idx] as T;

            if (loadingCtrl.isError.value) {
              return renderError ? (
                <>{renderError({ item: currentItem, activeIndex: idx })}</>
              ) : (
                <div
                  className="rk-reel-media-error"
                  role="img"
                  aria-label="Content unavailable"
                >
                  <ImageOff size={48} strokeWidth={1.5} aria-hidden="true" />
                  <span className="rk-reel-media-error-text">
                    Content unavailable
                  </span>
                </div>
              );
            }
            if (loadingCtrl.isLoading.value) {
              return renderLoading ? (
                <>{renderLoading({ item: currentItem, activeIndex: idx })}</>
              ) : (
                <div className="rk-reel-loader" />
              );
            }
            return null;
          }}
        </Observe>

        <Observe signals={[indexSignal, innerMediaTypeSignal]}>
          {() => {
            const idx = indexSignal.value;
            const innerType = innerMediaTypeSignal.value;
            const {
              renderControls: renderCtrl,
              onClose: close,
              content: items,
            } = propsRef.current;
            const hasVideo =
              items[idx]?.media.some((m) => m.type === 'video') ?? false;
            const multiMedia = items[idx]?.media.length > 1;
            const soundDisabled = multiMedia && innerType === 'image';

            if (renderCtrl) {
              return (
                <>
                  {renderCtrl({
                    item: items[idx] as T,
                    onClose: close,
                    soundState,
                    activeIndex: idx,
                    content: items,
                  })}
                </>
              );
            }
            return (
              <PlayerControls
                onClose={close}
                showSound={hasVideo}
                soundDisabled={soundDisabled}
              />
            );
          }}
        </Observe>
      </div>

      <Observe signals={[indexSignal]}>
        {() => {
          const idx = indexSignal.value;
          const { renderNavigation: renderNav, content: items } =
            propsRef.current;

          if (renderNav) {
            return (
              <>
                {renderNav({
                  item: items[idx],
                  onPrev: handlePrev,
                  onNext: handleNext,
                  activeIndex: idx,
                  count: items.length,
                })}
              </>
            );
          }
          return (
            <div className="rk-reel-nav-arrows">
              <button
                onClick={handlePrev}
                className="rk-reel-button rk-reel-nav-button"
                aria-label="Previous"
              >
                <ChevronUp size={28} />
              </button>
              <button
                onClick={handleNext}
                className="rk-reel-button rk-reel-nav-button"
                aria-label="Next"
              >
                <ChevronDown size={28} />
              </button>
            </div>
          );
        }}
      </Observe>
    </div>,
    document.body,
  );
}

/**
 * Full-screen, Instagram/TikTok-style vertical reel player overlay.
 *
 * Renders a portal containing a virtualized vertical slider with media
 * playback, gesture/keyboard/wheel navigation, and optional sound controls.
 * Supports full customization via render props for overlays, slides,
 * controls, and navigation.
 *
 * Wraps content in a {@link SoundProvider} for shared mute/unmute state.
 * Locks body scroll while open. Closes on Escape key.
 *
 * @typeParam T - Content item type. Defaults to {@link ContentItem}.
 *
 * @example Basic usage with default ContentItem
 * ```tsx
 * <ReelPlayerOverlay
 *   isOpen={isOpen}
 *   onClose={() => setOpen(false)}
 *   content={items}
 * />
 * ```
 *
 * @example Custom data type
 * ```tsx
 * interface MyItem extends BaseContentItem {
 *   title: string;
 * }
 *
 * <ReelPlayerOverlay<MyItem>
 *   isOpen={isOpen}
 *   onClose={close}
 *   content={myItems}
 *   renderSlideOverlay={() => null}
 * />
 * ```
 *
 * @example Custom controls with sub-components
 * ```tsx
 * <ReelPlayerOverlay
 *   isOpen={isOpen}
 *   onClose={close}
 *   content={items}
 *   renderControls={({ onClose }) => (
 *     <>
 *       <CloseButton onClick={onClose} />
 *       <SoundButton />
 *     </>
 *   )}
 * />
 * ```
 */
export function ReelPlayerOverlay<T extends BaseContentItem = ContentItem>(
  props: ReelPlayerOverlayProps<T>,
): React.ReactElement | null {
  if (!props.isOpen) return null;

  return (
    <SoundProvider>
      <ReelPlayerContent {...props} />
    </SoundProvider>
  );
}
