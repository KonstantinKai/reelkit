import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface Pending {
  index: number;
  resolve: (markdown: string) => void;
  reject: (error: Error) => void;
}

const pending: Pending[] = [];

vi.mock('virtual:reelkit-changelog', () => ({
  ids: ['@reelkit/core@0.3.0', '@reelkit/core@0.2.0', '@reelkit/core@0.1.0'],
  head: '## @reelkit/core@0.4.0 (2026-04-01)\n\n- newest change\n',
  chunkCount: 4,
  loadChunk: vi.fn(
    (index: number) =>
      new Promise<string>((resolve, reject) =>
        pending.push({ index, resolve, reject }),
      ),
  ),
}));

const { loadChunk } = await import('virtual:reelkit-changelog');
const { default: Changelog } = await import('./Changelog');

const chunk = (index: number) =>
  `## @reelkit/core@0.${4 - index}.0 (2026-0${4 - index}-01)\n\n- change ${index}\n`;

let setNearEnd: (near: boolean) => void;
const disconnect = vi.fn();

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        setNearEnd = (near) =>
          callback(
            [{ isIntersecting: near } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
          );
      }
      observe() {
        // The observer reports on its own schedule, which the tests drive.
      }
      disconnect = disconnect;
    },
  );
});

afterEach(() => {
  cleanup();
  pending.length = 0;
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const headings = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('h2')).map((h2) => h2.textContent);

async function settle(
  index: number,
  outcome: 'resolve' | 'reject' = 'resolve',
) {
  const request = pending.find((entry) => entry.index === index);
  if (!request) throw new Error(`chunk ${index} was never requested`);
  pending.splice(pending.indexOf(request), 1);
  await act(async () => {
    if (outcome === 'resolve') request.resolve(chunk(index));
    else request.reject(new Error('offline'));
  });
}

describe('changelog page', () => {
  it('prerenders the newest releases', () => {
    const html = renderToString(<Changelog />);
    expect(html).toContain('@reelkit/core@0.4.0 (2026-04-01)');
    expect(html).not.toContain('No changelog entries yet');
    expect(loadChunk).not.toHaveBeenCalled();
  });

  it('loads the next chunk once the reader nears the end', async () => {
    const { container } = render(<Changelog />);
    const first = container.querySelector('h2');
    act(() => setNearEnd(true));
    expect(vi.mocked(loadChunk).mock.calls).toEqual([[1]]);
    expect(screen.getByText('Loading older releases…')).toBeTruthy();

    act(() => setNearEnd(false));
    await settle(1);
    expect(headings(container)).toEqual([
      '@reelkit/core@0.4.0 (2026-04-01)',
      '@reelkit/core@0.3.0 (2026-03-01)',
    ]);
    // The head stays the same element: appending never re-renders it.
    expect(container.querySelector('h2')).toBe(first);
    expect(loadChunk).toHaveBeenCalledTimes(1);
  });

  it('keeps loading while the end stays in view', async () => {
    render(<Changelog />);
    act(() => setNearEnd(true));
    await settle(1);
    expect(vi.mocked(loadChunk).mock.calls).toEqual([[1], [2]]);
  });

  it('never requests a chunk twice or out of order', async () => {
    const { container } = render(<Changelog />);
    act(() => setNearEnd(true));
    act(() => setNearEnd(false));
    act(() => setNearEnd(true));
    fireEvent.click(screen.getByRole('button'));
    expect(vi.mocked(loadChunk).mock.calls).toEqual([[1]]);

    await settle(1);
    await settle(2);
    await settle(3);
    expect(vi.mocked(loadChunk).mock.calls).toEqual([[1], [2], [3]]);
    expect(headings(container)).toEqual([
      '@reelkit/core@0.4.0 (2026-04-01)',
      '@reelkit/core@0.3.0 (2026-03-01)',
      '@reelkit/core@0.2.0 (2026-02-01)',
      '@reelkit/core@0.1.0 (2026-01-01)',
    ]);
  });

  it('shows every release from the button alone, without an observer', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { container } = render(<Changelog />);
    fireEvent.click(screen.getByRole('button', { name: 'Show all releases' }));
    await settle(1);
    await settle(2);
    await settle(3);
    expect(headings(container)).toHaveLength(4);
  });

  it('removes the loader and stops observing once everything is shown', async () => {
    render(<Changelog />);
    fireEvent.click(screen.getByRole('button', { name: 'Show all releases' }));
    await settle(1);
    await settle(2);
    expect(disconnect).not.toHaveBeenCalled();
    await settle(3);
    expect(screen.queryByRole('button')).toBeNull();
    expect(disconnect).toHaveBeenCalled();
  });

  it('reports a failed chunk and retries the same one', async () => {
    const { container } = render(<Changelog />);
    act(() => setNearEnd(true));
    await settle(1);
    await settle(2, 'reject');
    expect(screen.getByText('Older releases failed to load.')).toBeTruthy();
    expect(headings(container)).toHaveLength(2);
    expect(pending).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(vi.mocked(loadChunk).mock.calls.at(-1)).toEqual([2]);
    await settle(2);
    expect(headings(container)).toHaveLength(3);
  });
});
