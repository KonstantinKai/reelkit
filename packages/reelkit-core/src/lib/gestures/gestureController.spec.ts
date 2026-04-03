// @vitest-environment jsdom
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

const createTouchEvent = (x: number, y: number, target?: EventTarget) => ({
  changedTouches: [{ clientX: x, clientY: y }],
  target: target ?? null,
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

  it('does not fire onTap when target is an interactive element', () => {
    const onTap = vi.fn();
    element = createMockElement();
    controller = createGestureController({}, { onTap });
    controller.attach(element);
    controller.observe();

    const button = document.createElement('button');
    document.body.appendChild(button);

    element.dispatch('touchstart', createTouchEvent(100, 100, button));
    element.dispatch('touchend', createTouchEvent(100, 100, button));

    vi.advanceTimersByTime(300);
    expect(onTap).not.toHaveBeenCalled();

    document.body.removeChild(button);
  });

  it('does not fire onTap when target has role="button"', () => {
    const onTap = vi.fn();
    element = createMockElement();
    controller = createGestureController({}, { onTap });
    controller.attach(element);
    controller.observe();

    const div = document.createElement('div');
    div.setAttribute('role', 'button');
    document.body.appendChild(div);

    element.dispatch('touchstart', createTouchEvent(100, 100, div));
    element.dispatch('touchend', createTouchEvent(100, 100, div));

    vi.advanceTimersByTime(300);
    expect(onTap).not.toHaveBeenCalled();

    document.body.removeChild(div);
  });

  it('does not fire onTap when target is inside a button', () => {
    const onTap = vi.fn();
    element = createMockElement();
    controller = createGestureController({}, { onTap });
    controller.attach(element);
    controller.observe();

    const button = document.createElement('button');
    const span = document.createElement('span');
    button.appendChild(span);
    document.body.appendChild(button);

    element.dispatch('touchstart', createTouchEvent(100, 100, span));
    element.dispatch('touchend', createTouchEvent(100, 100, span));

    vi.advanceTimersByTime(300);
    expect(onTap).not.toHaveBeenCalled();

    document.body.removeChild(button);
  });

  it('fires onLongPressEnd on pointer release after long press', () => {
    const onLongPress = vi.fn();
    const onLongPressEnd = vi.fn();
    element = createMockElement();
    controller = createGestureController({}, { onLongPress, onLongPressEnd });
    controller.attach(element);
    controller.observe();

    element.dispatch('touchstart', createTouchEvent(100, 100));
    vi.advanceTimersByTime(800);
    element.dispatch('touchend', createTouchEvent(100, 100));

    expect(onLongPressEnd).toHaveBeenCalledTimes(1);
  });

  it('observe without attach does nothing', () => {
    controller = createGestureController({}, {});
    controller.observe();
    // No error thrown
  });

  it('updateEvents replaces callbacks', () => {
    const onTap1 = vi.fn();
    const onTap2 = vi.fn();
    element = createMockElement();
    controller = createGestureController({}, { onTap: onTap1 });
    controller.attach(element);
    controller.observe();

    controller.updateEvents({ onTap: onTap2 });

    element.dispatch('touchstart', createTouchEvent(100, 100));
    element.dispatch('touchend', createTouchEvent(100, 100));
    vi.advanceTimersByTime(300);

    expect(onTap1).not.toHaveBeenCalled();
    expect(onTap2).toHaveBeenCalledTimes(1);
  });

  it('handles mouse events when useTouchEventsOnly is false', () => {
    const onTap = vi.fn();
    element = createMockElement();
    controller = createGestureController(
      { useTouchEventsOnly: false },
      { onTap },
    );
    controller.attach(element);
    controller.observe();

    element.dispatch('mousedown', { clientX: 100, clientY: 100, target: null });
    element.dispatch('mouseup', { clientX: 100, clientY: 100, target: null });

    vi.advanceTimersByTime(300);
    expect(onTap).toHaveBeenCalledTimes(1);
  });

  it('fires drag events on vertical swipe', () => {
    const onVerticalDragStart = vi.fn();
    const onDragEnd = vi.fn();
    element = createMockElement();
    controller = createGestureController(
      {},
      { onVerticalDragStart, onDragEnd },
    );
    controller.attach(element);
    controller.observe();

    element.dispatch('touchstart', createTouchEvent(100, 100));
    element.dispatch('touchmove', createTouchEvent(100, 200));
    element.dispatch('touchend', createTouchEvent(100, 200));

    expect(onVerticalDragStart).toHaveBeenCalledTimes(1);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });

  it('fires drag events on horizontal swipe', () => {
    const onHorizontalDragStart = vi.fn();
    const onDragEnd = vi.fn();
    element = createMockElement();
    controller = createGestureController(
      {},
      { onHorizontalDragStart, onDragEnd },
    );
    controller.attach(element);
    controller.observe();

    element.dispatch('touchstart', createTouchEvent(100, 100));
    element.dispatch('touchmove', createTouchEvent(200, 100));
    element.dispatch('touchend', createTouchEvent(200, 100));

    expect(onHorizontalDragStart).toHaveBeenCalledTimes(1);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });

  it('clears pending tap timer on second tap', () => {
    const onTap = vi.fn();
    const onDoubleTap = vi.fn();
    element = createMockElement();
    controller = createGestureController({}, { onTap, onDoubleTap });
    controller.attach(element);
    controller.observe();

    // First tap — starts pending timer
    element.dispatch('touchstart', createTouchEvent(100, 100));
    element.dispatch('touchend', createTouchEvent(100, 100));

    // Wait a bit but stay within window
    vi.advanceTimersByTime(50);

    // Third rapid tap scenario: first tap timer pending, then double-tap fires
    element.dispatch('touchstart', createTouchEvent(100, 100));
    element.dispatch('touchend', createTouchEvent(100, 100));

    expect(onDoubleTap).toHaveBeenCalledTimes(1);

    // Advance past window — no stale onTap from first timer
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
