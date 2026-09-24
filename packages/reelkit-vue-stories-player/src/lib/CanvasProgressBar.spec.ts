import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { createSignal } from '@reelkit/vue';
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
    vi.unstubAllGlobals();
  });

  it('keeps an animation loop running by default', () => {
    mount(CanvasProgressBar, {
      props: {
        totalStories: 3,
        activeIndex: createSignal(1),
        progress: createSignal(0.5),
      },
    });

    expect(frame).toHaveBeenCalled();
  });

  it('draws a still bar once, without an animation loop', () => {
    mount(CanvasProgressBar, {
      props: {
        live: false,
        totalStories: 3,
        activeIndex: createSignal(1),
        progress: createSignal(0.5),
      },
    });

    expect(frame).not.toHaveBeenCalled();
    expect(renderer.draw).toHaveBeenCalledTimes(1);
    expect(renderer.draw).toHaveBeenLastCalledWith(3, 1, 0.5);
  });

  it('redraws a still bar when its signals change', () => {
    const activeIndex = createSignal(0);
    const progress = createSignal(0.25);
    mount(CanvasProgressBar, {
      props: { live: false, totalStories: 3, activeIndex, progress },
    });

    activeIndex.value = 2;
    expect(renderer.draw).toHaveBeenLastCalledWith(3, 2, 0.25);

    progress.value = 1;
    expect(renderer.draw).toHaveBeenLastCalledWith(3, 2, 1);
  });

  // Resizing the canvas clears it, and nothing else would paint a bar that
  // has no animation loop.
  it('redraws a still bar after its container resizes', () => {
    mount(CanvasProgressBar, {
      props: {
        live: false,
        totalStories: 3,
        activeIndex: createSignal(1),
        progress: createSignal(0.5),
      },
    });
    renderer.draw.mockClear();

    resizeCallbacks.forEach((callback) => callback());

    expect(renderer.draw).toHaveBeenCalledWith(3, 1, 0.5);
  });

  it('draws from new signals handed to it after mount', async () => {
    const wrapper = mount(CanvasProgressBar, {
      props: {
        live: false,
        totalStories: 3,
        activeIndex: createSignal(0),
        progress: createSignal(0),
      },
    });

    await wrapper.setProps({
      totalStories: 4,
      activeIndex: createSignal(2),
      progress: createSignal(0.75),
    });

    expect(renderer.draw).toHaveBeenLastCalledWith(4, 2, 0.75);
  });

  it('starts its animation loop when it turns live', async () => {
    const wrapper = mount(CanvasProgressBar, {
      props: {
        live: false,
        totalStories: 3,
        activeIndex: createSignal(0),
        progress: createSignal(0),
      },
    });
    expect(frame).not.toHaveBeenCalled();

    await wrapper.setProps({ live: true });
    await nextTick();

    expect(frame).toHaveBeenCalled();
  });
});
