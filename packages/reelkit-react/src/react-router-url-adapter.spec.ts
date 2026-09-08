import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createElement, type ReactNode } from 'react';
import {
  MemoryRouter,
  useLocation,
  useNavigate,
  type Location,
  type NavigateFunction,
} from 'react-router-dom';
import { urlIndexKey, type UrlChange } from '@reelkit/core';
import { useOverlayUrlState } from './lib/useOverlayUrlState';
import { useReactRouterUrlAdapter } from './react-router-url-adapter';

// A real router in memory, so every notification, every state round trip,
// and every back step is the router's own doing rather than a mock's.
const withRouter =
  (initialEntries: string[]) =>
  ({ children }: { children: ReactNode }) =>
    createElement(MemoryRouter, { initialEntries }, children);

/** The adapter plus the router's own navigate and location, for driving it. */
const renderAdapter = (initialEntries: string[] = ['/gallery?photo=1']) => {
  const rendered = renderHook(
    () => ({
      adapter: useReactRouterUrlAdapter(),
      navigate: useNavigate(),
      location: useLocation(),
    }),
    { wrapper: withRouter(initialEntries) },
  );
  const changes: Array<UrlChange | undefined> = [];
  act(() => {
    rendered.result.current.adapter.subscribe((change) => changes.push(change));
  });
  return { ...rendered, changes };
};

const here = (location: Location) =>
  `${location.pathname}${location.search}${location.hash}`;

describe('useReactRouterUrlAdapter', () => {
  it('reads the router location search, without the hash', () => {
    const { result } = renderAdapter(['/gallery?photo=1#details']);
    expect(result.current.adapter.read()).toBe('?photo=1');
  });

  it('reports a same-page push made through the router as push evidence', () => {
    const { result, changes } = renderAdapter(['/gallery']);

    act(() => result.current.navigate('?photo=2'));

    expect(result.current.adapter.read()).toBe('?photo=2');
    expect(changes).toEqual([{ kind: 'push' }]);
  });

  it('reports a replace and a back step as such', () => {
    const { result, changes } = renderAdapter(['/gallery']);

    act(() => result.current.navigate('?photo=2'));
    act(() => result.current.navigate('?photo=3', { replace: true }));
    act(() => result.current.navigate(-1));

    expect(changes).toEqual([
      { kind: 'push' },
      { kind: 'replace' },
      { kind: 'pop' },
    ]);
    expect(result.current.adapter.read()).toBe('');
  });

  it('reports no evidence for a push that arrived from another page', () => {
    const { result, changes } = renderAdapter(['/home']);

    act(() => result.current.navigate('/gallery?photo=2'));

    expect(result.current.adapter.read()).toBe('?photo=2');
    expect(changes).toEqual([undefined]);
  });

  it('stops notifying after unsubscribe', () => {
    const { result } = renderAdapter(['/gallery']);
    const listener = vi.fn();
    act(() => {
      result.current.adapter.subscribe(listener)();
    });

    act(() => result.current.navigate('?photo=2'));

    expect(listener).not.toHaveBeenCalled();
  });

  it('keeps the pathname and hash through push, replace, and removal', () => {
    const { result } = renderAdapter(['/gallery#details']);

    act(() => result.current.adapter.push('?photo=2'));
    expect(here(result.current.location)).toBe('/gallery?photo=2#details');

    act(() => result.current.adapter.replace('?photo=3'));
    expect(here(result.current.location)).toBe('/gallery?photo=3#details');

    act(() => result.current.adapter.replace(''));
    expect(here(result.current.location)).toBe('/gallery#details');
  });

  it('starts a pushed entry from the given state and merges on replace', () => {
    const { result } = renderAdapter(['/gallery']);

    act(() => result.current.adapter.push('?photo=2', { open: true }));
    expect(result.current.adapter.getState()).toEqual({ open: true });

    act(() => result.current.adapter.replace('?photo=3', { seen: 1 }));
    expect(result.current.adapter.getState()).toEqual({ open: true, seen: 1 });
  });

  it('steps back one entry through the router', () => {
    const { result } = renderAdapter(['/gallery']);

    act(() => result.current.navigate('?photo=2'));
    act(() => result.current.adapter.goBack());

    expect(result.current.adapter.read()).toBe('');
  });
});

describe('useReactRouterUrlAdapter driving a controller', () => {
  /** A controller bound to the router, plus the router's own handles. */
  const renderController = (initialEntries: string[]) => {
    let navigate!: NavigateFunction;
    let location!: Location;
    const rendered = renderHook(
      () => {
        navigate = useNavigate();
        location = useLocation();
        return useOverlayUrlState({
          param: 'photo',
          adapter: useReactRouterUrlAdapter(),
          ...urlIndexKey(() => 5),
        });
      },
      { wrapper: withRouter(initialEntries) },
    );
    return {
      controller: () => rendered.result.current,
      navigate: (to: string | number) =>
        act(() => {
          if (typeof to === 'number') navigate(to);
          else navigate(to);
        }),
      here: () => here(location),
    };
  };

  it('closes a link-opened overlay with one back step, and back afterwards does not reopen it', () => {
    const { controller, navigate, here } = renderController([
      '/gallery#details',
    ]);

    // A same-page link: the router pushes, the adapter vouches for it.
    navigate('?photo=2');
    expect(controller().position.value).toBe(2);

    act(() => controller().set(null));
    expect(here()).toBe('/gallery#details');
    expect(controller().position.value).toBeNull();

    // The pushed entry was popped, so one more step leaves the gallery
    // entirely rather than reopening anything.
    navigate(-1);
    expect(controller().position.value).toBeNull();
  });

  it('clears a cold deep link in place and steps nowhere', () => {
    const { controller, here } = renderController([
      '/home',
      '/gallery?photo=2',
    ]);
    expect(controller().position.value).toBe(2);

    act(() => controller().set(null));

    expect(here()).toBe('/gallery');
    expect(controller().position.value).toBeNull();
  });

  it('opens from a controller write and swipes without adding entries', () => {
    const { controller, navigate, here } = renderController(['/gallery']);

    act(() => controller().set(1));
    expect(controller().position.value).toBe(1);
    expect(here()).toBe('/gallery?photo=1');

    act(() => controller().set(3));
    expect(here()).toBe('/gallery?photo=3');

    act(() => controller().set(null));
    expect(here()).toBe('/gallery');

    // Nothing of the gallery's is left ahead or behind: the memory router
    // started with one entry, and that is where a further back step stays.
    navigate(-1);
    expect(here()).toBe('/gallery');
  });
});
