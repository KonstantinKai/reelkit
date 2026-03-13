import React, { createContext, useMemo } from 'react';
import { createSignal, type Signal } from '@reelkit/core';

/**
 * Reactive sound state shared across the reel player.
 *
 * Provided automatically by `ReelPlayerOverlay` via {@link SoundProvider}.
 * Access it in custom controls with the {@link useSoundState} hook.
 *
 * Both `muted` and `disabled` are reactive {@link Signal} instances — subscribe
 * to them with `signal.observe()` or read with `signal.value`.
 */
export interface SoundState {
  /** Whether audio is muted. Defaults to `true` (muted). */
  muted: Signal<boolean>;

  /**
   * Whether sound controls should be hidden/disabled.
   * Set to `true` when the active slide has no video content.
   */
  disabled: Signal<boolean>;

  /** Toggles the muted state. */
  toggle: () => void;
}

/** @internal */
export const SoundContext = createContext<SoundState | null>(null);

interface SoundProviderProps {
  children: React.ReactNode;
}

/**
 * Context provider for {@link SoundState}.
 *
 * Automatically wraps `ReelPlayerOverlay` content — you don't need to
 * render this manually unless building a fully custom player.
 *
 * Creates a single `SoundState` instance with `muted: true` and
 * `disabled: false` as initial values.
 */
export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const value = useMemo<SoundState>(() => {
    const muted = createSignal(true);
    const disabled = createSignal(false);
    return {
      muted,
      disabled,
      toggle: () => {
        muted.value = !muted.value;
      },
    };
  }, []);

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
};
