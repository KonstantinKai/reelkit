import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VirtualizationDemo } from './VirtualizationDemo';

let setVisible: (visible: boolean) => void;
const disconnect = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        setVisible = (visible) =>
          callback(
            [{ isIntersecting: visible } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
          );
      }
      observe() {
        setVisible(true);
      }
      disconnect = disconnect;
    },
  );
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

async function advance(milliseconds: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
  });
}

const mountedItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-feed-item]')).map((element) =>
    Number(element.getAttribute('data-feed-item')),
  );

describe('virtualization explainer', () => {
  it('prerenders the initial range without waiting for browser measurements', () => {
    const errors = vi.spyOn(console, 'error');
    const html = renderToString(<VirtualizationDemo />);
    expect(html.match(/data-feed-item="\d"/g)).toEqual([
      'data-feed-item="2"',
      'data-feed-item="3"',
      'data-feed-item="4"',
    ]);
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });

  it('keeps shared slide elements while replacing the outgoing neighbor after motion', async () => {
    const { container } = render(<VirtualizationDemo />);
    const retained = container.querySelector('[data-feed-item="3"]');
    expect(mountedItems(container)).toEqual([2, 3, 4]);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await advance(500);
    expect(mountedItems(container)).toEqual([2, 3, 4]);
    await advance(700);
    expect(mountedItems(container)).toEqual([3, 4, 5]);
    expect(container.querySelector('[data-feed-item="3"]')).toBe(retained);
    expect(screen.getByText('Item 2 unmounted · Item 5 mounted')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    await advance(1200);
    expect(mountedItems(container)).toEqual([2, 3, 4]);
    expect(screen.getByText('Item 5 unmounted · Item 2 mounted')).toBeTruthy();
  });

  it('uses two slides at a boundary and stops autoplay after manual navigation', async () => {
    const { container } = render(<VirtualizationDemo />);
    for (let step = 0; step < 2; step++) {
      fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
      await advance(1200);
    }
    expect(mountedItems(container)).toEqual([1, 2]);
    expect(
      (screen.getByRole('button', { name: 'Previous' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    await advance(5000);
    expect(mountedItems(container)).toEqual([1, 2]);
  });

  it('autoplays when visible and pauses scheduling outside the viewport', async () => {
    const { container, unmount } = render(<VirtualizationDemo />);
    await advance(3100);
    expect(mountedItems(container)).toEqual([3, 4, 5]);
    act(() => setVisible(false));
    await advance(5000);
    expect(mountedItems(container)).toEqual([3, 4, 5]);
    act(() => setVisible(true));
    await advance(3100);
    expect(mountedItems(container)).toEqual([4, 5, 6]);
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
