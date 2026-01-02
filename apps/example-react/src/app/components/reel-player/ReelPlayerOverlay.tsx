import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Reel, type ReelApi } from '@reelkit/react';
import type { ContentItem } from './types';
import { SoundProvider, useSoundState } from './SoundState';
import MediaSlide from './MediaSlide';
import PlayerControls from './PlayerControls';
import './ReelPlayerOverlay.css';

interface ReelPlayerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentItem[];
  initialIndex?: number;
}

const ASPECT_RATIO = 0.5369683357879234;

const ReelPlayerContent: React.FC<ReelPlayerOverlayProps> = ({
  isOpen,
  onClose,
  content,
  initialIndex = 0,
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [innerActiveMediaType, setInnerActiveMediaType] = useState<'image' | 'video' | null>(null);
  const sliderRef = useRef<ReelApi>(null);
  const innerSliderRef = useRef<ReelApi>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoPausedOnDragRef = useRef(false);
  const soundState = useSoundState();

  // Calculate size based on aspect ratio
  const getSize = useCallback((): [number, number] => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate dimensions maintaining aspect ratio
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
    return () => window.removeEventListener('resize', handleResize);
  }, [getSize]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Lock body scroll when player is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

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
    [content]
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
    },
    [hasVideoContent, soundState]
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
    [content]
  );

  // Determine if sound button should be disabled
  // (disabled when viewing an image in a multi-media post that has videos)
  const isSoundDisabled = isMultiMedia(activeIndex) && innerActiveMediaType === 'image';

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
      videoRef.current.play().catch(() => {});
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

  if (!isOpen) return null;

  return (
    <div className="reel-overlay">
      <div className="reel-container">
        <Reel
          count={content.length}
          size={size}
          direction="vertical"
          loop={false}
          useNavKeys={true}
          enableWheel={true}
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
                onVideoRef={isActive ? handleVideoRef : undefined}
                onActiveMediaTypeChange={isActive ? handleActiveMediaTypeChange : undefined}
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
};

const ReelPlayerOverlay: React.FC<ReelPlayerOverlayProps> = (props) => {
  if (!props.isOpen) return null;

  return (
    <SoundProvider>
      <ReelPlayerContent {...props} />
    </SoundProvider>
  );
};

export default ReelPlayerOverlay;
