import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createGestureController } from './gestureController';
import type { GestureController } from './types';

const createMockElement = () => {
  const listeners = new Map<string, EventListener>();
  return {
    getBoundingClientRect: () => ({ x: 0, y: 0, width: 400, height: 600 }),
    addEventListener: vi.fn((type: string, handler: EventListener) => {
      listeners.set(type, handler);
    }),
    removeEventListener: vi.fn((type: string) => {
      listeners.delete(type);
    }),
    dispatch(type: string, event: Partial<TouchEvent | MouseEvent>) {
      listeners.get(type)?.(event as Event);
    },
  } as unknown as HTMLElement & {
    dispatch: (type: string, event: Partial<TouchEvent | MouseEvent>) => void;
  };
};

const createTouchEvent = (x: number, y: number) => ({
  changedTouches: [{ clientX: x, clientY: y }],
});

describe('createGestureController — tap & double-tap', () => {
  let controller: GestureController;
  let element: ReturnType<typeof createMockElement>;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    controller?.detach();
    vi.useRealTimers();
  });

  it('fires onTap after doubleTapWindowMs delay when no second tap occurs', () => {
    const onTap = vi.fn();
    element = createMockElement();
    controller = createGestureController({}, { onTap });
    controller.attach(element);
    controller.observe();

    element.dispatch('touchstart', createTouchEvent(100, 100));
    element.dispatch('touchend', createTouchEvent(100, 100));

    // Not fired yet — waiting for potential double-tap
    expect(onTap).not.toHaveBeenCalled();

    // Advance past the double-tap window
    vi.advanceTimersByTime(300);

    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it('fires onDoubleTap (not onTap) when two taps occur within the window', () => {
    const onTap = vi.fn();
    const onDoubleTap = vi.fn();
    element = createMockElement();
    controller = createGestureController({}, { onTap, onDoubleTap });
    controller.attach(element);
    controller.observe();

    // First tap
    element.dispatch('touchstart', createTouchEvent(100, 100));
    element.dispatch('touchend', createTouchEvent(100, 100));

    vi.advanceTimersByTime(100); // within the 300ms window

    // Second tap
    element.dispatch('touchstart', createTouchEvent(100, 100));
    element.dispatch('touchend', createTouchEvent(100, 100));

    expect(onDoubleTap).toHaveBeenCalledTimes(1);

    // Advance remaining time — onTap should NOT fire
    vi.advanceTimersByTime(300);
    expect(onTap).not.toHaveBeenCalled();
  });

  it('does not fire onTap when a drag occurs', () => {
    const onTap = vi.fn();
    element = createMockElement();
    controller = createGestureController({}, { onTap });
    controller.attach(element);
    controller.observe();

    // Simulate a drag: touchstart → touchmove → touchend
    element.dispatch('touchstart', createTouchEvent(100, 100));
    element.dispatch('touchmove', createTouchEvent(200, 100)); // significant movement
    element.dispatch('touchend', createTouchEvent(200, 100));

    vi.advanceTimersByTime(300);

    expect(onTap).not.toHaveBeenCalled();
  });

  it('does not fire onTap when long press is detected', () => {
    const onTap = vi.fn();
    const onLongPress = vi.fn();
    element = createMockElement();
    controller = createGestureController({}, { onTap, onLongPress });
    controller.attach(element);
    controller.observe();

    element.dispatch('touchstart', createTouchEvent(100, 100));

    // Trigger long press
    vi.advanceTimersByTime(800);
    expect(onLongPress).toHaveBeenCalledTimes(1);

    element.dispatch('touchend', createTouchEvent(100, 100));

    vi.advanceTimersByTime(300);
    expect(onTap).not.toHaveBeenCalled();
  });

  it('respects custom doubleTapWindowMs', () => {
    const onTap = vi.fn();
    const onDoubleTap = vi.fn();
    element = createMockElement();
    controller = createGestureController(
      { doubleTapWindowMs: 500 },
      { onTap, onDoubleTap },
    );
    controller.attach(element);
    controller.observe();

    // First tap
    element.dispatch('touchstart', createTouchEvent(100, 100));
    element.dispatch('touchend', createTouchEvent(100, 100));

    vi.advanceTimersByTime(400); // within 500ms window

    // Second tap
    element.dispatch('touchstart', createTouchEvent(100, 100));
    element.dispatch('touchend', createTouchEvent(100, 100));

    expect(onDoubleTap).toHaveBeenCalledTimes(1);
    expect(onTap).not.toHaveBeenCalled();
  });
});
