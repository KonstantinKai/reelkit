import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GridToPlayerDemo } from './GridToPlayerDemo';

beforeEach(() => {
  vi.useFakeTimers();
  // jsdom has no layout, and the player mounts no slide before it has a size.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private readonly callback: ResizeObserverCallback) {}
      observe(element: Element) {
        Object.defineProperty(element, 'clientWidth', { value: 360 });
        Object.defineProperty(element, 'clientHeight', { value: 640 });
        this.callback([], this as unknown as ResizeObserver);
      }
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
  // jsdom implements neither media playback nor window scrolling, which the
  // player uses for video slides and the body lock.
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockReturnValue(undefined);
  vi.spyOn(window, 'scrollTo').mockReturnValue(undefined);
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function advance(milliseconds: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
  });
}

const thumbnail = (n: number) =>
  screen.getByRole('button', { name: `Open Post ${n}` });

async function press(key: string) {
  fireEvent.keyDown(window, { key });
  await advance(600);
}

describe('grid to player recipe demo', () => {
  it('opens the player at the tapped post', async () => {
    render(<GridToPlayerDemo />);

    fireEvent.click(thumbnail(3));
    await advance(100);

    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  // The player hands focus back to the thumbnail that opened it; the recipe
  // then moves it on to the post the viewer stopped at.
  it('returns focus to the thumbnail of the last post watched', async () => {
    render(<GridToPlayerDemo />);
    thumbnail(2).focus();
    fireEvent.click(thumbnail(2));
    await advance(100);

    await press('ArrowDown');
    await press('ArrowDown');
    await press('Escape');
    await advance(100);

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(thumbnail(4));
    expect(thumbnail(4).scrollIntoView).toHaveBeenCalled();
  });

  it('returns focus to the opening thumbnail when the viewer did not move', async () => {
    render(<GridToPlayerDemo />);
    thumbnail(5).focus();
    fireEvent.click(thumbnail(5));
    await advance(100);

    await press('Escape');
    await advance(100);

    expect(document.activeElement).toBe(thumbnail(5));
  });
});
