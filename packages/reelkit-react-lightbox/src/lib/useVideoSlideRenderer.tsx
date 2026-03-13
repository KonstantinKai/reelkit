import {
  type ReactNode,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import type { LightboxItem } from './LightboxOverlay';
import type { LightboxControlsRenderProps } from './types';
import LightboxVideoSlide, {
  setLightboxVideoMuted,
} from './LightboxVideoSlide';
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
   * Pass this to `LightboxOverlay`'s `renderSlide` prop.
   * Returns a `LightboxVideoSlide` for video items, or `null` to fall
   * back to the default image slide.
   */
  renderSlide: (
    item: LightboxItem,
    index: number,
    size: [number, number],
    isActive: boolean,
  ) => ReactNode | null;

  /** Whether audio is currently muted. Defaults to `true`. */
  isMuted: boolean;

  /** Toggle the muted state. */
  onToggleMute: () => void;

  /** `true` when at least one item has `type: 'video'`. */
  hasVideo: boolean;

  /**
   * Ready-to-use `renderControls` callback with Counter, FullscreenButton,
   * SoundButton (when videos exist), and CloseButton.
   * Pass directly to `LightboxOverlay`'s `renderControls` prop.
   */
  renderControls: (props: LightboxControlsRenderProps) => ReactNode;
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
 * const { renderSlide, renderControls } = useVideoSlideRenderer(items, isOpen);
 *
 * <LightboxOverlay
 *   images={items}
 *   renderSlide={renderSlide}
 *   renderControls={renderControls}
 * />
 * ```
 */
export function useVideoSlideRenderer(
  items: LightboxItem[],
  isOpen?: boolean,
): UseVideoSlideRendererResult {
  const [isMuted, setIsMuted] = useState(true);

  const onToggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const hasVideo = useMemo(
    () => items.some((item) => item.type === 'video'),
    [items],
  );

  // Sync muted state to the shared video element directly —
  // no re-render or renderSlide reference change needed.
  useEffect(() => {
    setLightboxVideoMuted(isMuted);
  }, [isMuted]);

  // Reset to muted when the lightbox closes so the next open can autoplay.
  useEffect(() => {
    if (isOpen === false) {
      setIsMuted(true);
      setLightboxVideoMuted(true);
    }
  }, [isOpen]);

  const renderSlide = useCallback(
    (
      item: LightboxItem,
      index: number,
      size: [number, number],
      isActive: boolean,
    ): ReactNode | null => {
      if ((item.type ?? 'image') !== 'video') return null;

      return (
        <LightboxVideoSlide
          src={item.src}
          poster={item.poster}
          isActive={isActive}
          size={size}
          slideKey={`lightbox-${index}`}
        />
      );
    },
    [],
  );

  const renderControls = useCallback(
    ({
      onClose,
      currentIndex,
      count,
      isFullscreen,
      onToggleFullscreen,
    }: LightboxControlsRenderProps): ReactNode => (
      <>
        <div className="rk-lightbox-controls-left">
          <Counter currentIndex={currentIndex} count={count} />
          <FullscreenButton
            isFullscreen={isFullscreen}
            onToggle={onToggleFullscreen}
          />
          {hasVideo && (
            <SoundButton isMuted={isMuted} onToggle={onToggleMute} />
          )}
        </div>
        <CloseButton onClick={onClose} />
      </>
    ),
    [hasVideo, isMuted, onToggleMute],
  );

  return { renderSlide, isMuted, onToggleMute, hasVideo, renderControls };
}
