import { describe, it, expect, vi } from 'vitest';
import { createSignal, createComputed, reaction } from './signal';

describe('createSignal', () => {
  it('should create signal with initial value', () => {
    const signal = createSignal(10);
    expect(signal.value).toBe(10);
  });

  it('should update value', () => {
    const signal = createSignal(0);
    signal.value = 5;
    expect(signal.value).toBe(5);
  });

  it('should notify listeners on value change', () => {
    const signal = createSignal(0);
    const listener = vi.fn();

    signal.observe(listener);
    signal.value = 1;

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should not notify listeners when value is the same', () => {
    const signal = createSignal(5);
    const listener = vi.fn();

    signal.observe(listener);
    signal.value = 5;

    expect(listener).not.toHaveBeenCalled();
  });

  it('should stop notifying after dispose', () => {
    const signal = createSignal(0);
    const listener = vi.fn();

    const dispose = signal.observe(listener);
    signal.value = 1;
    expect(listener).toHaveBeenCalledTimes(1);

    dispose();
    signal.value = 2;
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should support multiple listeners', () => {
    const signal = createSignal(0);
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    signal.observe(listener1);
    signal.observe(listener2);
    signal.value = 1;

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  describe('changeWithManualNotifier', () => {
    it('should change value and return notify function', () => {
      const signal = createSignal(0);
      const listener = vi.fn();
      signal.observe(listener);

      const notify = signal.changeWithManualNotifier(5);
      expect(signal.value).toBe(5);
      expect(listener).not.toHaveBeenCalled();

      notify();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should return noop when value is the same', () => {
      const signal = createSignal(5);
      const listener = vi.fn();
      signal.observe(listener);

      const notify = signal.changeWithManualNotifier(5);
      notify();

      expect(listener).not.toHaveBeenCalled();
    });
  });
});

describe('createComputed', () => {
  it('should compute value from getter', () => {
    const count = createSignal(5);
    const doubled = createComputed(() => count.value * 2, () => [count]);

    expect(doubled.value).toBe(10);
  });

  it('should update when dependency changes', () => {
    const count = createSignal(5);
    const doubled = createComputed(() => count.value * 2, () => [count]);
    const listener = vi.fn();

    doubled.observe(listener);
    count.value = 10;

    expect(doubled.value).toBe(20);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe from deps when no listeners', () => {
    const count = createSignal(5);
    const doubled = createComputed(() => count.value * 2, () => [count]);
    const listener = vi.fn();

    const dispose = doubled.observe(listener);
    count.value = 10;
    expect(listener).toHaveBeenCalledTimes(1);

    dispose();
    count.value = 15;
    // Listener should not be called after dispose
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should work with multiple dependencies', () => {
    const a = createSignal(2);
    const b = createSignal(3);
    const sum = createComputed(() => a.value + b.value, () => [a, b]);
    const listener = vi.fn();

    sum.observe(listener);

    expect(sum.value).toBe(5);

    a.value = 5;
    expect(sum.value).toBe(8);
    expect(listener).toHaveBeenCalledTimes(1);

    b.value = 10;
    expect(sum.value).toBe(15);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});

describe('reaction', () => {
  it('should call effect when any dependency changes', () => {
    const count = createSignal(0);
    const effect = vi.fn();

    reaction(() => [count], effect);
    count.value = 1;

    expect(effect).toHaveBeenCalledTimes(1);
  });

  it('should stop reacting after dispose', () => {
    const count = createSignal(0);
    const effect = vi.fn();

    const dispose = reaction(() => [count], effect);
    count.value = 1;
    expect(effect).toHaveBeenCalledTimes(1);

    dispose();
    count.value = 2;
    expect(effect).toHaveBeenCalledTimes(1);
  });

  it('should react to multiple dependencies', () => {
    const a = createSignal(0);
    const b = createSignal(0);
    const effect = vi.fn();

    reaction(() => [a, b], effect);

    a.value = 1;
    expect(effect).toHaveBeenCalledTimes(1);

    b.value = 1;
    expect(effect).toHaveBeenCalledTimes(2);
  });
});
