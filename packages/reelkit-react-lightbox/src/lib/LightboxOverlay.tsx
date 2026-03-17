import {
  type MutableRefObject,
  type ReactNode,
  type FC,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { createSignal } from '@reelkit/core';
import { Reel, Observe, type ReelApi, type ReelProps } from '@reelkit/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useFullscreen from './useFullscreen';
import { useBodyLock } from '@reelkit/react';
import { SwipeToClose } from './SwipeToClose';
import LightboxControls from './LightboxControls';
import type {
  LightboxControlsRenderProps,
  NavigationRenderProps,
  InfoRenderProps,
} from './types';
import './LightboxOverlay.css';

/**
 * Data for a single lightbox item (image or video).
 *
 * At minimum, provide `src`. Optional `title` and `description` are
 * rendered in the built-in info overlay (unless overridden via `renderInfo`).
 *
 * For video items, set `type: 'video'` and optionally provide a `poster`
 * thumbnail. Video rendering requires opting in via `useVideoSlideRenderer`.
 */
export interface LightboxItem {
  /** URL of the image or video. */
  src: string;

  /**
   * Item type. Defaults to `'image'` when omitted.
   * Video items require opting in via `useVideoSlideRenderer` and `renderSlide`.
   */
  type?: 'image' | 'video';

  /** Poster/thumbnail image for video items. Used for preloading and as placeholder. */
  poster?: string;

  /** Title displayed in the info overlay. */
  title?: string;

  /** Description displayed below the title in the info overlay. */
  description?: string;

  /** Intrinsic width of the image in pixels. Currently unused by the lightbox. */
  width?: number;

  /** Intrinsic height of the image in pixels. Currently unused by the lightbox. */
  height?: number;
}

/**
 * Available CSS transition effects applied when navigating between slides.
 *
 * - `'slide'` — standard horizontal slide (default)
 * - `'fade'` — crossfade between images
 * - `'zoom-in'` — zoom in from smaller to normal size
 */
export type TransitionType = 'slide' | 'fade' | 'zoom-in';

/**
 * Subset of {@link ReelProps} forwarded to the underlying `Reel` component.
 *
 * Allows controlling transition duration, swipe sensitivity, looping,
 * keyboard navigation, and wheel behaviour without accessing `Reel` directly.
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
 * Props for the {@link LightboxOverlay} component.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <LightboxOverlay
 *   isOpen={index !== null}
 *   images={images}
 *   initialIndex={index ?? 0}
 *   onClose={() => setIndex(null)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With custom controls and info
 * <LightboxOverlay
 *   isOpen={isOpen}
 *   images={images}
 *   onClose={handleClose}
 *   renderControls={({ onClose, currentIndex, count }) => (
 *     <div>
 *       <Counter currentIndex={currentIndex} count={count} />
 *       <CloseButton onClick={onClose} />
 *     </div>
 *   )}
 *   renderInfo={({ item }) => <p>{item.title}</p>}
 * />
 * ```
 */
export interface LightboxOverlayProps extends ReelProxyProps {
  /** When `true`, the lightbox is rendered and body scroll is locked. */
  isOpen: boolean;

  /** Array of images to display as horizontal slides. */
  images: LightboxItem[];

  /** Zero-based index of the initially visible image. @default 0 */
  initialIndex?: number;

  /** Callback to close the lightbox. Triggered by close button or Escape key. */
  onClose: () => void;

  /**
   * Transition animation type
   * @default 'slide'
   */
  transition?: TransitionType;

  /**
   * Callback fired after slide change
   */
  onSlideChange?: (index: number) => void;

  /**
   * Ref to access the Reel API
   */
  apiRef?: MutableRefObject<ReelApi | null>;

  /**
   * Custom controls. Replaces default close button, counter, and fullscreen toggle.
   */
  renderControls?: (props: LightboxControlsRenderProps) => ReactNode;

  /**
   * Custom navigation arrows. Replaces default prev/next buttons.
   */
  renderNavigation?: (props: NavigationRenderProps) => ReactNode;

  /**
   * Custom info overlay. Replaces default title + description gradient.
   * Return `null` to hide the info overlay entirely.
   */
  renderInfo?: (props: InfoRenderProps) => ReactNode;

  /**
   * Custom slide rendering. Return null to fall back to default image slide.
   */
  renderSlide?: (
    item: LightboxItem,
    index: number,
    size: [number, number],
    isActive: boolean,
  ) => ReactNode | null;
}

/** Number of images to preload before and after the current index. */
const PRELOAD_RANGE = 2;

const preloadedImages = new Set<string>();

const preloadImage = (src: string): void => {
  if (preloadedImages.has(src)) return;
  preloadedImages.add(src);
  const img = new Image();
  img.src = src;
};

/**
 * Inner content of the lightbox overlay. Manages slider, controls,
 * navigation, info overlay, fullscreen, resize, and image preloading.
 *
 * Rendered only when `isOpen` is `true` (gated by {@link LightboxOverlay}).
 * @internal
 */
const LightboxContent: FC<LightboxOverlayProps> = ({
  images,
  initialIndex = 0,
  onClose,
  transition = 'slide',
  onSlideChange,
  apiRef,
  renderControls,
  renderNavigation,
  renderInfo,
  renderSlide,
  // Reel proxy props with defaults
  transitionDuration,
  swipeDistanceFactor,
  loop = false,
  useNavKeys = true,
  enableWheel = true,
  wheelDebounceMs,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalApiRef = useRef<ReelApi>(null);
  const sliderRef = apiRef ?? internalApiRef;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;
  const [sizeSignal] = useState(() =>
    createSignal<[number, number]>(
      typeof window !== 'undefined'
        ? [window.innerWidth, window.innerHeight]
        : [0, 0],
    ),
  );
  const [isFullscreen, requestFullscreen, exitFullscreen] = useFullscreen({
    ref: containerRef,
  });
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? 'ontouchstart' in window || navigator.maxTouchPoints > 0
      : false,
  );

  // Lock body scroll
  useBodyLock(true);

  // Update size on resize
  useEffect(() => {
    const handleResize = () => {
      sizeSignal.value = [window.innerWidth, window.innerHeight];
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preload images in range
  useEffect(() => {
    const start = Math.max(0, currentIndex - PRELOAD_RANGE);
    const end = Math.min(images.length - 1, currentIndex + PRELOAD_RANGE);

    for (let i = start; i <= end; i++) {
      if (i !== currentIndex) {
        const item = images[i];
        if ((item.type ?? 'image') === 'video') {
          if (item.poster) preloadImage(item.poster);
        } else {
          preloadImage(item.src);
        }
      }
    }
  }, [currentIndex, images]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          exitFullscreen();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, exitFullscreen, onClose]);

  const handleAfterChange = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      onSlideChange?.(index);
    },
    [onSlideChange],
  );

  const handlePrev = useCallback(() => {
    sliderRef.current?.prev();
  }, [sliderRef]);

  const handleNext = useCallback(() => {
    sliderRef.current?.next();
  }, [sliderRef]);

  const handleFullscreenToggle = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      requestFullscreen();
    }
  }, [isFullscreen, requestFullscreen, exitFullscreen]);

  const currentImage = images[currentIndex];

  const itemBuilder = useCallback(
    (index: number, _indexInRange: number, slideSize: [number, number]) => {
      const image = images[index];
      const isActive = index === currentIndexRef.current;
      const transitionClass =
        transition !== 'slide' ? `rk-transition-${transition}` : '';
      const activeClass = isActive ? 'rk-active' : '';
      const slideClassName =
        `rk-lightbox-slide ${transitionClass} ${activeClass}`.trim();

      if (renderSlide) {
        const custom = renderSlide(image, index, slideSize, isActive);
        if (custom !== null) {
          return (
            <div
              className={slideClassName}
              style={{ width: slideSize[0], height: slideSize[1] }}
            >
              {custom}
            </div>
          );
        }
      }

      return (
        <div
          className={slideClassName}
          style={{ width: slideSize[0], height: slideSize[1] }}
        >
          <img
            src={image.src}
            alt={image.title || `Image ${index + 1}`}
            className="rk-lightbox-img"
            draggable={false}
          />
        </div>
      );
    },
    [images, transition, renderSlide],
  );

  const overlay = (
    <div ref={containerRef} className="rk-lightbox-container">
      {/* Controls (close, counter, fullscreen) */}
      {renderControls ? (
        renderControls({
          onClose,
          currentIndex,
          count: images.length,
          isFullscreen,
          onToggleFullscreen: handleFullscreenToggle,
        })
      ) : (
        <LightboxControls
          onClose={onClose}
          currentIndex={currentIndex}
          count={images.length}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleFullscreenToggle}
        />
      )}

      {/* Reel slider - wrapped in SwipeToClose so only image moves */}
      <SwipeToClose enabled={isMobile} onClose={onClose}>
        <Observe signals={[sizeSignal]}>
          {() => (
            <Reel
              count={images.length}
              size={sizeSignal.value}
              direction="horizontal"
              initialIndex={initialIndex}
              apiRef={sliderRef}
              afterChange={handleAfterChange}
              transitionDuration={transitionDuration}
              swipeDistanceFactor={swipeDistanceFactor}
              loop={loop}
              useNavKeys={useNavKeys}
              enableWheel={enableWheel}
              wheelDebounceMs={wheelDebounceMs}
              itemBuilder={itemBuilder}
            />
          )}
        </Observe>
      </SwipeToClose>

      {/* Navigation buttons */}
      {renderNavigation
        ? renderNavigation({
            onPrev: handlePrev,
            onNext: handleNext,
            activeIndex: currentIndex,
            count: images.length,
          })
        : !isMobile &&
          images.length > 1 && (
            <>
              {currentIndex > 0 && (
                <button
                  className="rk-lightbox-nav rk-lightbox-nav-prev"
                  onClick={handlePrev}
                  title="Previous"
                >
                  <ChevronLeft size={32} />
                </button>
              )}
              {currentIndex < images.length - 1 && (
                <button
                  className="rk-lightbox-nav rk-lightbox-nav-next"
                  onClick={handleNext}
                  title="Next"
                >
                  <ChevronRight size={32} />
                </button>
              )}
            </>
          )}

      {/* Info overlay (title + description) */}
      {renderInfo
        ? renderInfo({ item: currentImage, index: currentIndex })
        : (currentImage?.title || currentImage?.description) && (
            <div className="rk-lightbox-info">
              {currentImage.title && (
                <h3 className="rk-lightbox-title">{currentImage.title}</h3>
              )}
              {currentImage.description && (
                <p className="rk-lightbox-description">
                  {currentImage.description}
                </p>
              )}
            </div>
          )}

      {/* Mobile swipe hint */}
      {isMobile && (
        <div className="rk-lightbox-swipe-hint">Swipe up to close</div>
      )}
    </div>
  );

  if (typeof document === 'undefined') return overlay;
  return createPortal(overlay, document.body);
};

/**
 * Full-screen image lightbox overlay with gesture, keyboard, and wheel
 * navigation.
 *
 * Renders into a portal on `document.body`. When `isOpen` is `false` the
 * component returns `null` — no DOM nodes are created.
 *
 * Customise controls, navigation, info overlay, and individual slides
 * via the `renderControls`, `renderNavigation`, `renderInfo`, and
 * `renderSlide` props. Reusable sub-components ({@link CloseButton},
 * {@link Counter}, {@link FullscreenButton}) are available for
 * composition inside `renderControls`.
 */
export const LightboxOverlay: FC<LightboxOverlayProps> = (props) => {
  if (!props.isOpen) return null;

  return <LightboxContent {...props} />;
};
