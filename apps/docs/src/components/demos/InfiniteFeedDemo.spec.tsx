import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InfiniteFeedDemo } from './InfiniteFeedDemo';
import { failNextRequest } from '../../content/snippets/recipes/infinite-feed/api';

beforeEach(() => {
  vi.useFakeTimers();
  // jsdom has no layout, and the feed mounts no slide before it has a size.
  // The reel measures the element itself, so the stub gives it one before
  // reporting the change.
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
});

afterEach(() => {
  cleanup();
  // The switch lives in the shared api module, so a test that arms it without
  // a request to use it up would fail the first request of the next test.
  failNextRequest.value = false;
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function advance(milliseconds: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
  });
}

// One press of the feed's own button per slide, spaced past the slide
// transition so each one lands as its own step.
async function scrollDown(slides: number) {
  for (let i = 0; i < slides; i++) {
    fireEvent.click(screen.getByRole('button', { name: 'Next post' }));
    await advance(600);
  }
}

describe('infinite feed recipe demo', () => {
  it('shows the loading slide until the first page arrives', async () => {
    render(<InfiniteFeedDemo />);
    expect(screen.getByText('Loading…')).toBeTruthy();

    await advance(800);
    expect(screen.getByText('Post 1')).toBeTruthy();
    expect(screen.queryByText('Loading…')).toBeNull();
  });

  it('fetches the next page before the viewer reaches the end', async () => {
    render(<InfiniteFeedDemo />);
    await advance(800);

    await scrollDown(3);
    await advance(800);
    await scrollDown(3);

    expect(screen.getByText('Post 7')).toBeTruthy();
  });

  it('shows the failure switch armed until a request uses it up', async () => {
    render(<InfiniteFeedDemo />);
    const failSwitch = screen.getByRole('button', {
      name: 'Fail next request',
    });
    expect(failSwitch.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(failSwitch);
    expect(failSwitch.getAttribute('aria-pressed')).toBe('true');
    expect(failSwitch.textContent).toBe('Next request fails');

    await advance(800);
    expect(failSwitch.getAttribute('aria-pressed')).toBe('false');
    expect(failSwitch.textContent).toBe('Fail next request');
  });

  it('disarms the failure switch on a second press', () => {
    render(<InfiniteFeedDemo />);
    const failSwitch = screen.getByRole('button', {
      name: 'Fail next request',
    });

    fireEvent.click(failSwitch);
    fireEvent.click(failSwitch);

    expect(failSwitch.getAttribute('aria-pressed')).toBe('false');
  });

  it('shows the error slide for a failed page and recovers on Retry', async () => {
    render(<InfiniteFeedDemo />);
    fireEvent.click(screen.getByText('Fail next request'));
    await advance(800);

    expect(screen.getByText('The feed could not be loaded.')).toBeTruthy();

    fireEvent.click(screen.getByText('Retry'));
    expect(screen.getByText('Loading…')).toBeTruthy();
    await advance(800);
    expect(screen.getByText('Post 1')).toBeTruthy();
  });

  it('cancels the request in flight when the feed unmounts', async () => {
    const abort = vi.spyOn(AbortController.prototype, 'abort');
    const { unmount } = render(<InfiniteFeedDemo />);

    unmount();

    expect(abort).toHaveBeenCalled();
  });
});
