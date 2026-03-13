/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  type ReactNode,
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { noop, createSignal } from '@reelkit/core';
import { Reel, Observe, type ReelApi, type ReelProps } from '@reelkit/react';
import { useBodyLock } from '@reelkit/react';
import type {
  BaseContentItem,
  ContentItem,
  ControlsRenderProps,
  NavigationRenderProps,
  NestedSlideRenderProps,
  SlideRenderProps,
} from './types';
import { SoundProvider } from './SoundState';
import { useSoundState } from './useSoundState';
import MediaSlide from './MediaSlide';
import PlayerControls from './PlayerControls';
import SlideOverlay from './SlideOverlay';
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
  | 'useNavKeys'
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

  /** Callback to close the overlay. Triggered by close button or Escape key. */
  onClose: () => void;

  /** Array of content items to display as vertical slides. */
  content: T[];

  /** Zero-based index of the initially visible slide. Defaults to `0`. */
  initialIndex?: number;

  /**
   * Callback fired after slide change
   */
  onSlideChange?: (index: number) => void;

  /**
   * Ref to access the Reel API
   */
  apiRef?: React.MutableRefObject<ReelApi | null>;

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
}

/** Default aspect ratio: 9:16 portrait. */
const DEFAULT_ASPECT_RATIO = 9 / 16;
const MOBILE_BREAKPOINT = 768;

/**
 * Inner content of the player overlay. Renders the `Reel` slider, controls,
 * navigation arrows, and manages video/sound/resize lifecycle.
 *
 * Must be rendered inside a {@link SoundProvider}.
 * @internal
 */
