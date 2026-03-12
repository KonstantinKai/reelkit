import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SoundProvider } from './SoundState';
import { useSoundState } from './useSoundState';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SoundProvider>{children}</SoundProvider>
);

describe('SoundState', () => {
  it('has default muted=true', () => {
    const { result } = renderHook(() => useSoundState(), { wrapper });

    expect(result.current.muted.value).toBe(true);
  });

  it('has default disabled=false', () => {
    const { result } = renderHook(() => useSoundState(), { wrapper });

    expect(result.current.disabled.value).toBe(false);
  });

  it('toggles muted state', () => {
    const { result } = renderHook(() => useSoundState(), { wrapper });

    act(() => result.current.toggle());

    expect(result.current.muted.value).toBe(false);

    act(() => result.current.toggle());

    expect(result.current.muted.value).toBe(true);
  });

  it('sets muted directly', () => {
    const { result } = renderHook(() => useSoundState(), { wrapper });

    act(() => {
      result.current.muted.value = false;
    });

    expect(result.current.muted.value).toBe(false);

    act(() => {
      result.current.muted.value = true;
    });

    expect(result.current.muted.value).toBe(true);
  });

  it('sets disabled directly', () => {
    const { result } = renderHook(() => useSoundState(), { wrapper });

    act(() => {
      result.current.disabled.value = true;
    });

    expect(result.current.disabled.value).toBe(true);

    act(() => {
      result.current.disabled.value = false;
    });

    expect(result.current.disabled.value).toBe(false);
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
