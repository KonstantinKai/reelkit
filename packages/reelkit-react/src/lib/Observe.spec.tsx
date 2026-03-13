import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSignal, type AnimatedValue } from '@reelkit/core';
import { Observe, AnimatedObserve } from './Observe';

describe('Observe', () => {
  it('renders children with current signal value', () => {
    const signal = createSignal(42);

    const { container } = render(
      <Observe signals={[signal]}>{() => <span>{signal.value}</span>}</Observe>,
    );

    expect(container.textContent).toBe('42');
  });

  it('re-renders when signal value changes', () => {
    const signal = createSignal(1);

    const { container } = render(
      <Observe signals={[signal]}>{() => <span>{signal.value}</span>}</Observe>,
    );

    expect(container.textContent).toBe('1');

    act(() => {
      signal.value = 2;
    });

    expect(container.textContent).toBe('2');
  });

  it('subscribes to multiple deps', () => {
    const signalA = createSignal('a');
    const signalB = createSignal('b');

    const { container } = render(
      <Observe signals={[signalA, signalB]}>
        {() => (
          <span>
            {signalA.value}-{signalB.value}
          </span>
        )}
      </Observe>,
    );

    expect(container.textContent).toBe('a-b');

    act(() => {
      signalB.value = 'B';
    });

    expect(container.textContent).toBe('a-B');
  });

  it('stops reacting after unmount', () => {
    const signal = createSignal(0);
    const renderSpy = vi.fn(() => <span>{signal.value}</span>);

    const { unmount } = render(
      <Observe signals={[signal]}>{renderSpy}</Observe>,
    );

    const callCountBeforeUnmount = renderSpy.mock.calls.length;
    unmount();

    act(() => {
      signal.value = 99;
    });

    // Should not have re-rendered after unmount
    expect(renderSpy.mock.calls.length).toBe(callCountBeforeUnmount);
  });
});

describe('AnimatedObserve', () => {
  let rafCallbacks: FrameRequestCallback[];

  beforeEach(() => {
    rafCallbacks = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with initial value', () => {
    const signal = createSignal({ value: 100, duration: 0 });

    const { container } = render(
      <AnimatedObserve signal={signal}>
        {(value) => <span>{value}</span>}
      </AnimatedObserve>,
    );

    expect(container.textContent).toBe('100');
  });

  it('updates value on signal change with zero duration', () => {
    const signal = createSignal({ value: 0, duration: 0 });

    const { container } = render(
      <AnimatedObserve signal={signal}>
        {(value) => <span>{value}</span>}
      </AnimatedObserve>,
    );

    act(() => {
      signal.value = { value: 50, duration: 0 };
    });

    // Flush rAF
    act(() => {
      rafCallbacks.forEach((cb) => cb(0));
    });

    expect(container.textContent).toBe('50');
  });

  it('does not update after unmount', () => {
    const signal = createSignal({ value: 0, duration: 0 });
    const renderSpy = vi.fn((value: number) => <span>{value}</span>);

    const { unmount } = render(
      <AnimatedObserve signal={signal}>{renderSpy}</AnimatedObserve>,
    );

    unmount();

    act(() => {
      signal.value = { value: 99, duration: 0 };
    });

    // rAF callback should not cause re-render (mountedRef is false)
    act(() => {
      rafCallbacks.forEach((cb) => cb(0));
    });

    // renderSpy should only have been called during mount
    const callCount = renderSpy.mock.calls.length;
    expect(callCount).toBeLessThanOrEqual(2); // initial + possible strict mode
  });

  it('calls done callback when animation is canceled by new signal value', async () => {
    const done = vi.fn();
    const signal = createSignal<AnimatedValue>({ value: 0, duration: 0 });

    render(
      <AnimatedObserve signal={signal}>
        {(value) => <span>{value}</span>}
      </AnimatedObserve>,
    );

    // Start an animated transition with a done callback
    act(() => {
      signal.value = { value: -600, duration: 300, done };
    });

    // Run one animation frame so the animation is in progress
    act(() => {
      rafCallbacks.forEach((cb) => cb(16));
      rafCallbacks = [];
    });

    expect(done).not.toHaveBeenCalled();

    // Cancel the animation by setting a new value (simulates resize)
    act(() => {
      signal.value = { value: -600, duration: 0 };
    });

    // done is called via setTimeout(0) — flush it
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(done).toHaveBeenCalledTimes(1);
  });

  // Helper: drain one "frame" from the rAF queue with a given timestamp.
  // Snapshots the queue first so callbacks scheduled during execution
  // are captured for the next frame, not lost.
  const flushRafFrame = (timestamp: number) => {
    const cbs = [...rafCallbacks];
    rafCallbacks = [];
    cbs.forEach((cb) => cb(timestamp));
  };

  it('calls done only once on normal animation completion', async () => {
    const done = vi.fn();
    const signal = createSignal<AnimatedValue>({ value: 0, duration: 0 });

    render(
      <AnimatedObserve signal={signal}>
        {(value) => <span>{value}</span>}
      </AnimatedObserve>,
    );

    // Start animation
    act(() => {
      signal.value = { value: -600, duration: 300, done };
    });

    // First frame (sets startTime), schedules next rAF
    act(() => flushRafFrame(0));

    // Final frame past duration → triggers onComplete
    act(() => flushRafFrame(350));

    // Flush setTimeout from onComplete
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(done).toHaveBeenCalledTimes(1);
  });

  it('does not call done twice when canceled then new animation completes', async () => {
    const done1 = vi.fn();
    const done2 = vi.fn();
    const signal = createSignal<AnimatedValue>({ value: 0, duration: 0 });

    render(
      <AnimatedObserve signal={signal}>
        {(value) => <span>{value}</span>}
      </AnimatedObserve>,
    );

    // Start first animation
    act(() => {
      signal.value = { value: -600, duration: 300, done: done1 };
    });
    act(() => flushRafFrame(16));

    // Cancel first by starting a second animation
    act(() => {
      signal.value = { value: -1200, duration: 300, done: done2 };
    });

    // Flush setTimeout for canceled done1
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(done1).toHaveBeenCalledTimes(1);
    expect(done2).not.toHaveBeenCalled();

    // Complete second animation
    act(() => flushRafFrame(0));
    act(() => flushRafFrame(350));

    // Flush setTimeout from onComplete
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(done1).toHaveBeenCalledTimes(1);
    expect(done2).toHaveBeenCalledTimes(1);
  });
});
