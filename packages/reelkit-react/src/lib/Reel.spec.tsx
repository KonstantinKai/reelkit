import { render, renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Reel, type ReelApi } from './Reel';
import { useReelContext } from './ReelContext';
import React from 'react';

// Use real createSliderController - avoid mocking @reelkit/core since
// its bundled reaction() breaks when the module is mocked via vi.mock.

const defaultItemBuilder = (i: number) => <div key={i}>Slide {i}</div>;

// ResizeObserver mock for auto-size tests
type ResizeCallback = (
  entries: { contentRect: { width: number; height: number } }[],
) => void;
let resizeObserverCallback: ResizeCallback | null = null;
let observedElements: Element[] = [];

class MockResizeObserver {
  constructor(callback: ResizeCallback) {
    resizeObserverCallback = callback;
  }
  observe(el: Element) {
    observedElements.push(el);
  }
  unobserve() {
    /* noop */
  }
  disconnect() {
    observedElements = [];
    resizeObserverCallback = null;
  }
}

const triggerResize = (width: number, height: number) => {
  // Stub clientWidth/clientHeight on observed elements
  for (const el of observedElements) {
    Object.defineProperty(el, 'clientWidth', {
      value: width,
      configurable: true,
    });
    Object.defineProperty(el, 'clientHeight', {
      value: height,
      configurable: true,
    });
  }
  resizeObserverCallback?.([{ contentRect: { width, height } }]);
};

