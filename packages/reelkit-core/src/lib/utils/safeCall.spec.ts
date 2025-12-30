import { describe, it, expect, vi } from 'vitest';
import { safeCall } from './safeCall';

describe('safeCall', () => {
  it('should call function with provided arguments', () => {
    const fn = vi.fn();
    safeCall(fn, 'arg1', 42);
    expect(fn).toHaveBeenCalledWith('arg1', 42);
  });

  it('should not throw when function is undefined', () => {
    expect(() => safeCall(undefined)).not.toThrow();
  });

  it('should not throw when function throws an error', () => {
    const fn = vi.fn(() => {
      throw new Error('Test error');
    });
    expect(() => safeCall(fn)).not.toThrow();
    expect(fn).toHaveBeenCalled();
  });

  it('should call function with no arguments', () => {
    const fn = vi.fn();
    safeCall(fn);
    expect(fn).toHaveBeenCalledWith();
  });

  it('should call function with multiple arguments', () => {
    const fn = vi.fn();
    safeCall(fn, 1, 'two', { three: 3 }, [4]);
    expect(fn).toHaveBeenCalledWith(1, 'two', { three: 3 }, [4]);
  });

  it('should silently ignore errors and continue', () => {
    const errorFn = vi.fn(() => {
      throw new Error('Error');
    });

    safeCall(errorFn);
    safeCall(errorFn);

    expect(errorFn).toHaveBeenCalledTimes(2);
  });
});
