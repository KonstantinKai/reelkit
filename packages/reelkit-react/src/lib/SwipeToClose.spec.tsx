import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { GestureControllerEvents } from '@reelkit/core';

let capturedEvents: Partial<GestureControllerEvents> = {};
const mockAttach = vi.fn();
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDetach = vi.fn();

vi.mock('@reelkit/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@reelkit/core')>();
  return {
    ...actual,
    createGestureController: (
      _config: unknown,
      events: GestureControllerEvents,
    ) => {
      capturedEvents = events;
      return {
        attach: mockAttach,
        observe: mockObserve,
        unobserve: mockUnobserve,
        detach: mockDetach,
        updateEvents: vi.fn(),
      };
    },
  };
});

// eslint-disable-next-line import/first
import { SwipeToClose } from './SwipeToClose';

describe('SwipeToClose', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockAttach.mockClear();
    mockObserve.mockClear();
    mockUnobserve.mockClear();
    mockDetach.mockClear();
    capturedEvents = {};
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders children', () => {
    const { container } = render(
      <SwipeToClose direction="up" onClose={vi.fn()}>
        <span>Content</span>
      </SwipeToClose>,
    );
    expect(container.textContent).toBe('Content');
  });

  it('attaches gesture controller when enabled', () => {
    render(
      <SwipeToClose direction="up" onClose={vi.fn()}>
        <span>Content</span>
      </SwipeToClose>,
    );
    expect(mockAttach).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalled();
  });

  it('does not attach when disabled', () => {
    render(
      <SwipeToClose direction="up" enabled={false} onClose={vi.fn()}>
        <span>Content</span>
      </SwipeToClose>,
    );
    expect(mockAttach).not.toHaveBeenCalled();
  });

  it('detaches on unmount', () => {
    const { unmount } = render(
      <SwipeToClose direction="down" onClose={vi.fn()}>
        <span>Content</span>
      </SwipeToClose>,
    );
    unmount();
    expect(mockUnobserve).toHaveBeenCalled();
    expect(mockDetach).toHaveBeenCalled();
  });

  it('has initial transform of 0 and opacity of 1', () => {
    const { container } = render(
      <SwipeToClose direction="down" onClose={vi.fn()}>
        <span>Content</span>
      </SwipeToClose>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.transform).toBe('translateY(0px)');
    expect(wrapper.style.opacity).toBe('1');
  });

  it('applies className to container', () => {
    const { container } = render(
      <SwipeToClose direction="up" onClose={vi.fn()} className="custom">
        <span>Content</span>
      </SwipeToClose>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toBe('custom');
  });

  describe('swipe down gesture', () => {
    it('updates drag offset on vertical drag', () => {
      const { container } = render(
        <SwipeToClose direction="down" onClose={vi.fn()}>
          <span>Content</span>
        </SwipeToClose>,
      );

      capturedEvents.onVerticalDragStart?.({
        globalPosition: [0, 0],
        localPosition: [0, 0],
        sourceTimestamp: 0,
        kind: 'touch',
      });

      act(() => {
        capturedEvents.onVerticalDragUpdate?.({
          globalPosition: [0, 100],
          localPosition: [0, 100],
          sourceTimestamp: 0,
          delta: [0, 10],
          distance: [0, 100],
          primaryDelta: 10,
          primaryDistance: 100,
          cancel: vi.fn(),
        });
      });

      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.style.transform).toBe('translateY(100px)');
    });

    it('calls onClose when swipe exceeds threshold', () => {
      const onClose = vi.fn();
      render(
        <SwipeToClose direction="down" onClose={onClose}>
          <span>Content</span>
        </SwipeToClose>,
      );

      capturedEvents.onVerticalDragStart?.({
        globalPosition: [0, 0],
        localPosition: [0, 0],
        sourceTimestamp: 0,
        kind: 'touch',
      });

      capturedEvents.onVerticalDragEnd?.({
        globalPosition: [0, 300],
        localPosition: [0, 300],
        sourceTimestamp: 0,
        delta: [0, 10],
        distance: [0, 300],
        primaryDelta: 10,
        primaryDistance: 300,
        velocity: [0, 500],
        primaryVelocity: 500,
      });

      vi.advanceTimersByTime(300);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('resets position when swipe is below threshold', () => {
      const { container } = render(
        <SwipeToClose direction="down" onClose={vi.fn()}>
          <span>Content</span>
        </SwipeToClose>,
      );

      capturedEvents.onVerticalDragStart?.({
        globalPosition: [0, 0],
        localPosition: [0, 0],
        sourceTimestamp: 0,
        kind: 'touch',
      });

      capturedEvents.onVerticalDragUpdate?.({
        globalPosition: [0, 20],
        localPosition: [0, 20],
        sourceTimestamp: 0,
        delta: [0, 5],
        distance: [0, 20],
        primaryDelta: 5,
        primaryDistance: 20,
        cancel: vi.fn(),
      });

      capturedEvents.onVerticalDragEnd?.({
        globalPosition: [0, 20],
        localPosition: [0, 20],
        sourceTimestamp: 0,
        delta: [0, 5],
        distance: [0, 20],
        primaryDelta: 5,
        primaryDistance: 20,
        velocity: [0, 100],
        primaryVelocity: 100,
      });

      vi.advanceTimersByTime(300);

      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.style.transform).toBe('translateY(0px)');
    });

    it('ignores drag in opposite direction', () => {
      const { container } = render(
        <SwipeToClose direction="down" onClose={vi.fn()}>
          <span>Content</span>
        </SwipeToClose>,
      );

      capturedEvents.onVerticalDragStart?.({
        globalPosition: [0, 0],
        localPosition: [0, 0],
        sourceTimestamp: 0,
        kind: 'touch',
      });

      capturedEvents.onVerticalDragUpdate?.({
        globalPosition: [0, -50],
        localPosition: [0, -50],
        sourceTimestamp: 0,
        delta: [0, -10],
        distance: [0, -50],
        primaryDelta: -10,
        primaryDistance: -50,
        cancel: vi.fn(),
      });

      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.style.transform).toBe('translateY(0px)');
    });
  });

  describe('swipe up gesture', () => {
    it('calls onClose when swiped up past threshold', () => {
      const onClose = vi.fn();
      render(
        <SwipeToClose direction="up" onClose={onClose}>
          <span>Content</span>
        </SwipeToClose>,
      );

      capturedEvents.onVerticalDragStart?.({
        globalPosition: [0, 0],
        localPosition: [0, 0],
        sourceTimestamp: 0,
        kind: 'touch',
      });

      capturedEvents.onVerticalDragEnd?.({
        globalPosition: [0, -300],
        localPosition: [0, -300],
        sourceTimestamp: 0,
        delta: [0, -10],
        distance: [0, -300],
        primaryDelta: -10,
        primaryDistance: -300,
        velocity: [0, 500],
        primaryVelocity: 500,
      });

      vi.advanceTimersByTime(300);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('horizontal drag fallback', () => {
    it('resets on horizontal-only drag end if drag offset is non-zero', () => {
      const { container } = render(
        <SwipeToClose direction="down" onClose={vi.fn()}>
          <span>Content</span>
        </SwipeToClose>,
      );

      capturedEvents.onVerticalDragStart?.({
        globalPosition: [0, 0],
        localPosition: [0, 0],
        sourceTimestamp: 0,
        kind: 'touch',
      });

      capturedEvents.onVerticalDragUpdate?.({
        globalPosition: [0, 50],
        localPosition: [0, 50],
        sourceTimestamp: 0,
        delta: [0, 10],
        distance: [0, 50],
        primaryDelta: 10,
        primaryDistance: 50,
        cancel: vi.fn(),
      });

      // Simulate onDragEnd without onVerticalDragEnd (horizontal swipe took over)
      capturedEvents.onDragEnd?.({
        globalPosition: [100, 50],
        localPosition: [100, 50],
        sourceTimestamp: 0,
        delta: [10, 0],
        distance: [100, 50],
        velocity: [500, 100],
      });

      vi.advanceTimersByTime(300);

      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.style.transform).toBe('translateY(0px)');
    });
  });
});
