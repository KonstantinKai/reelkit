import React from 'react';
import type { ReelApi } from '@reelkit/react';
import type { ContentItem } from './types';
import ImageSlide from './ImageSlide';
import VideoSlide from './VideoSlide';
import NestedSlider from './NestedSlider';

interface MediaSlideProps {
  content: ContentItem;
  isActive: boolean;
  size: [number, number];
  innerSliderRef: React.MutableRefObject<ReelApi | null>;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  onActiveMediaTypeChange?: (type: 'image' | 'video') => void;
}

const MediaSlide: React.FC<MediaSlideProps> = ({
  content,
  isActive,
  size,
  innerSliderRef,
  onVideoRef,
  onActiveMediaTypeChange,
}) => {
  const { media } = content;

  // Single image
  if (media.length === 1 && media[0].type === 'image') {
    return <ImageSlide src={media[0].src} size={size} />;
  }

  // Single video
  if (media.length === 1 && media[0].type === 'video') {
    return (
      <VideoSlide
        src={media[0].src}
        poster={media[0].poster}
        aspectRatio={media[0].aspectRatio}
        size={size}
        isActive={isActive}
        slideKey={content.id}
        onVideoRef={onVideoRef}
      />
    );
  }

  // Multiple media items - use nested slider
  return (
    <NestedSlider
      media={media}
      isParentActive={isActive}
      size={size}
      contentId={content.id}
      innerSliderRef={innerSliderRef}
      onVideoRef={onVideoRef}
      onActiveMediaTypeChange={onActiveMediaTypeChange}
    />
  );
};

export default MediaSlide;
