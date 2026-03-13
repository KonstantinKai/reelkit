import React, { type ReactNode } from 'react';
import type { ReelApi } from '@reelkit/react';
import type {
  BaseContentItem,
  NavigationRenderProps,
  NestedSlideRenderProps,
} from './types';
import ImageSlide from './ImageSlide';
import VideoSlide from './VideoSlide';
import NestedSlider from './NestedSlider';

/** @internal */
interface MediaSlideProps {
  content: BaseContentItem;

  isActive: boolean;

  size: [number, number];

  innerSliderRef: React.MutableRefObject<ReelApi | null>;

  enableWheel?: boolean;

  onVideoRef?: (ref: HTMLVideoElement | null) => void;

  onActiveMediaTypeChange?: (type: 'image' | 'video') => void;

  renderNestedNavigation?: (props: NavigationRenderProps) => ReactNode;

  renderNestedSlide?: (props: NestedSlideRenderProps) => ReactNode;
}

/**
 * Renders the appropriate media component based on the content item's media array.
 *
 * - Single image → {@link ImageSlide}
 * - Single video → {@link VideoSlide}
 * - Multiple items → {@link NestedSlider} (horizontal carousel within the vertical slide)
 *
 * @internal Used by `ReelPlayerContent` as the default slide renderer.
 */
const MediaSlide: React.FC<MediaSlideProps> = ({
  content,
  isActive,
  size,
  innerSliderRef,
  enableWheel,
  onVideoRef,
  onActiveMediaTypeChange,
  renderNestedNavigation,
  renderNestedSlide,
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
      enableWheel={enableWheel}
      onVideoRef={onVideoRef}
      onActiveMediaTypeChange={onActiveMediaTypeChange}
      renderNavigation={renderNestedNavigation}
      renderNestedSlide={renderNestedSlide}
    />
  );
};

export default MediaSlide;
