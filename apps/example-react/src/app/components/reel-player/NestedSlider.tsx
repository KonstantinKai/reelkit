import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Reel, ReelIndicator, type ReelApi } from '@reelkit/react';
import type { MediaItem } from './types';
import ImageSlide from './ImageSlide';
import VideoSlide from './VideoSlide';

interface NestedSliderProps {
  media: MediaItem[];
  isParentActive: boolean;
  size: [number, number];
  contentId: string;
  innerSliderRef: React.MutableRefObject<ReelApi | null>;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  onActiveMediaTypeChange?: (type: 'image' | 'video') => void;
}

const NestedSlider: React.FC<NestedSliderProps> = ({
  media,
  isParentActive,
  size,
  contentId,
  innerSliderRef,
  onVideoRef,
  onActiveMediaTypeChange,
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
    [onVideoRef]
  );

  // Pause video on before change
  const handleBeforeChange = useCallback(() => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, []);

  // Update inner active index on after change
  const handleAfterChange = useCallback((index: number) => {
    setInnerActiveIndex(index);
    if (onActiveMediaTypeChange) {
      onActiveMediaTypeChange(media[index].type);
    }
  }, [media, onActiveMediaTypeChange]);

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
        enableWheel={false}
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
    </div>
  );
};

export default NestedSlider;
