import React from 'react';
import { X, Maximize, Minimize, Volume2, VolumeX } from 'lucide-react';

/**
 * Props for the {@link CloseButton} sub-component.
 */
export interface CloseButtonProps {
  /** Optional CSS class. Defaults to `"rk-lightbox-close"`. */
  className?: string;

  /** Optional inline styles. */
  style?: React.CSSProperties;

  /** Callback to close the lightbox. */
  onClick: () => void;
}

/**
 * Close button sub-component. Renders the default X button used in the
 * lightbox header. Import and compose in a custom `renderControls` callback.
 *
 * @example
 * ```tsx
 * import { CloseButton } from '@reelkit/react-lightbox';
 *
 * <LightboxOverlay
 *   renderControls={({ onClose }) => (
 *     <CloseButton onClick={onClose} />
 *   )}
 * />
 * ```
 */
export const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  className = 'rk-lightbox-close',
  style,
}) => (
  <button
    className={className}
    onClick={onClick}
    title="Close (Esc)"
    style={style}
  >
    <X size={24} />
  </button>
);

/**
 * Props for the {@link Counter} sub-component.
 */
export interface CounterProps {
  /** Zero-based index of the current slide. */
  currentIndex: number;

  /** Total number of images. */
  count: number;

  /** Optional CSS class. Defaults to `"rk-lightbox-counter"`. */
  className?: string;

  /** Optional inline styles. */
  style?: React.CSSProperties;
}

/**
 * Image counter sub-component. Displays "1 / 3" style counter.
 * Import and compose in a custom `renderControls` callback.
 */
export const Counter: React.FC<CounterProps> = ({
  currentIndex,
  count,
  className = 'rk-lightbox-counter',
  style,
}) => (
  <span className={className} style={style}>
    {currentIndex + 1} / {count}
  </span>
);

/**
 * Props for the {@link FullscreenButton} sub-component.
 */
export interface FullscreenButtonProps {
  /** Whether the lightbox is currently in fullscreen mode. */
  isFullscreen: boolean;

  /** Optional CSS class. Defaults to `"rk-lightbox-btn"`. */
  className?: string;

  /** Optional inline styles. */
  style?: React.CSSProperties;

  /** Toggle fullscreen mode. */
  onToggle: () => void;
}

/**
 * Fullscreen toggle sub-component. Renders Maximize or Minimize icon
 * based on the current fullscreen state. Import and compose in a custom
 * `renderControls` callback.
 */
export const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  isFullscreen,
  onToggle,
  className = 'rk-lightbox-btn',
  style,
}) => (
  <button
    className={className}
    onClick={onToggle}
    title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
    style={style}
  >
    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
  </button>
);

/**
 * Props for the {@link SoundButton} sub-component.
 */
export interface SoundButtonProps {
  /** Whether audio is currently muted. */
  isMuted: boolean;

  /** Optional CSS class. Defaults to `"rk-lightbox-btn"`. */
  className?: string;

  /** Optional inline styles. */
  style?: React.CSSProperties;

  /** Callback to toggle the muted state. */
  onToggle: () => void;
}

/**
 * Sound/mute toggle sub-component. Renders Volume2 (unmuted) or VolumeX
 * (muted) icon. Import and compose in a custom `renderControls` callback
 * when using video slides.
 *
 * @example
 * ```tsx
 * import { SoundButton, useVideoSlideRenderer } from '@reelkit/react-lightbox';
 *
 * const { isMuted, onToggleMute } = useVideoSlideRenderer(items);
 * <SoundButton isMuted={isMuted} onToggle={onToggleMute} />
 * ```
 */
export const SoundButton: React.FC<SoundButtonProps> = ({
  isMuted,
  onToggle,
  className = 'rk-lightbox-btn',
  style,
}) => (
  <button
    className={className}
    onClick={onToggle}
    title={isMuted ? 'Unmute' : 'Mute'}
    style={style}
  >
    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
  </button>
);

/** @internal */
interface LightboxControlsProps {
  currentIndex: number;
  count: number;
  isFullscreen: boolean;
  onClose: () => void;
  onToggleFullscreen: () => void;
}

/**
 * Default lightbox controls. Composes CloseButton, Counter, and FullscreenButton.
 * Used internally when no `renderControls` is provided.
 * @internal
 */
const LightboxControls: React.FC<LightboxControlsProps> = ({
  onClose,
  currentIndex,
  count,
  isFullscreen,
  onToggleFullscreen,
}) => (
  <>
    <div className="rk-lightbox-controls-left">
      <Counter currentIndex={currentIndex} count={count} />
      <FullscreenButton
        isFullscreen={isFullscreen}
        onToggle={onToggleFullscreen}
      />
    </div>
    <CloseButton onClick={onClose} />
  </>
);

export default LightboxControls;
