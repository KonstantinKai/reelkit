import React from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';
import { useSoundState } from './SoundState';

interface PlayerControlsProps {
  onClose: () => void;
  showSound?: boolean;
  soundDisabled?: boolean;
}

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

const PlayerControls: React.FC<PlayerControlsProps> = ({
  onClose,
  showSound = false,
  soundDisabled = false,
}) => {
  const soundState = useSoundState();

  return (
    <>
      {/* Close button - inside player */}
      <button
        onClick={onClose}
        className="player-close-btn"
        style={{
          ...buttonStyle,
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
        }}
        aria-label="Close"
      >
        <X size={24} />
      </button>

      {/* Sound toggle - inside player */}
      {showSound && !soundState.disabled && (
        <button
          onClick={soundDisabled ? undefined : soundState.toggle}
          className="player-sound-btn"
          style={{
            ...buttonStyle,
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 10,
            opacity: soundDisabled ? 0.4 : 1,
            cursor: soundDisabled ? 'default' : 'pointer',
            transition: 'opacity 0.2s, background-color 0.2s',
          }}
          aria-label={soundState.muted ? 'Unmute' : 'Mute'}
          aria-disabled={soundDisabled}
        >
          {soundState.muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
        </button>
      )}
    </>
  );
};

export default PlayerControls;
