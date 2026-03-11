import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSignal } from '@reelkit/core';
import {
  ValueNotifierObserver,
  AnimatedValueNotifierObserver,
} from './ValueNotifierObserver';

describe('ValueNotifierObserver', () => {
  it('renders children with current signal value', () => {
    const signal = createSignal(42);

    const { container } = render(
      <ValueNotifierObserver deps={[signal]}>
        {() => <span>{signal.value}</span>}
      </ValueNotifierObserver>,
    );

    expect(container.textContent).toBe('42');
  });

  it('re-renders when signal value changes', () => {
    const signal = createSignal(1);

    const { container } = render(
      <ValueNotifierObserver deps={[signal]}>
        {() => <span>{signal.value}</span>}
      </ValueNotifierObserver>,
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
      <ValueNotifierObserver deps={[signalA, signalB]}>
        {() => (
          <span>
            {signalA.value}-{signalB.value}
          </span>
        )}
      </ValueNotifierObserver>,
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
      <ValueNotifierObserver deps={[signal]}>
        {renderSpy}
      </ValueNotifierObserver>,
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

describe('AnimatedValueNotifierObserver', () => {
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
      <AnimatedValueNotifierObserver valueNotifier={signal}>
        {(value) => <span>{value}</span>}
      </AnimatedValueNotifierObserver>,
    );

    expect(container.textContent).toBe('100');
  });

  it('updates value on signal change with zero duration', () => {
    const signal = createSignal({ value: 0, duration: 0 });

    const { container } = render(
      <AnimatedValueNotifierObserver valueNotifier={signal}>
        {(value) => <span>{value}</span>}
      </AnimatedValueNotifierObserver>,
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
      <AnimatedValueNotifierObserver valueNotifier={signal}>
        {renderSpy}
      </AnimatedValueNotifierObserver>,
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
});
