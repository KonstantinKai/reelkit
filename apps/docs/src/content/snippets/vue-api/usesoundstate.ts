import { useSoundState } from '@reelkit/vue';

// Inside a SoundProvider descendant
const sound = useSoundState();

sound.muted;    // Signal<boolean>
sound.toggle(); // Toggle muted state
