import { useContext } from 'react';
import { SoundContext } from './SoundState';
import type { SoundState } from './SoundState';

/**
 * Hook to access the current {@link SoundState} from context.
 *
 * Must be called inside a {@link SoundProvider} (automatically provided
 * by `ReelPlayerOverlay`). Useful in custom controls built via `renderControls`.
 *
 * @throws Error if called outside of a `SoundProvider`.
 *
 * @example
 * ```tsx
 * const soundState = useSoundState();
 * console.log(soundState.muted.value); // true or false
 * soundState.toggle(); // flip mute state
 * ```
 */
export const useSoundState = (): SoundState => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundState must be used within SoundProvider');
  }
  return context;
};
