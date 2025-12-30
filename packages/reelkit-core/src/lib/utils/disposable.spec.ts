import { describe, it, expect, vi } from 'vitest';
import { createDisposableList } from './disposable';

describe('createDisposableList', () => {
  it('should return object with push and dispose methods', () => {
    const list = createDisposableList();

    expect(list).toHaveProperty('push');
    expect(list).toHaveProperty('dispose');
    expect(typeof list.push).toBe('function');
    expect(typeof list.dispose).toBe('function');
  });

  it('should call disposer when dispose is called', () => {
    const list = createDisposableList();
    const disposer = vi.fn();

    list.push(disposer);
    expect(disposer).not.toHaveBeenCalled();

    list.dispose();
    expect(disposer).toHaveBeenCalledTimes(1);
  });

  it('should call all disposers when dispose is called', () => {
    const list = createDisposableList();
    const disposer1 = vi.fn();
    const disposer2 = vi.fn();
    const disposer3 = vi.fn();

    list.push(disposer1, disposer2, disposer3);
    list.dispose();

    expect(disposer1).toHaveBeenCalledTimes(1);
    expect(disposer2).toHaveBeenCalledTimes(1);
    expect(disposer3).toHaveBeenCalledTimes(1);
  });

  it('should call disposers in order', () => {
    const list = createDisposableList();
    const callOrder: number[] = [];

    list.push(
      () => callOrder.push(1),
      () => callOrder.push(2),
      () => callOrder.push(3)
    );
    list.dispose();

    expect(callOrder).toEqual([1, 2, 3]);
  });

  it('should clear disposers after dispose', () => {
    const list = createDisposableList();
    const disposer = vi.fn();

    list.push(disposer);
    list.dispose();
    list.dispose();

    expect(disposer).toHaveBeenCalledTimes(1);
  });

  it('should handle empty list dispose without error', () => {
    const list = createDisposableList();

    expect(() => list.dispose()).not.toThrow();
  });

  it('should allow adding disposers after dispose', () => {
    const list = createDisposableList();
    const disposer1 = vi.fn();
    const disposer2 = vi.fn();

    list.push(disposer1);
    list.dispose();

    list.push(disposer2);
    list.dispose();

    expect(disposer1).toHaveBeenCalledTimes(1);
    expect(disposer2).toHaveBeenCalledTimes(1);
  });

  it('should allow pushing disposers separately', () => {
    const list = createDisposableList();
    const disposer1 = vi.fn();
    const disposer2 = vi.fn();

    list.push(disposer1);
    list.push(disposer2);
    list.dispose();

    expect(disposer1).toHaveBeenCalledTimes(1);
    expect(disposer2).toHaveBeenCalledTimes(1);
  });
});
