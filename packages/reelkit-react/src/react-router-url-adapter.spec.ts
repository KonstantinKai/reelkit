import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useReactRouterUrlAdapter } from './react-router-url-adapter';

// A mutable location the mocked router hands back, so a rerender can stand in
// for a real navigation.
let location: {
  key: string;
  search: string;
  state: unknown;
};
const navigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
  useLocation: () => location,
}));

beforeEach(() => {
  location = { key: 'a', search: '?photo=1', state: null };
  navigate.mockReset();
});

describe('useReactRouterUrlAdapter', () => {
  it('reads the router location search', () => {
    const { result } = renderHook(() => useReactRouterUrlAdapter());
    expect(result.current.read()).toBe('?photo=1');
  });

  it('notifies subscribers when the location key or search changes', () => {
    const { result, rerender } = renderHook(() => useReactRouterUrlAdapter());
    const listener = vi.fn();
    act(() => {
      result.current.subscribe(listener);
    });

    location = { key: 'b', search: '?photo=2', state: null };
    rerender();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('stops notifying after unsubscribe', () => {
    const { result, rerender } = renderHook(() => useReactRouterUrlAdapter());
    const listener = vi.fn();
    let dispose!: () => void;
    act(() => {
      dispose = result.current.subscribe(listener);
      dispose();
    });

    location = { key: 'b', search: '?photo=2', state: null };
    rerender();

    expect(listener).not.toHaveBeenCalled();
  });

  it('pushes through the router, starting the entry from the given state', () => {
    const { result } = renderHook(() => useReactRouterUrlAdapter());
    result.current.push('?photo=3', { open: true });
    expect(navigate).toHaveBeenCalledWith('?photo=3', {
      state: { open: true },
    });
  });

  it('merges new state into the current entry state on replace', () => {
    location = { key: 'a', search: '?photo=1', state: { keep: 1 } };
    const { result } = renderHook(() => useReactRouterUrlAdapter());
    result.current.replace('?photo=1', { added: 2 });
    expect(navigate).toHaveBeenCalledWith('?photo=1', {
      replace: true,
      state: { keep: 1, added: 2 },
    });
  });

  it('reads the state attached to the current entry', () => {
    location = { key: 'a', search: '', state: { marker: 'x' } };
    const { result } = renderHook(() => useReactRouterUrlAdapter());
    expect(result.current.getState()).toEqual({ marker: 'x' });
  });

  it('steps back one entry through the router', () => {
    const { result } = renderHook(() => useReactRouterUrlAdapter());
    result.current.goBack();
    expect(navigate).toHaveBeenCalledWith(-1);
  });
});
