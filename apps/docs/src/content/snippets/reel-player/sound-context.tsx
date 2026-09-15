import { SoundProvider, useSoundState } from '@reelkit/react';

// ReelPlayerOverlay wraps itself in a SoundProvider.
// Access sound state inside custom controls:
function CustomControls() {
  const soundState = useSoundState();

  return (
    <button onClick={soundState.toggle}>
      {soundState.muted.value ? 'Unmute' : 'Mute'}
    </button>
  );
}
