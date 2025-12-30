import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { timeout } from './timeout';

describe('timeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return a function with cancel method', () => {
    const callback = vi.fn();
    const wrapped = timeout(callback);

    expect(typeof wrapped).toBe('function');
    expect(typeof wrapped.cancel).toBe('function');
  });

  it('should call callback after timeout', () => {
    const callback = vi.fn();
    const wrapped = timeout(callback, 100);

    wrapped();
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to callback', () => {
    const callback = vi.fn();
    const wrapped = timeout(callback, 50);

    wrapped('arg1', 42, { key: 'value' });
    vi.advanceTimersByTime(50);

    expect(callback).toHaveBeenCalledWith('arg1', 42, { key: 'value' });
  });

  it('should use default timeout of 0ms', () => {
    const callback = vi.fn();
    const wrapped = timeout(callback);

    wrapped();
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(0);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should cancel pending timeout', () => {
    const callback = vi.fn();
    const wrapped = timeout(callback, 100);

    wrapped();
    wrapped.cancel();

    vi.advanceTimersByTime(100);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should not throw when canceling without pending timeout', () => {
    const callback = vi.fn();
    const wrapped = timeout(callback, 100);

    expect(() => wrapped.cancel()).not.toThrow();
  });

  it('should not throw when canceling already executed timeout', () => {
    const callback = vi.fn();
    const wrapped = timeout(callback, 100);

    wrapped();
    vi.advanceTimersByTime(100);

    expect(() => wrapped.cancel()).not.toThrow();
  });

  it('should allow multiple calls', () => {
    const callback = vi.fn();
    const wrapped = timeout(callback, 50);

    wrapped('first');
    vi.advanceTimersByTime(50);

    wrapped('second');
    vi.advanceTimersByTime(50);

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, 'first');
    expect(callback).toHaveBeenNthCalledWith(2, 'second');
  });

  it('should cancel only the last scheduled timeout', () => {
    const callback = vi.fn();
    const wrapped = timeout(callback, 100);

    wrapped('first');
    vi.advanceTimersByTime(50);

    wrapped('second');
    wrapped.cancel();

    vi.advanceTimersByTime(100);

    // First call should have executed, second was canceled
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('first');
  });

  it('should work with typed callbacks', () => {
    const callback = vi.fn((a: number, b: string) => a + b.length);
    const wrapped = timeout(callback, 10);

    wrapped(5, 'hello');
    vi.advanceTimersByTime(10);

    expect(callback).toHaveBeenCalledWith(5, 'hello');
  });
});
