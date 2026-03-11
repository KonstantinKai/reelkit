import * as React from 'react';
import { createPortal } from 'react-dom';
import { Reel, type ReelApi, type ReelProps } from '@reelkit/react';
import { X, Maximize, Minimize, ChevronLeft, ChevronRight } from 'lucide-react';
import useFullscreen from './useFullscreen';
import { useBodyLock } from '@reelkit/react';
import { SwipeToClose } from './SwipeToClose';
import './LightboxOverlay.css';

export interface LightboxItem {
  src: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
}

export type TransitionType = 'slide' | 'fade' | 'zoom-in';

/**
 * Props that are proxied to the underlying Reel component
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

export interface LightboxOverlayProps extends ReelProxyProps {
  isOpen: boolean;
  images: LightboxItem[];
  initialIndex?: number;
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
  apiRef?: React.MutableRefObject<ReelApi | null>;
}

const PRELOAD_RANGE = 2;

const preloadedImages = new Set<string>();

const preloadImage = (src: string): void => {
  if (preloadedImages.has(src)) return;
  preloadedImages.add(src);
  const img = new Image();
  img.src = src;
};

const LightboxContent: React.FC<LightboxOverlayProps> = ({
  images,
  initialIndex = 0,
  onClose,
  transition = 'slide',
  onSlideChange,
  apiRef,
  // Reel proxy props with defaults
  transitionDuration,
  swipeDistanceFactor,
  loop = false,
  useNavKeys = true,
  enableWheel = true,
  wheelDebounceMs,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const internalApiRef = React.useRef<ReelApi>(null);
  const sliderRef = apiRef ?? internalApiRef;
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [size, setSize] = React.useState<[number, number]>([
    window.innerWidth,
    window.innerHeight,
  ]);
  const [isFullscreen, requestFullscreen, exitFullscreen] = useFullscreen({
    ref: containerRef,
  });
  const [isMobile, setIsMobile] = React.useState(
    () => 'ontouchstart' in window || navigator.maxTouchPoints > 0
  );

  // Lock body scroll
  useBodyLock(true);

  // Update size on resize
  React.useEffect(() => {
    const handleResize = () => {
      setSize([window.innerWidth, window.innerHeight]);
      setIsMobile(
        'ontouchstart' in window || navigator.maxTouchPoints > 0
      );
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Preload images in range
  React.useEffect(() => {
    const start = Math.max(0, currentIndex - PRELOAD_RANGE);
    const end = Math.min(images.length - 1, currentIndex + PRELOAD_RANGE);

    for (let i = start; i <= end; i++) {
      if (i !== currentIndex) {
        preloadImage(images[i].src);
      }
    }
  }, [currentIndex, images]);

  // Handle keyboard navigation
  React.useEffect(() => {
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

  const handleAfterChange = React.useCallback((index: number) => {
    setCurrentIndex(index);
    onSlideChange?.(index);
  }, [onSlideChange]);

  const handlePrev = React.useCallback(() => {
    sliderRef.current?.prev();
  }, [sliderRef]);

  const handleNext = React.useCallback(() => {
    sliderRef.current?.next();
  }, [sliderRef]);

  const handleFullscreenToggle = React.useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      requestFullscreen();
    }
  }, [isFullscreen, requestFullscreen, exitFullscreen]);

  const currentImage = images[currentIndex];

  const itemBuilder = React.useCallback(
    (index: number, _indexInRange: number, slideSize: [number, number]) => {
      const image = images[index];
      const isActive = index === currentIndex;
      const transitionClass = transition !== 'slide' ? `transition-${transition}` : '';
      const activeClass = isActive ? 'active' : '';

      return (
        <div
          className={`lightbox-slide ${transitionClass} ${activeClass}`.trim()}
          style={{ width: slideSize[0], height: slideSize[1] }}
        >
          <img
            src={image.src}
            alt={image.title || `Image ${index + 1}`}
            className="lightbox-img"
            draggable={false}
          />
        </div>
      );
    },
    [images, currentIndex, transition]
  );

  const overlay = (
    <div ref={containerRef} className="lightbox-container">
      {/* Top-left controls */}
      <div className="lightbox-controls-left">
        <span className="lightbox-counter">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          className="lightbox-btn"
          onClick={handleFullscreenToggle}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>

      {/* Top-right close button */}
      <button
        className="lightbox-close"
        onClick={onClose}
        title="Close (Esc)"
      >
        <X size={24} />
      </button>

      {/* Reel slider - wrapped in SwipeToClose so only image moves */}
      <SwipeToClose enabled={isMobile} onClose={onClose}>
        <Reel
          count={images.length}
          size={size}
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
      </SwipeToClose>

      {/* Navigation buttons (desktop only) */}
      {!isMobile && images.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              className="lightbox-nav lightbox-nav-prev"
              onClick={handlePrev}
              title="Previous"
            >
              <ChevronLeft size={32} />
            </button>
          )}
          {currentIndex < images.length - 1 && (
            <button
              className="lightbox-nav lightbox-nav-next"
              onClick={handleNext}
              title="Next"
            >
              <ChevronRight size={32} />
            </button>
          )}
        </>
      )}

      {/* Title and description */}
      {(currentImage?.title || currentImage?.description) && (
        <div className="lightbox-info">
          {currentImage.title && (
            <h3 className="lightbox-title">{currentImage.title}</h3>
          )}
          {currentImage.description && (
            <p className="lightbox-description">
              {currentImage.description}
            </p>
          )}
        </div>
      )}

      {/* Mobile swipe hint */}
      {isMobile && (
        <div className="lightbox-swipe-hint">Swipe up to close</div>
      )}
    </div>
  );

  return createPortal(overlay, document.body);
};

export const LightboxOverlay: React.FC<LightboxOverlayProps> = (props) => {
  if (!props.isOpen) return null;

  return <LightboxContent {...props} />;
};