function ReelPlayerContent<T extends BaseContentItem = ContentItem>({
  onClose,
  content,
  initialIndex = 0,
  onSlideChange,
  apiRef,
  renderSlideOverlay,
  renderSlide,
  renderControls,
  renderNavigation,
  renderNestedNavigation,
  renderNestedSlide,
  aspectRatio = DEFAULT_ASPECT_RATIO,
  // Reel proxy props with defaults
  transitionDuration,
  swipeDistanceFactor,
  loop = false,
  useNavKeys = true,
  enableWheel = true,
  wheelDebounceMs,
}: ReelPlayerOverlayProps<T>) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;
  const [innerActiveMediaType, setInnerActiveMediaType] = useState<
    'image' | 'video' | null
  >(null);
  const internalSliderRef = useRef<ReelApi>(null);
  const sliderRef = apiRef ?? internalSliderRef;
  const innerSliderRef = useRef<ReelApi>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoPausedOnDragRef = useRef(false);
  const soundState = useSoundState();

  // Calculate size based on viewport and aspect ratio
  const getSize = useCallback((): [number, number] => {
    if (typeof window === 'undefined') return [0, 0];
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // On mobile, use full viewport
    if (windowWidth < MOBILE_BREAKPOINT) {
      return [windowWidth, windowHeight];
    }

    // On desktop, maintain aspect ratio
    let width = windowHeight * aspectRatio;
    let height = windowHeight;

    // If calculated width exceeds window width, fit to width instead
    if (width > windowWidth) {
      width = windowWidth;
      height = windowWidth / aspectRatio;
    }

    return [width, height];
  }, [aspectRatio]);

  const [sizeSignal] = useState(() =>
    createSignal<[number, number]>(getSize()),
  );

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      sizeSignal.value = getSize();
      sliderRef.current?.adjust();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [getSize]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll when player is open
  useBodyLock(true);

  // Handle video ref from active slide
  const handleVideoRef = useCallback((ref: HTMLVideoElement | null) => {
    videoRef.current = ref;
  }, []);

  // Check if current content has video
  const hasVideoContent = useCallback(
    (index: number): boolean => {
      const item = content[index];
      return item?.media.some((m) => m.type === 'video') ?? false;
    },
    [content],
  );

  // Before slide change - pause video
  const handleBeforeChange = useCallback(() => {
    soundState.disabled.value = true;
  }, []);

  // After slide change - update active index
  const handleAfterChange = useCallback(
    (index: number) => {
      setActiveIndex(index);
      setInnerActiveMediaType(null); // Reset inner media type
      if (hasVideoContent(index)) {
        soundState.disabled.value = false;
      }
      onSlideChange?.(index);
    },
    [hasVideoContent, onSlideChange],
  );

  // Handle inner slider media type change (for nested sliders)
  const handleActiveMediaTypeChange = useCallback((type: 'image' | 'video') => {
    setInnerActiveMediaType(type);
  }, []);

  // Check if current content is a multi-media post
  const isMultiMedia = useCallback(
    (index: number): boolean => {
      return content[index]?.media.length > 1;
    },
    [content],
  );

  // Determine if sound button should be disabled
  // (disabled when viewing an image in a multi-media post that has videos)
  const isSoundDisabled =
    isMultiMedia(activeIndex) && innerActiveMediaType === 'image';

  // On drag start - pause video and unobserve inner slider
  const handleSlideDragStart = useCallback(() => {
    innerSliderRef.current?.unobserve();

    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      videoPausedOnDragRef.current = true;
    }
  }, []);

  // On drag end - observe inner slider
  const handleSlideDragEnd = useCallback(() => {
    innerSliderRef.current?.observe();
  }, []);

  // On drag canceled - resume video if it was playing
  const handleSlideDragCanceled = useCallback(() => {
    if (videoPausedOnDragRef.current && videoRef.current) {
      videoRef.current.play().catch(noop);
    }
    videoPausedOnDragRef.current = false;
  }, []);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    sliderRef.current?.prev();
  }, []);

  const handleNext = useCallback(() => {
    sliderRef.current?.next();
  }, []);

  // Resolve overlay node for a slide
  const overlayNode = (item: T, index: number, isActive: boolean) => {
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

  const overlay = (
    <div className="rk-reel-overlay">
      <div className="rk-reel-container">
        <Observe signals={[sizeSignal]}>
          {() => (
            <Reel
              count={content.length}
              size={sizeSignal.value}
              direction="vertical"
              loop={loop}
              useNavKeys={useNavKeys}
              enableWheel={enableWheel}
              wheelDebounceMs={wheelDebounceMs}
              transitionDuration={transitionDuration}
              swipeDistanceFactor={swipeDistanceFactor}
              initialIndex={initialIndex}
              apiRef={sliderRef}
              beforeChange={handleBeforeChange}
              afterChange={handleAfterChange}
              onSlideDragStart={handleSlideDragStart}
              onSlideDragEnd={handleSlideDragEnd}
              onSlideDragCanceled={handleSlideDragCanceled}
              itemBuilder={(index, _, itemSize) => {
                const item = content[index];
                const isActive = activeIndexRef.current === index;

                const defaultContent = (
                  <>
                    <MediaSlide
                      content={item}
                      isActive={isActive}
                      size={itemSize}
                      innerSliderRef={innerSliderRef}
                      enableWheel={enableWheel}
                      onVideoRef={isActive ? handleVideoRef : undefined}
                      onActiveMediaTypeChange={
                        isActive ? handleActiveMediaTypeChange : undefined
                      }
                      renderNestedNavigation={renderNestedNavigation}
                      renderNestedSlide={renderNestedSlide}
                    />
                    {overlayNode(item, index, isActive)}
                  </>
                );

                // Try renderSlide first
                if (renderSlide) {
                  const custom = renderSlide({
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
                    renderNestedNavigation,
                    enableWheel,
                    defaultContent,
                  });
                  if (custom !== null) {
                    return (
                      <div
                        className="rk-reel-slide-wrapper"
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

                // Default: MediaSlide + overlay
                return (
                  <div
                    className="rk-reel-slide-wrapper"
                    style={{
                      width: itemSize[0],
                      height: itemSize[1],
                      position: 'relative',
                    }}
                  >
                    {defaultContent}
                  </div>
                );
              }}
            />
          )}
        </Observe>

        {renderControls ? (
          renderControls({ onClose, soundState, activeIndex, content })
        ) : (
          <PlayerControls
            onClose={onClose}
            showSound={hasVideoContent(activeIndex)}
            soundDisabled={isSoundDisabled}
          />
        )}
      </div>

      {/* Navigation arrows - outside player container, desktop only */}
      {renderNavigation ? (
        renderNavigation({
          onPrev: handlePrev,
          onNext: handleNext,
          activeIndex,
          count: content.length,
        })
      ) : (
        <div className="rk-player-nav-arrows">
          <button
            onClick={handlePrev}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Previous"
          >
            <ChevronUp size={28} />
          </button>
          <button
            onClick={handleNext}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Next"
          >
            <ChevronDown size={28} />
          </button>
        </div>
      )}
    </div>
  );

  if (typeof document === 'undefined') return overlay;
  return createPortal(overlay, document.body);
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
