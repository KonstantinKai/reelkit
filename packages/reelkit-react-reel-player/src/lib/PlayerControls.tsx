import React from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';
import { ValueNotifierObserver } from '@reelkit/react';
import { useSoundState } from './useSoundState';

const buttonStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: '50%',
  backgroundColor: 'rgba(0,0,0,0.5)',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.2s',
};

/** Props for the {@link CloseButton} sub-component. */
export interface CloseButtonProps {
  /** Callback fired when the button is clicked. */
  onClick: () => void;
  /** CSS class name. Defaults to `"player-close-btn"`. */
  className?: string;
  /** Additional inline styles merged on top of the default button styles. */
  style?: React.CSSProperties;
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
  className = 'player-close-btn',
  style,
}) => (
  <button
    onClick={onClick}
    className={className}
    style={{
      ...buttonStyle,
      position: 'absolute',
      top: 16,
      right: 16,
      zIndex: 10,
      ...style,
    }}
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
  /** CSS class name. Defaults to `"player-sound-btn"`. */
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
  className = 'player-sound-btn',
  style,
}) => {
  const soundState = useSoundState();

  return (
    <ValueNotifierObserver deps={[soundState.muted, soundState.disabled]}>
      {() => {
        if (soundState.disabled.value) return <></>;
        return (
          <button
            onClick={disabled ? undefined : soundState.toggle}
            className={className}
            style={{
              ...buttonStyle,
              position: 'absolute',
              bottom: 16,
              right: 16,
              zIndex: 10,
              opacity: disabled ? 0.4 : 1,
              cursor: disabled ? 'default' : 'pointer',
              transition: 'opacity 0.2s, background-color 0.2s',
              ...style,
            }}
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
    </ValueNotifierObserver>
  );
};

/** @internal Props for the default PlayerControls used by ReelPlayerOverlay. */
interface PlayerControlsProps {
  onClose: () => void;
  showSound?: boolean;
  soundDisabled?: boolean;
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
