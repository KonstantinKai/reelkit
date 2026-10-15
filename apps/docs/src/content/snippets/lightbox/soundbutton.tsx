import { SoundButton } from '@reelkit/react-lightbox';
import { useSoundState } from '@reelkit/react';

// Inside a component wrapped in SoundProvider:
function CustomControls({ onClose }) {
  const soundState = useSoundState();

  return (
    <div>
      <SoundButton
        isMuted={soundState.muted.value}
        onToggle={soundState.toggle}
      />
      <button onClick={onClose}>Close</button>
    </div>
  );
}
