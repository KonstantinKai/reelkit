import React from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';
import { Observe, useSoundState } from '@reelkit/react';

/** Props for the {@link CloseButton} sub-component. */
export interface CloseButtonProps {
  /** CSS class name. Defaults to `"rk-reel-close-btn"`. */
  className?: string;

  /** Additional inline styles merged on top of the default button styles. */
  style?: React.CSSProperties;

  /** Callback fired when the button is clicked. */
  onClick: () => void;
}

/**
 * Reusable close button rendered as an absolutely-positioned circular icon
 * in the top-right corner. Intended for use inside `renderControls`.
 *
 * @example
 * ```tsx
 * <ReelPlayerOverlay
 *   renderControls={({ onClose }) => <CloseButton onClick={onClose} />}
 *   ...
 * />
 * ```
 */
export const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  className = 'rk-reel-close-btn',
  style,
}) => (
  <button
    onClick={onClick}
    className={`rk-reel-button ${className}`}
    style={style}
    aria-label="Close"
  >
    <X size={24} />
  </button>
);

/** Props for the {@link SoundButton} sub-component. */
export interface SoundButtonProps {
  /**
   * When true, the button appears dimmed and click events are ignored.
   * Useful when the active slide contains an image instead of a video.
   * Defaults to `false`.
   */
  disabled?: boolean;

  /** CSS class name. Defaults to `"rk-reel-sound-btn"`. */
  className?: string;

  /** Additional inline styles merged on top of the default button styles. */
  style?: React.CSSProperties;
}

/**
 * Reusable mute/unmute toggle button rendered as an absolutely-positioned
 * circular icon in the bottom-right corner.
 *
 * Must be rendered inside a {@link SoundProvider} (automatically provided
 * by `ReelPlayerOverlay`). Reads mute state from {@link SoundState} context.
 *
 * The button is hidden when `SoundState.disabled` is `true` (i.e. the
 * active slide has no video content).
 *
 * @example
 * ```tsx
 * <ReelPlayerOverlay
 *   renderControls={({ onClose }) => (
 *     <>
 *       <CloseButton onClick={onClose} />
 *       <SoundButton />
 *     </>
 *   )}
 *   ...
 * />
 * ```
 */
export const SoundButton: React.FC<SoundButtonProps> = ({
  disabled = false,
  className = 'rk-reel-sound-btn',
  style,
}) => {
  const soundState = useSoundState();

  return (
    <Observe signals={[soundState.muted, soundState.disabled]}>
      {() => {
        if (soundState.disabled.value) return null;
        return (
          <button
            onClick={disabled ? undefined : soundState.toggle}
            className={`rk-reel-button ${className}`}
            style={style}
            aria-label={soundState.muted.value ? 'Unmute' : 'Mute'}
            aria-disabled={disabled}
          >
            {soundState.muted.value ? (
              <VolumeX size={22} />
            ) : (
              <Volume2 size={22} />
            )}
          </button>
        );
      }}
    </Observe>
  );
};

/** @internal Props for the default PlayerControls used by ReelPlayerOverlay. */
interface PlayerControlsProps {
  showSound?: boolean;
  soundDisabled?: boolean;
  onClose: () => void;
}

/**
 * Default player controls composing {@link CloseButton} and {@link SoundButton}.
 * Used internally by `ReelPlayerOverlay` when no `renderControls` is provided.
 * @internal
 */
const PlayerControls: React.FC<PlayerControlsProps> = ({
  onClose,
  showSound = false,
  soundDisabled = false,
}) => (
  <>
    <CloseButton onClick={onClose} />
    {showSound && <SoundButton disabled={soundDisabled} />}
  </>
);

export default PlayerControls;
