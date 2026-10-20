import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GallerySlideshowDemo } from './GallerySlideshowDemo';
import { photos } from '../../content/snippets/recipes/gallery-slideshow/api';

beforeEach(() => {
  vi.useFakeTimers();
  // jsdom has no layout, and the lightbox mounts no slide before it has a size.
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

// jsdom never loads an image, and the slideshow holds a photo until it has.
async function loadImages() {
  for (const image of screen.getByRole('dialog').querySelectorAll('img')) {
    fireEvent.load(image);
  }
  await advance(0);
}

async function openPhoto(title: string) {
  fireEvent.click(screen.getByRole('button', { name: `Open ${title}` }));
  await advance(100);
  await loadImages();
}

describe('gallery slideshow recipe demo', () => {
  it('opens the lightbox playing a slideshow from the tapped photo', async () => {
    render(<GallerySlideshowDemo />);
    await openPhoto('Coastline');

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByTitle('Pause slideshow')).toBeTruthy();
    expect(screen.getByText('Coastline')).toBeTruthy();
    expect(screen.queryByText('Old town')).toBeNull();

    await advance(3600);
    await loadImages();
    expect(screen.getByText('Old town')).toBeTruthy();
  });

  it('stops the slideshow from its button', async () => {
    render(<GallerySlideshowDemo />);
    await openPhoto('Coastline');

    fireEvent.click(screen.getByTitle('Pause slideshow'));
    await advance(3600);
    await loadImages();

    expect(screen.getByTitle('Play slideshow')).toBeTruthy();
    expect(screen.getByText('Coastline')).toBeTruthy();
    expect(screen.queryByText('Old town')).toBeNull();
  });

  // The download saves the file the photo names for it, under its own name,
  // not the address the slide was shown from.
  it('downloads the original under the photo name', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(new Blob(['photo'])));
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal(
      'URL',
      Object.assign(URL, {
        createObjectURL: vi.fn(() => 'blob:photo'),
        revokeObjectURL: vi.fn(),
      }),
    );
    const saved: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      saved.push(this.download);
    });

    render(<GallerySlideshowDemo />);
    await openPhoto('Coastline');
    fireEvent.click(screen.getByTitle('Download'));
    await advance(100);

    expect(fetch).toHaveBeenCalledWith(photos[1].downloadUrl);
    expect(saved).toEqual(['coastline.jpg']);
  });
});
