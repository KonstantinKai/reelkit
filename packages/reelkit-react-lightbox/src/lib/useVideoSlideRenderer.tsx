import {
  type ReactNode,
  type FC,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { Observe, SoundProvider, useSoundState } from '@reelkit/react';
import type { LightboxItem } from './LightboxOverlay';
import type { ControlsRenderProps, SlideRenderProps } from './types';
import LightboxVideoSlide from './LightboxVideoSlide';
import {
  Counter,
  CloseButton,
  FullscreenButton,
  SoundButton,
} from './LightboxControls';

/**
 * Return value of {@link useVideoSlideRenderer}.
 */
export interface UseVideoSlideRendererResult {
  /**
   * Wrap `LightboxOverlay` in this to provide sound context.
   * Required for video mute/unmute to work.
   *
   * @example
   * ```tsx
   * <SoundProvider>
   *   <LightboxOverlay ... />
   * </SoundProvider>
   * ```
   */
  SoundProvider: FC<{ children: ReactNode }>;

  /** `true` when at least one item has `type: 'video'`. */
  hasVideo: boolean;

  /**
   * Pass this to `LightboxOverlay`'s `renderSlide` prop.
   * Returns a `LightboxVideoSlide` for video items, or `null` to fall
   * back to the default image slide.
   */
  renderSlide: (props: SlideRenderProps) => ReactNode | null;

  /**
   * Ready-to-use `renderControls` callback with Counter, FullscreenButton,
   * SoundButton (when videos exist), and CloseButton.
   * Pass directly to `LightboxOverlay`'s `renderControls` prop.
   */
  renderControls: (props: ControlsRenderProps) => ReactNode;
}

/**
 * Convenience hook that manages mute state and returns a ready-to-use
 * `renderSlide` function for the lightbox.
 *
 * Video support is fully opt-in — import this hook and wire it into
 * `LightboxOverlay` to enable video slides. Image-only usage pays zero
 * extra bundle cost.
 *
 * @example
 * ```tsx
 * import { LightboxOverlay, useVideoSlideRenderer } from '@reelkit/react-lightbox';
 *
 * const { renderSlide, renderControls, SoundProvider } = useVideoSlideRenderer(items);
 *
 * <SoundProvider>
 *   <LightboxOverlay
 *     images={items}
 *     renderSlide={renderSlide}
 *     renderControls={renderControls}
 *   />
 * </SoundProvider>
 * ```
 */
const VideoLightboxControls: FC<
  ControlsRenderProps & { isVideoSlide: boolean }
> = ({
  onClose,
  activeIndex,
  count,
  isFullscreen,
  onToggleFullscreen,
  isVideoSlide,
}) => {
  const soundState = useSoundState();

  useEffect(() => {
    return () => {
      soundState.muted.value = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="rk-lightbox-controls-left">
        <Counter currentIndex={activeIndex} count={count} />
        <FullscreenButton
          isFullscreen={isFullscreen}
          onToggle={onToggleFullscreen}
        />
        {isVideoSlide && (
          <Observe signals={[soundState.muted]}>
            {() => (
              <SoundButton
                isMuted={soundState.muted.value}
                onToggle={soundState.toggle}
              />
            )}
          </Observe>
        )}
      </div>
      <CloseButton onClick={onClose} />
    </>
  );
};

export function useVideoSlideRenderer(
  items: LightboxItem[],
): UseVideoSlideRendererResult {
  const hasVideo = useMemo(
    () => items.some((item) => item.type === 'video'),
    [items],
  );

  const renderSlide = useCallback(
    ({
      item,
      index,
      size,
      isActive,
      onReady,
      onWaiting,
      onError,
    }: SlideRenderProps): ReactNode | null => {
      if ((item.type ?? 'image') !== 'video') return null;

      return (
        <LightboxVideoSlide
          src={item.src}
          poster={item.poster}
          isActive={isActive}
          size={size}
          slideKey={`lightbox-${index}`}
          onPlaying={onReady}
          onWaiting={onWaiting}
          onError={onError}
        />
      );
    },
    [],
  );

  const renderControls = useCallback(
    (props: ControlsRenderProps): ReactNode => (
      <VideoLightboxControls
        {...props}
        isVideoSlide={items[props.activeIndex]?.type === 'video'}
      />
    ),
    [items],
  );

  return { renderSlide, SoundProvider, hasVideo, renderControls };
}
