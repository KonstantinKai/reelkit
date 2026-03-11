import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface SoundState {
  muted: boolean;
  disabled: boolean;
  toggle: () => void;
  setMuted: (value: boolean) => void;
  setDisabled: (value: boolean) => void;
}

const SoundContext = createContext<SoundState | null>(null);

export const useSoundState = (): SoundState => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundState must be used within SoundProvider');
  }
  return context;
};

interface SoundProviderProps {
  children: React.ReactNode;
}

export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const [muted, setMuted] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const toggle = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  const value = useMemo<SoundState>(
    () => ({
      muted,
      disabled,
      toggle,
      setMuted,
      setDisabled,
    }),
    [muted, disabled, toggle]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
};
