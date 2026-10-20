import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StoriesTrayDemo } from './StoriesTrayDemo';

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.removeItem('stories-tray-seen');
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

const ring = (name: string) =>
  screen.getByRole('button', { name: `${name}'s stories` });

// jsdom never loads an image, and the player counts a story from its load.
async function loadImages() {
  for (const image of screen.getByRole('dialog').querySelectorAll('img')) {
    fireEvent.load(image);
  }
  await advance(0);
}

async function openStories(name: string) {
  ring(name).focus();
  fireEvent.click(ring(name));
  await advance(200);
  await loadImages();
}

// The player's buttons act on a press and release, so a long press can hold
// the story instead.
async function nextStory() {
  const next = screen.getByRole('button', { name: 'Next story' });
  fireEvent.pointerDown(next);
  fireEvent.pointerUp(next);
  await advance(600);
  await loadImages();
}

async function close() {
  fireEvent.keyDown(window, { key: 'Escape' });
  await advance(600);
}

// The story on screen: the image inside the group and the story that are not
// held inert as neighbours.
const currentStory = () =>
  screen
    .getByRole('dialog')
    .querySelector(
      '[role="tabpanel"]:not([inert]) [role="tabpanel"]:not([inert]) img',
    )
    ?.getAttribute('src');

describe('stories tray recipe demo', () => {
  it('opens the player at the person whose ring was pressed', async () => {
    render(<StoriesTrayDemo />);
    await openStories('Mike');

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(currentStory()).toContain('story-005');
  });

  // The player hands focus back to the ring that opened it; the recipe then
  // moves it on to the person the viewer stopped at.
  it('returns focus to the ring of the last person watched', async () => {
    render(<StoriesTrayDemo />);
    await openStories('Alex');

    await nextStory();
    await nextStory();
    await nextStory();
    expect(currentStory()).toContain('story-004');
    await close();

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(ring('Sarah'));
  });

  it('remembers a person watched to the end after a remount', async () => {
    const { unmount } = render(<StoriesTrayDemo />);
    expect(ring('Sarah').className).toContain('rk-stories-ring--active');

    await openStories('Sarah');
    await close();
    unmount();

    render(<StoriesTrayDemo />);
    await advance(0);
    expect(ring('Sarah').className).not.toContain('rk-stories-ring--active');
    expect(ring('Alex').className).toContain('rk-stories-ring--active');
  });

  it('reopens a person part way through at the first story not seen', async () => {
    render(<StoriesTrayDemo />);
    await openStories('Alex');
    await nextStory();
    await close();

    await openStories('Alex');

    expect(currentStory()).toContain('story-003');
  });

  it('forgets what was seen on request', async () => {
    render(<StoriesTrayDemo />);
    await openStories('Sarah');
    await close();
    expect(ring('Sarah').className).not.toContain('rk-stories-ring--active');

    fireEvent.click(
      screen.getByRole('button', { name: 'Forget what was seen' }),
    );
    await advance(0);

    expect(ring('Sarah').className).toContain('rk-stories-ring--active');
  });
});
