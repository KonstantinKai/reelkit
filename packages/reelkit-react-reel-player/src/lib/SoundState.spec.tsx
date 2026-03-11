import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SoundProvider, useSoundState } from './SoundState';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SoundProvider>{children}</SoundProvider>
);

describe('SoundState', () => {
  it('has default muted=true', () => {
    const { result } = renderHook(() => useSoundState(), { wrapper });

    expect(result.current.muted).toBe(true);
  });

  it('has default disabled=false', () => {
    const { result } = renderHook(() => useSoundState(), { wrapper });

    expect(result.current.disabled).toBe(false);
  });

  it('toggles muted state', () => {
    const { result } = renderHook(() => useSoundState(), { wrapper });

    act(() => result.current.toggle());

    expect(result.current.muted).toBe(false);

    act(() => result.current.toggle());

    expect(result.current.muted).toBe(true);
  });

  it('sets muted directly', () => {
    const { result } = renderHook(() => useSoundState(), { wrapper });

    act(() => result.current.setMuted(false));

    expect(result.current.muted).toBe(false);

    act(() => result.current.setMuted(true));

    expect(result.current.muted).toBe(true);
  });

  it('sets disabled directly', () => {
    const { result } = renderHook(() => useSoundState(), { wrapper });

    act(() => result.current.setDisabled(true));

    expect(result.current.disabled).toBe(true);

    act(() => result.current.setDisabled(false));

    expect(result.current.disabled).toBe(false);
  });

  it('throws when used outside SoundProvider', () => {
    expect(() => {
      renderHook(() => useSoundState());
    }).toThrow('useSoundState must be used within SoundProvider');
  });

  it('provides stable toggle reference across rerenders', () => {
    const { result, rerender } = renderHook(() => useSoundState(), { wrapper });

    const firstToggle = result.current.toggle;

    rerender();

    expect(result.current.toggle).toBe(firstToggle);
  });
});