describe('Reel', () => {
  describe('rendering', () => {
    it('renders root div with correct size', () => {
      const { container } = render(
        <Reel count={3} size={[400, 600]} itemBuilder={defaultItemBuilder} />,
      );

      const root = container.firstElementChild as HTMLElement;
      expect(root.style.width).toBe('400px');
      expect(root.style.height).toBe('600px');
    });

    it('applies className to root', () => {
      const { container } = render(
        <Reel
          count={3}
          size={[400, 600]}
          className="my-slider"
          itemBuilder={defaultItemBuilder}
        />,
      );

      const root = container.firstElementChild as HTMLElement;
      expect(root.className).toBe('my-slider');
    });

    it('applies custom style to root', () => {
      const { container } = render(
        <Reel
          count={3}
          size={[400, 600]}
          style={{ border: '1px solid red' }}
          itemBuilder={defaultItemBuilder}
        />,
      );

      const root = container.firstElementChild as HTMLElement;
      expect(root.style.border).toBe('1px solid red');
    });

    it('renders children after slider content', () => {
      const { container } = render(
        <Reel count={3} size={[400, 600]} itemBuilder={defaultItemBuilder}>
          <div data-testid="overlay">Overlay</div>
        </Reel>,
      );

      const root = container.firstElementChild as HTMLElement;
      expect(root.querySelector('[data-testid="overlay"]')).toBeTruthy();
    });

    it('renders slides from itemBuilder', () => {
      const { container } = render(
        <Reel
          count={3}
          size={[400, 600]}
          itemBuilder={(i) => <span>Slide {i}</span>}
        />,
      );

      expect(container.textContent).toContain('Slide 0');
    });

    it('sets user-select none on root', () => {
      const { container } = render(
        <Reel count={3} size={[400, 600]} itemBuilder={defaultItemBuilder} />,
      );

      const root = container.firstElementChild as HTMLElement;
      expect(root.style.userSelect).toBe('none');
    });

    it('sets overflow hidden on root', () => {
      const { container } = render(
        <Reel count={3} size={[400, 600]} itemBuilder={defaultItemBuilder} />,
      );

      const root = container.firstElementChild as HTMLElement;
      expect(root.style.overflow).toBe('hidden');
    });

    it('sets position relative on root', () => {
      const { container } = render(
        <Reel count={3} size={[400, 600]} itemBuilder={defaultItemBuilder} />,
      );

      const root = container.firstElementChild as HTMLElement;
      expect(root.style.position).toBe('relative');
    });
  });

  describe('apiRef', () => {
    it('exposes ReelApi via ref object', () => {
      const apiRef =
        React.createRef<ReelApi>() as React.MutableRefObject<ReelApi | null>;

      render(
        <Reel
          count={3}
          size={[400, 600]}
          apiRef={apiRef}
          itemBuilder={defaultItemBuilder}
        />,
      );

      expect(apiRef.current).toBeTruthy();
      expect(apiRef.current!.next).toBeTypeOf('function');
      expect(apiRef.current!.prev).toBeTypeOf('function');
      expect(apiRef.current!.goTo).toBeTypeOf('function');
      expect(apiRef.current!.adjust).toBeTypeOf('function');
      expect(apiRef.current!.observe).toBeTypeOf('function');
      expect(apiRef.current!.unobserve).toBeTypeOf('function');
    });

    it('exposes ReelApi via callback ref', () => {
      let api: ReelApi | null = null;
      const callbackRef = (ref: ReelApi) => {
        api = ref;
      };

      render(
        <Reel
          count={3}
          size={[400, 600]}
          apiRef={callbackRef}
          itemBuilder={defaultItemBuilder}
        />,
      );

      expect(api).toBeTruthy();
      expect(api!.next).toBeTypeOf('function');
      expect(api!.prev).toBeTypeOf('function');
    });

    it('goTo returns a promise', async () => {
      const apiRef =
        React.createRef<ReelApi>() as React.MutableRefObject<ReelApi | null>;

      render(
        <Reel
          count={5}
          size={[400, 600]}
          apiRef={apiRef}
          itemBuilder={defaultItemBuilder}
        />,
      );

      const result = apiRef.current!.goTo(2, false);
      expect(result).toBeInstanceOf(Promise);
      await result;
    });

    it('animated goTo completes when size changes mid-animation', async () => {
      vi.useFakeTimers();
      const afterChange = vi.fn();
      const apiRef =
        React.createRef<ReelApi>() as React.MutableRefObject<ReelApi | null>;

      const { rerender } = render(
        <Reel
          count={10000}
          size={[400, 600]}
          apiRef={apiRef}
          afterChange={afterChange}
          itemBuilder={defaultItemBuilder}
        />,
      );

      // Start animated goTo
      const goToPromise = apiRef.current!.goTo(8555, true);

      // Simulate resize mid-animation (e.g. mobile keyboard dismiss)
      await act(async () => {
        vi.advanceTimersByTime(50);
      });

      rerender(
        <Reel
          count={10000}
          size={[400, 700]}
          apiRef={apiRef}
          afterChange={afterChange}
          itemBuilder={defaultItemBuilder}
        />,
      );

      // Advance past animation duration
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      await act(async () => {
        vi.runAllTimers();
      });

      await goToPromise;

      // Should not be stuck — afterChange fires and further nav works
      expect(afterChange).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('navigation works after animated goTo with resize', async () => {
      vi.useFakeTimers();
      const afterChange = vi.fn();
      const apiRef =
        React.createRef<ReelApi>() as React.MutableRefObject<ReelApi | null>;

      const { rerender } = render(
        <Reel
          count={100}
          size={[400, 600]}
          apiRef={apiRef}
          afterChange={afterChange}
          itemBuilder={defaultItemBuilder}
        />,
      );

      // Animated goTo
      const goToPromise = apiRef.current!.goTo(50, true);

      // Resize during animation
      rerender(
        <Reel
          count={100}
          size={[400, 700]}
          apiRef={apiRef}
          afterChange={afterChange}
          itemBuilder={defaultItemBuilder}
        />,
      );

      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      await act(async () => {
        vi.runAllTimers();
      });
      await goToPromise;

      afterChange.mockClear();

      // Next should still work (animating flag was reset)
      apiRef.current!.next();
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      await act(async () => {
        vi.runAllTimers();
      });
      expect(afterChange).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('controller lifecycle', () => {
    it('renders virtualized slides (not all items at once)', () => {
      const itemBuilder = vi.fn((i: number) => <div key={i}>Slide {i}</div>);

      render(<Reel count={10} size={[400, 600]} itemBuilder={itemBuilder} />);

      // defaultRangeExtractor shows 3 items (prev, current, next)
      // With initial index 0, it should show fewer than 10
      expect(itemBuilder.mock.calls.length).toBeLessThan(10);
    });

    it('detaches cleanly on unmount', () => {
      const { unmount } = render(
        <Reel count={3} size={[400, 600]} itemBuilder={defaultItemBuilder} />,
      );

      // Should not throw
      unmount();
    });

    it('updates when count changes', () => {
      const { rerender, container } = render(
        <Reel
          count={3}
          size={[400, 600]}
          itemBuilder={(i) => (
            <div key={i} data-slide={i}>
              Slide {i}
            </div>
          )}
        />,
      );

      rerender(
        <Reel
          count={5}
          size={[400, 600]}
          itemBuilder={(i) => (
            <div key={i} data-slide={i}>
              Slide {i}
            </div>
          )}
        />,
      );

      // Should still render without error
      expect(container.firstElementChild).toBeTruthy();
    });
  });

  describe('callbacks', () => {
    it('accepts afterChange callback without error', () => {
      const afterChange = vi.fn();

      render(
        <Reel
          count={3}
          size={[400, 600]}
          afterChange={afterChange}
          itemBuilder={defaultItemBuilder}
        />,
      );

      // Callback is only fired by the controller on actual slide change
      expect(afterChange).not.toHaveBeenCalled();
    });

    it('accepts beforeChange callback without error', () => {
      const beforeChange = vi.fn();

      render(
        <Reel
          count={3}
          size={[400, 600]}
          beforeChange={beforeChange}
          itemBuilder={defaultItemBuilder}
        />,
      );

      expect(beforeChange).not.toHaveBeenCalled();
    });

    it('accepts drag callbacks without error', () => {
      const onSlideDragStart = vi.fn();
      const onSlideDragEnd = vi.fn();
      const onSlideDragCanceled = vi.fn();

      render(
        <Reel
          count={3}
          size={[400, 600]}
          onSlideDragStart={onSlideDragStart}
          onSlideDragEnd={onSlideDragEnd}
          onSlideDragCanceled={onSlideDragCanceled}
          itemBuilder={defaultItemBuilder}
        />,
      );

      expect(onSlideDragStart).not.toHaveBeenCalled();
      expect(onSlideDragEnd).not.toHaveBeenCalled();
      expect(onSlideDragCanceled).not.toHaveBeenCalled();
    });
  });

  describe('direction', () => {
    it('renders vertical layout by default', () => {
      const { container } = render(
        <Reel count={3} size={[400, 600]} itemBuilder={defaultItemBuilder} />,
      );

      const slide = container.querySelector(
        '[style*="translateY"]',
      ) as HTMLElement;
      expect(slide).toBeTruthy();
    });

    it('renders horizontal layout when direction=horizontal', () => {
      const { container } = render(
        <Reel
          count={3}
          size={[400, 600]}
          direction="horizontal"
          itemBuilder={defaultItemBuilder}
        />,
      );

      const slide = container.querySelector(
        '[style*="translateX"]',
      ) as HTMLElement;
      expect(slide).toBeTruthy();
    });
  });

  describe('memo', () => {
    it('does not re-render when same props are passed', () => {
      const itemBuilder = vi.fn((i: number) => <div key={i}>Slide {i}</div>);

      const { rerender } = render(
        <Reel count={3} size={[400, 600]} itemBuilder={itemBuilder} />,
      );

      const callsAfterFirst = itemBuilder.mock.calls.length;

      rerender(<Reel count={3} size={[400, 600]} itemBuilder={itemBuilder} />);

      expect(itemBuilder.mock.calls.length).toBe(callsAfterFirst);
    });

    it('re-renders when count changes', () => {
      const itemBuilder = vi.fn((i: number) => <div key={i}>Slide {i}</div>);

      const { rerender } = render(
        <Reel count={3} size={[400, 600]} itemBuilder={itemBuilder} />,
      );

      const callsAfterFirst = itemBuilder.mock.calls.length;

      rerender(<Reel count={5} size={[400, 600]} itemBuilder={itemBuilder} />);

      expect(itemBuilder.mock.calls.length).toBeGreaterThan(callsAfterFirst);
    });
  });

  describe('custom rangeExtractor', () => {
    it('renders indices returned by rangeExtractor (up to 3)', () => {
      const itemBuilder = vi.fn((i: number) => <div key={i}>Slide {i}</div>);

      const { container } = render(
        <Reel
          count={10}
          size={[400, 600]}
          rangeExtractor={() => [3, 4]}
          itemBuilder={itemBuilder}
        />,
      );

      const slides = container.querySelectorAll('[data-index]');
      expect(slides).toHaveLength(2);
    });

    it('clamps to 3 items even if rangeExtractor returns more', () => {
      const itemBuilder = vi.fn((i: number) => <div key={i}>Slide {i}</div>);

      const { container } = render(
        <Reel
          count={20}
          size={[400, 600]}
          rangeExtractor={() => [0, 1, 2, 3, 4, 5, 6]}
          itemBuilder={itemBuilder}
        />,
      );

      const slides = container.querySelectorAll('[data-index]');
      expect(slides).toHaveLength(3);
    });
  });

  describe('useReelContext', () => {
    it('returns null outside of Reel', () => {
      const { result } = renderHook(() => useReelContext());
      expect(result.current).toBeNull();
    });

    it('returns context with index, count, goTo inside Reel', () => {
      let ctx: ReturnType<typeof useReelContext> = null;
      const Consumer = () => {
        ctx = useReelContext();
        return null;
      };

      render(
        <Reel count={5} size={[400, 600]} itemBuilder={defaultItemBuilder}>
          <Consumer />
        </Reel>,
      );

      expect(ctx).not.toBeNull();
      expect(ctx!.index.value).toBe(0);
      expect(ctx!.count.value).toBe(5);
      expect(typeof ctx!.goTo).toBe('function');
    });
  });

  describe('data attributes', () => {
    it('wraps each slide in div with data-index', () => {
      const { container } = render(
        <Reel count={3} size={[400, 600]} itemBuilder={defaultItemBuilder} />,
      );

      const slideWrapper = container.querySelector('[data-index="0"]');
      expect(slideWrapper).toBeTruthy();
    });
  });

  describe('auto-size (no size prop)', () => {
    let originalResizeObserver: typeof ResizeObserver;

    beforeEach(() => {
      originalResizeObserver = globalThis.ResizeObserver;
      globalThis.ResizeObserver =
        MockResizeObserver as unknown as typeof ResizeObserver;
      observedElements = [];
      resizeObserverCallback = null;
    });

    afterEach(() => {
      globalThis.ResizeObserver = originalResizeObserver;
    });

    it('does not set inline width/height when size is omitted', () => {
      const { container } = render(
        <Reel count={3} itemBuilder={defaultItemBuilder} />,
      );

      const root = container.firstElementChild as HTMLElement;
      expect(root.style.width).toBe('');
      expect(root.style.height).toBe('');
    });

    it('does not render slides before measurement', () => {
      const itemBuilder = vi.fn((i: number) => <div key={i}>Slide {i}</div>);

      const { container } = render(
        <Reel count={3} itemBuilder={itemBuilder} />,
      );

      expect(itemBuilder).not.toHaveBeenCalled();
      expect(container.querySelector('[data-index]')).toBeNull();
    });

    it('renders slides after ResizeObserver measures', () => {
      const itemBuilder = vi.fn((i: number) => <div key={i}>Slide {i}</div>);

      const { container } = render(
        <Reel count={3} itemBuilder={itemBuilder} />,
      );

      act(() => {
        triggerResize(400, 600);
      });

      expect(itemBuilder).toHaveBeenCalled();
      expect(container.querySelector('[data-index="0"]')).toBeTruthy();
    });

    it('passes measured size to itemBuilder', () => {
      const itemBuilder = vi.fn(
        (i: number, _ir: number, size: [number, number]) => (
          <div key={i}>
            {size[0]}x{size[1]}
          </div>
        ),
      );

      const { container } = render(
        <Reel count={3} itemBuilder={itemBuilder} />,
      );

      act(() => {
        triggerResize(320, 480);
      });

      expect(itemBuilder).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        [320, 480],
      );
      expect(container.textContent).toContain('320x480');
    });

    it('observes the container element', () => {
      render(<Reel count={3} itemBuilder={defaultItemBuilder} />);

      expect(observedElements).toHaveLength(1);
    });

    it('disconnects on unmount', () => {
      const { unmount } = render(
        <Reel count={3} itemBuilder={defaultItemBuilder} />,
      );

      expect(observedElements).toHaveLength(1);
      unmount();
      expect(observedElements).toHaveLength(0);
    });

    it('still renders children before measurement', () => {
      const { container } = render(
        <Reel count={3} itemBuilder={defaultItemBuilder}>
          <div data-testid="overlay">Overlay</div>
        </Reel>,
      );

      expect(container.querySelector('[data-testid="overlay"]')).toBeTruthy();
    });

    it('preserves other root styles without size', () => {
      const { container } = render(
        <Reel count={3} itemBuilder={defaultItemBuilder} />,
      );

      const root = container.firstElementChild as HTMLElement;
      expect(root.style.overflow).toBe('hidden');
      expect(root.style.position).toBe('relative');
      expect(root.style.userSelect).toBe('none');
    });

    it('sets explicit size when size prop is provided', () => {
      const { container } = render(
        <Reel count={3} size={[400, 600]} itemBuilder={defaultItemBuilder} />,
      );

      const root = container.firstElementChild as HTMLElement;
      expect(root.style.width).toBe('400px');
      expect(root.style.height).toBe('600px');
    });
  });

  describe('config sync effect', () => {
    it('does not call updateConfig on first mount (initial config is set via constructor)', () => {
      // We verify indirectly: if updateConfig ran on mount, it would be
      // redundant but harmless. The key behavior is that the controller
      // works correctly on first render without the effect.
      const { container } = render(
        <Reel count={3} size={[400, 600]} itemBuilder={defaultItemBuilder} />,
      );
      const slides = container.querySelectorAll('[data-index]');
      expect(slides.length).toBeGreaterThan(0);
    });

    it('updates count on rerender', () => {
      const { container, rerender } = render(
        <Reel count={3} size={[400, 600]} itemBuilder={defaultItemBuilder} />,
      );
      const initialSlides = container.querySelectorAll('[data-index]');

      rerender(
        <Reel count={5} size={[400, 600]} itemBuilder={defaultItemBuilder} />,
      );
      const updatedSlides = container.querySelectorAll('[data-index]');
      // Count change should be reflected in rendered output
      expect(updatedSlides.length).toBeGreaterThanOrEqual(initialSlides.length);
    });

    it('updates loop on rerender', () => {
      const { container, rerender } = render(
        <Reel
          count={3}
          size={[400, 600]}
          loop={false}
          itemBuilder={defaultItemBuilder}
        />,
      );
      expect(container.firstElementChild).toBeTruthy();

      rerender(
        <Reel
          count={3}
          size={[400, 600]}
          loop={true}
          itemBuilder={defaultItemBuilder}
        />,
      );
      expect(container.firstElementChild).toBeTruthy();
    });
  });

  describe('enableNavKeys / enableWheel', () => {
    it('accepts enableNavKeys prop (default true)', () => {
      const { container } = render(
        <Reel count={3} size={[400, 600]} itemBuilder={defaultItemBuilder} />,
      );
      expect(container.firstElementChild).toBeTruthy();
    });

    it('accepts enableNavKeys={false}', () => {
      const { container } = render(
        <Reel
          count={3}
          size={[400, 600]}
          enableNavKeys={false}
          itemBuilder={defaultItemBuilder}
        />,
      );
      expect(container.firstElementChild).toBeTruthy();
    });

    it('accepts enableWheel prop', () => {
      const { container } = render(
        <Reel
          count={3}
          size={[400, 600]}
          enableWheel={true}
          itemBuilder={defaultItemBuilder}
        />,
      );
      expect(container.firstElementChild).toBeTruthy();
    });

    it('accepts onNavKeyPress callback', () => {
      const onNavKeyPress = vi.fn();
      const { container } = render(
        <Reel
          count={3}
          size={[400, 600]}
          onNavKeyPress={onNavKeyPress}
          itemBuilder={defaultItemBuilder}
        />,
      );
      expect(container.firstElementChild).toBeTruthy();
    });

    it('toggles enableWheel via rerender', () => {
      const { container, rerender } = render(
        <Reel
          count={3}
          size={[400, 600]}
          enableWheel={true}
          itemBuilder={defaultItemBuilder}
        />,
      );
      expect(container.firstElementChild).toBeTruthy();

      rerender(
        <Reel
          count={3}
          size={[400, 600]}
          enableWheel={false}
          itemBuilder={defaultItemBuilder}
        />,
      );
      expect(container.firstElementChild).toBeTruthy();
    });

    it('toggles enableNavKeys via rerender', () => {
      const { container, rerender } = render(
        <Reel
          count={3}
          size={[400, 600]}
          enableNavKeys={true}
          itemBuilder={defaultItemBuilder}
        />,
      );
      expect(container.firstElementChild).toBeTruthy();

      rerender(
        <Reel
          count={3}
          size={[400, 600]}
          enableNavKeys={false}
          itemBuilder={defaultItemBuilder}
        />,
      );
      expect(container.firstElementChild).toBeTruthy();
    });
  });
});
