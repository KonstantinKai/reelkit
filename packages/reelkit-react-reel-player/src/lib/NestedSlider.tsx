import React, { type ReactNode, useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Reel,
  ReelIndicator,
  Observe,
  createSignal,
  type ReelApi,
} from '@reelkit/react';
import type {
  BaseContentItem,
  MediaItem,
  NavigationRenderProps,
  NestedSlideRenderProps,
} from './types';
import ImageSlide from './ImageSlide';
import VideoSlide from './VideoSlide';
import './NestedSlider.css';

/** @internal */
interface NestedSliderProps {
  media: MediaItem[];
  contentItem: BaseContentItem;
  isParentActive: boolean;
  size: [number, number];
  contentId: string;
  innerSliderRef: React.MutableRefObject<ReelApi | null>;
  enableWheel?: boolean;

  /** Inner media index to open at. Applies only on first mount. @default 0 */
  initialIndex?: number;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  onActiveMediaTypeChange?: (type: 'image' | 'video') => void;

  /** Fired after the active inner media index changes. */
  onIndexChange?: (index: number) => void;
  onReady?: () => void;
  onWaiting?: () => void;
  onError?: () => void;
  renderNavigation?: (props: NavigationRenderProps) => ReactNode;
  renderNestedSlide?: (props: NestedSlideRenderProps) => ReactNode;
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
const NestedSlider: React.FC<NestedSliderProps> = (props) => {
  const { media, isParentActive, size, innerSliderRef, enableWheel } = props;

  const propsRef = useRef(props);
  propsRef.current = props;
  const localSliderRef = useRef<ReelApi>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [
    {
      indexSignal,
      seed,
      handleBeforeChange,
      handleAfterChange,
      handlePrev,
      handleNext,
      itemBuilder,
    },
  ] = useState(() => {
    // Clamp the seed: a URL may name an inner index past this post's media.
    const seed =
      props.initialIndex !== undefined &&
      props.initialIndex >= 0 &&
      props.initialIndex < props.media.length
        ? props.initialIndex
        : 0;
    const indexSignal = createSignal(seed);

    const handleVideoRef = (ref: HTMLVideoElement | null) => {
      videoRef.current = ref;
      propsRef.current.onVideoRef?.(ref);
    };

    return {
      indexSignal,
      seed,
      handleBeforeChange: () => {
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
        }
      },
      handleAfterChange: (index: number) => {
        indexSignal.value = index;
        const {
          media: items,
          onActiveMediaTypeChange,
          onReady,
          onIndexChange,
        } = propsRef.current;
        onActiveMediaTypeChange?.(items[index].type);
        onIndexChange?.(index);
        if (items[index].type === 'image') {
          onReady?.();
        }
      },
      handlePrev: () => {
        localSliderRef.current?.prev();
      },
      handleNext: () => {
        localSliderRef.current?.next();
      },
      itemBuilder: (
        index: number,
        _indexInRange: number,
        itemSize: [number, number],
      ) => {
        const {
          media: items,
          isParentActive: parentActive,
          contentId: cId,
          onReady,
          onWaiting,
          onError,
          renderNestedSlide,
        } = propsRef.current;
        const item = items[index];
        const isInnerActive = index === indexSignal.value;
        const slideKey = `${cId}:${item.id}`;
        const videoRefProp = isInnerActive ? handleVideoRef : undefined;

        const defaultContent =
          item.type === 'video' ? (
            <VideoSlide
              src={item.src}
              poster={item.poster}
              aspectRatio={item.aspectRatio}
              size={itemSize}
              isActive={parentActive}
              isInnerActive={isInnerActive}
              slideKey={slideKey}
              onVideoRef={videoRefProp}
              onReady={isInnerActive ? onReady : undefined}
              onWaiting={isInnerActive ? onWaiting : undefined}
              onError={isInnerActive ? onError : undefined}
            />
          ) : (
            <ImageSlide
              src={item.src}
              size={itemSize}
              imageProps={
                isInnerActive ? { onLoad: onReady, onError } : undefined
              }
            />
          );

        if (renderNestedSlide) {
          return renderNestedSlide({
            item: propsRef.current.contentItem,
            media: item,
            index,
            size: itemSize,
            isActive: parentActive,
            isInnerActive,
            slideKey,
            onVideoRef: videoRefProp,
            onReady: isInnerActive ? onReady : undefined,
            onWaiting: isInnerActive ? onWaiting : undefined,
            onError: isInnerActive ? onError : undefined,
            defaultContent,
          });
        }

        return defaultContent;
      },
    };
  });

  useEffect(() => {
    innerSliderRef.current = localSliderRef.current;
    return () => {
      innerSliderRef.current = null;
    };
  }, [innerSliderRef]);

  useEffect(() => {
    if (isParentActive) {
      // On activation, report the live inner index so a URL following the
      // player names the media actually on screen — 0 on a fresh mount, the
      // retained index while this post stayed in the virtualization window.
      propsRef.current.onActiveMediaTypeChange?.(media[indexSignal.value].type);
      propsRef.current.onIndexChange?.(indexSignal.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isParentActive]);

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
        enableNavKeys={true}
        enableWheel={enableWheel}
        initialIndex={seed}
        apiRef={localSliderRef}
        beforeChange={handleBeforeChange}
        afterChange={handleAfterChange}
        className={isParentActive ? 'rk-reel-nested-active' : undefined}
        itemBuilder={itemBuilder}
      />

      <Observe signals={[indexSignal]}>
        {() => {
          const idx = indexSignal.value;
          const { media: items, renderNavigation: renderNav } =
            propsRef.current;

          return (
            <>
              {items.length > 1 && (
                <div className="rk-reel-nested-indicator">
                  <ReelIndicator
                    count={items.length}
                    active={idx}
                    direction="horizontal"
                    visible={5}
                    radius={3}
                    gap={4}
                    activeColor="#fff"
                    inactiveColor="rgba(255,255,255,0.4)"
                    onDotClick={(i) => localSliderRef.current?.goTo(i, true)}
                  />
                </div>
              )}

              {items.length > 1 &&
                (renderNav ? (
                  renderNav({
                    item: propsRef.current.contentItem as BaseContentItem,
                    media: items[idx],
                    onPrev: handlePrev,
                    onNext: handleNext,
                    activeIndex: idx,
                    count: items.length,
                  })
                ) : (
                  <>
                    {idx > 0 && (
                      <button
                        className="rk-reel-nested-nav rk-reel-nested-nav-prev"
                        onClick={handlePrev}
                        aria-label="Previous"
                      >
                        <ChevronLeft size={24} />
                      </button>
                    )}
                    {idx < items.length - 1 && (
                      <button
                        className="rk-reel-nested-nav rk-reel-nested-nav-next"
                        onClick={handleNext}
                        aria-label="Next"
                      >
                        <ChevronRight size={24} />
                      </button>
                    )}
                  </>
                ))}
            </>
          );
        }}
      </Observe>
    </div>
  );
};

export default NestedSlider;
