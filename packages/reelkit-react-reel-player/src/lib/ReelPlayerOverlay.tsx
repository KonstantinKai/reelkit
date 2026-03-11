/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { noop } from '@reelkit/core';
import { Reel, type ReelApi, type ReelProps } from '@reelkit/react';
import { useBodyLock } from '@reelkit/react';
import type { ContentItem } from './types';
import { SoundProvider, useSoundState } from './SoundState';
import MediaSlide from './MediaSlide';
import PlayerControls from './PlayerControls';
import './ReelPlayerOverlay.css';

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

export interface ReelPlayerOverlayProps extends ReelProxyProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentItem[];
  initialIndex?: number;
  /**
   * Callback fired after slide change
   */
  onSlideChange?: (index: number) => void;
  /**
   * Ref to access the Reel API
   */
  apiRef?: React.MutableRefObject<ReelApi | null>;
}

const ASPECT_RATIO = 0.5369683357879234;
const MOBILE_BREAKPOINT = 768;

const ReelPlayerContent: React.FC<ReelPlayerOverlayProps> = ({
  onClose,
  content,
  initialIndex = 0,
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
  const [activeIndex, setActiveIndex] = useState(initialIndex);
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
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // On mobile, use full viewport
    if (windowWidth < MOBILE_BREAKPOINT) {
      return [windowWidth, windowHeight];
    }

    // On desktop, maintain aspect ratio
    let width = windowHeight * ASPECT_RATIO;
    let height = windowHeight;

    // If calculated width exceeds window width, fit to width instead
    if (width > windowWidth) {
      width = windowWidth;
      height = windowWidth / ASPECT_RATIO;
    }

    return [width, height];
  }, []);

  const [size, setSize] = useState<[number, number]>(getSize);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setSize(getSize());
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
    soundState.setDisabled(true);
  }, [soundState]);

  // After slide change - update active index
  const handleAfterChange = useCallback(
    (index: number) => {
      setActiveIndex(index);
      setInnerActiveMediaType(null); // Reset inner media type
      if (hasVideoContent(index)) {
        soundState.setDisabled(false);
      }
      onSlideChange?.(index);
    },
    [hasVideoContent, soundState, onSlideChange],
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

  const overlay = (
    <div className="reel-overlay">
      <div className="reel-container">
        <Reel
          count={content.length}
          size={size}
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
            const isActive = activeIndex === index;

            return (
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
              />
            );
          }}
        />

        <PlayerControls
          onClose={onClose}
          showSound={hasVideoContent(activeIndex)}
          soundDisabled={isSoundDisabled}
        />
      </div>

      {/* Navigation arrows - outside player container, desktop only */}
      <div className="player-nav-arrows">
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
    </div>
  );

  return createPortal(overlay, document.body);
};

export const ReelPlayerOverlay: React.FC<ReelPlayerOverlayProps> = (props) => {
  if (!props.isOpen) return null;

  return (
    <SoundProvider>
      <ReelPlayerContent {...props} />
    </SoundProvider>
  );
};
