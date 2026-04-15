import {
  createContext,
  useState,
  useContext,
  type ReactNode,
  type FC,
} from 'react';
import { createSoundController, type SoundController } from '@reelkit/core';

/** @internal */
export const SoundContext = createContext<SoundController | null>(null);

interface SoundProviderProps {
  children: ReactNode;
}

/**
 * Context provider for {@link SoundController}.
 *
 * Wraps overlay content in reel-player, stories-player, and lightbox.
 * Creates a single {@link SoundController} instance with `muted: true`
 * and `disabled: false` as initial values.
 */
export const SoundProvider: FC<SoundProviderProps> = ({ children }) => {
  const value = useState(() => createSoundController())[0];
  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
};

/**
 * Hook to access the current {@link SoundController} from context.
 *
 * Must be called inside a {@link SoundProvider} (automatically provided
 * by overlay components). Useful in custom controls built via render props.
 *
 * @throws Error if called outside of a `SoundProvider`.
 */
export const useSoundState = (): SoundController => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundState must be used within SoundProvider');
  }
  return context;
};
