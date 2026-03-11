import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Reel, type ReelApi } from './Reel';
import React from 'react';

// Use real createSliderController - avoid mocking @reelkit/core since
// its bundled reaction() breaks when the module is mocked via vi.mock.

const defaultItemBuilder = (i: number) => <div key={i}>Slide {i}</div>;

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
      const apiRef = React.createRef<ReelApi>() as React.MutableRefObject<ReelApi | null>;

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
      const apiRef = React.createRef<ReelApi>() as React.MutableRefObject<ReelApi | null>;

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
  });

  describe('controller lifecycle', () => {
    it('renders virtualized slides (not all items at once)', () => {
      const itemBuilder = vi.fn((i: number) => <div key={i}>Slide {i}</div>);

      render(
        <Reel count={10} size={[400, 600]} itemBuilder={itemBuilder} />,
      );

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
          itemBuilder={(i) => <div key={i} data-slide={i}>Slide {i}</div>}
        />,
      );

      rerender(
        <Reel
          count={5}
          size={[400, 600]}
          itemBuilder={(i) => <div key={i} data-slide={i}>Slide {i}</div>}
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
    it('renders vertical flex layout by default', () => {
      const { container } = render(
        <Reel count={3} size={[400, 600]} itemBuilder={defaultItemBuilder} />,
      );

      // The inner content div should have flexDirection column
      const innerDiv = container.querySelector('[style*="flex-direction"]') as HTMLElement;
      expect(innerDiv).toBeTruthy();
      expect(innerDiv.style.flexDirection).toBe('column');
    });

    it('renders horizontal flex layout when direction=horizontal', () => {
      const { container } = render(
        <Reel
          count={3}
          size={[400, 600]}
          direction="horizontal"
          itemBuilder={defaultItemBuilder}
        />,
      );

      const innerDiv = container.querySelector('[style*="flex-direction"]') as HTMLElement;
      expect(innerDiv).toBeTruthy();
      expect(innerDiv.style.flexDirection).toBe('row');
    });
  });

  describe('memo', () => {
    it('does not re-render when same props are passed', () => {
      const itemBuilder = vi.fn((i: number) => <div key={i}>Slide {i}</div>);

      const { rerender } = render(
        <Reel count={3} size={[400, 600]} itemBuilder={itemBuilder} />,
      );

      const callsAfterFirst = itemBuilder.mock.calls.length;

      rerender(
        <Reel count={3} size={[400, 600]} itemBuilder={itemBuilder} />,
      );

      expect(itemBuilder.mock.calls.length).toBe(callsAfterFirst);
    });

    it('re-renders when count changes', () => {
      const itemBuilder = vi.fn((i: number) => <div key={i}>Slide {i}</div>);

      const { rerender } = render(
        <Reel count={3} size={[400, 600]} itemBuilder={itemBuilder} />,
      );

      const callsAfterFirst = itemBuilder.mock.calls.length;

      rerender(
        <Reel count={5} size={[400, 600]} itemBuilder={itemBuilder} />,
      );

      expect(itemBuilder.mock.calls.length).toBeGreaterThan(callsAfterFirst);
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
});
