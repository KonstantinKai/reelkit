import React, {
  type ReactNode,
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Reel, ReelIndicator, type ReelApi } from '@reelkit/react';
import type { MediaItem, NavigationRenderProps } from './types';
import ImageSlide from './ImageSlide';
import VideoSlide from './VideoSlide';
import './NestedSlider.css';

/** @internal */
interface NestedSliderProps {
  media: MediaItem[];
  isParentActive: boolean;
  size: [number, number];
  contentId: string;
  innerSliderRef: React.MutableRefObject<ReelApi | null>;
  enableWheel?: boolean;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  onActiveMediaTypeChange?: (type: 'image' | 'video') => void;
  renderNavigation?: (props: NavigationRenderProps) => ReactNode;
}

/**
 * Horizontal nested slider for multi-media content items (e.g. an Instagram
 * carousel post with both images and videos).
 *
 * Renders a horizontal `Reel` inside a vertical slide, with indicator dots
 * and left/right navigation arrows. Syncs its active ref with the parent
 * player for coordinated drag/unobserve behavior.
 *
 * @internal Used by {@link MediaSlide} when a content item has multiple media assets.
 */
const NestedSlider: React.FC<NestedSliderProps> = ({
  media,
  isParentActive,
  size,
  contentId,
  innerSliderRef,
  enableWheel,
  onVideoRef,
  onActiveMediaTypeChange,
  renderNavigation,
}) => {
  const [innerActiveIndex, setInnerActiveIndex] = useState(0);
  const localSliderRef = useRef<ReelApi>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sync local ref with parent's innerSliderRef
  useEffect(() => {
    innerSliderRef.current = localSliderRef.current;
    return () => {
      innerSliderRef.current = null;
    };
  }, [innerSliderRef]);

  // Report initial active media type when becoming active
  useEffect(() => {
    if (isParentActive && onActiveMediaTypeChange) {
      onActiveMediaTypeChange(media[innerActiveIndex].type);
    }
  }, [isParentActive, onActiveMediaTypeChange, media, innerActiveIndex]);

  // Handle video ref from active video slide
  const handleVideoRef = useCallback(
    (ref: HTMLVideoElement | null) => {
      videoRef.current = ref;
      if (onVideoRef) {
        onVideoRef(ref);
      }
    },
    [onVideoRef],
  );

  // Pause video on before change
  const handleBeforeChange = useCallback(() => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, []);

  // Update inner active index on after change
  const handleAfterChange = useCallback(
    (index: number) => {
      setInnerActiveIndex(index);
      if (onActiveMediaTypeChange) {
        onActiveMediaTypeChange(media[index].type);
      }
    },
    [media, onActiveMediaTypeChange],
  );

  // Navigation handlers
  const handlePrev = useCallback(() => {
    localSliderRef.current?.prev();
  }, []);

  const handleNext = useCallback(() => {
    localSliderRef.current?.next();
  }, []);

  return (
    <div
      style={{
        width: size[0],
        height: size[1],
        position: 'relative',
        backgroundColor: '#000',
      }}
    >
      <Reel
        count={media.length}
        size={size}
        direction="horizontal"
        loop={false}
        useNavKeys={true}
        enableWheel={enableWheel}
        apiRef={localSliderRef}
        beforeChange={handleBeforeChange}
        afterChange={handleAfterChange}
        itemBuilder={(index, _, itemSize) => {
          const item = media[index];
          const isInnerActive = innerActiveIndex === index;

          if (item.type === 'video') {
            return (
              <VideoSlide
                src={item.src}
                poster={item.poster}
                aspectRatio={item.aspectRatio}
                size={itemSize}
                isActive={isParentActive}
                isInnerActive={isInnerActive}
                slideKey={`${contentId}:${item.id}`}
                onVideoRef={isInnerActive ? handleVideoRef : undefined}
              />
            );
          }

          return <ImageSlide src={item.src} size={itemSize} />;
        }}
      />

      {/* Indicator dots at bottom */}
      {media.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
          }}
        >
          <ReelIndicator
            count={media.length}
            active={innerActiveIndex}
            direction="horizontal"
            visible={5}
            radius={3}
            gap={4}
            activeColor="#fff"
            inactiveColor="rgba(255,255,255,0.4)"
            onDotClick={(index) => localSliderRef.current?.goTo(index, true)}
          />
        </div>
      )}

      {/* Navigation arrows - desktop only */}
      {media.length > 1 &&
        (renderNavigation ? (
          renderNavigation({
            onPrev: handlePrev,
            onNext: handleNext,
            activeIndex: innerActiveIndex,
            count: media.length,
          })
        ) : (
          <>
            {innerActiveIndex > 0 && (
              <button
                className="rk-nested-nav rk-nested-nav-prev"
                onClick={handlePrev}
                aria-label="Previous"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {innerActiveIndex < media.length - 1 && (
              <button
                className="rk-nested-nav rk-nested-nav-next"
                onClick={handleNext}
                aria-label="Next"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </>
        ))}
    </div>
  );
};

export default NestedSlider;
