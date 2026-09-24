import { render, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSignal } from '@reelkit/react';
import { CanvasProgressBar } from './CanvasProgressBar';

const renderer = vi.hoisted(() => ({
  attach: vi.fn(),
  draw: vi.fn(),
  dispose: vi.fn(),
  width: 300,
}));

vi.mock('@reelkit/stories-core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@reelkit/stories-core')>()),
  createCanvasProgressRenderer: () => renderer,
}));

let resizeCallbacks: (() => void)[] = [];

describe('CanvasProgressBar', () => {
  const frame = vi.fn((_cb: FrameRequestCallback) => 1);

  beforeEach(() => {
    resizeCallbacks = [];
    renderer.attach.mockClear();
    renderer.draw.mockClear();
    renderer.dispose.mockClear();
    frame.mockClear();
    vi.stubGlobal('requestAnimationFrame', frame);
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          resizeCallbacks.push(callback);
        }
        observe() {
          /* noop */
        }
        disconnect() {
          /* noop */
        }
      },
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('keeps an animation loop running by default', () => {
    render(
      <CanvasProgressBar
        totalStories={3}
        activeIndex={createSignal(1)}
        progress={createSignal(0.5)}
      />,
    );

    expect(frame).toHaveBeenCalled();
  });

  it('draws a still bar once, without an animation loop', () => {
    render(
      <CanvasProgressBar
        live={false}
        totalStories={3}
        activeIndex={createSignal(1)}
        progress={createSignal(0.5)}
      />,
    );

    expect(frame).not.toHaveBeenCalled();
    expect(renderer.draw).toHaveBeenCalledTimes(1);
    expect(renderer.draw).toHaveBeenLastCalledWith(3, 1, 0.5);
  });

  it('redraws a still bar when its signals change', () => {
    const activeIndex = createSignal(0);
    const progress = createSignal(0.25);
    render(
      <CanvasProgressBar
        live={false}
        totalStories={3}
        activeIndex={activeIndex}
        progress={progress}
      />,
    );

    act(() => {
      activeIndex.value = 2;
    });
    expect(renderer.draw).toHaveBeenLastCalledWith(3, 2, 0.25);

    act(() => {
      progress.value = 1;
    });
    expect(renderer.draw).toHaveBeenLastCalledWith(3, 2, 1);
  });

  // Resizing the canvas clears it, and nothing else would paint a bar that
  // has no animation loop.
  it('redraws a still bar after its container resizes', () => {
    render(
      <CanvasProgressBar
        live={false}
        totalStories={3}
        activeIndex={createSignal(1)}
        progress={createSignal(0.5)}
      />,
    );
    renderer.draw.mockClear();

    act(() => resizeCallbacks.forEach((callback) => callback()));

    expect(renderer.draw).toHaveBeenCalledWith(3, 1, 0.5);
  });

  it('draws from new signals handed to it after mount', () => {
    const { rerender } = render(
      <CanvasProgressBar
        live={false}
        totalStories={3}
        activeIndex={createSignal(0)}
        progress={createSignal(0)}
      />,
    );

    rerender(
      <CanvasProgressBar
        live={false}
        totalStories={3}
        activeIndex={createSignal(2)}
        progress={createSignal(0.75)}
      />,
    );

    expect(renderer.draw).toHaveBeenLastCalledWith(3, 2, 0.75);
  });

  it('starts its animation loop when it turns live', () => {
    const { rerender } = render(
      <CanvasProgressBar
        live={false}
        totalStories={3}
        activeIndex={createSignal(0)}
        progress={createSignal(0)}
      />,
    );
    expect(frame).not.toHaveBeenCalled();

    rerender(
      <CanvasProgressBar
        totalStories={3}
        activeIndex={createSignal(0)}
        progress={createSignal(0)}
      />,
    );

    expect(frame).toHaveBeenCalled();
  });
});
