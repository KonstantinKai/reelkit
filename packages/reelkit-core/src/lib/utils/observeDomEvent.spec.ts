import { describe, it, expect, vi } from 'vitest';
import { observeDomEvent } from './observeDomEvent';

describe('observeDomEvent', () => {
  it('should add event listener to target', () => {
    const target = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLElement;
    const callback = vi.fn();

    observeDomEvent(target, 'click', callback);

    expect(target.addEventListener).toHaveBeenCalledWith('click', callback, undefined);
  });

  it('should pass options to addEventListener', () => {
    const target = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLElement;
    const callback = vi.fn();
    const options = { passive: true, capture: true };

    observeDomEvent(target, 'click', callback, options);

    expect(target.addEventListener).toHaveBeenCalledWith('click', callback, options);
  });

  it('should return function that removes event listener', () => {
    const target = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLElement;
    const callback = vi.fn();

    const dispose = observeDomEvent(target, 'click', callback);
    dispose();

    expect(target.removeEventListener).toHaveBeenCalledWith('click', callback, undefined);
  });

  it('should pass options to removeEventListener', () => {
    const target = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLElement;
    const callback = vi.fn();
    const options = { passive: true, capture: true };

    const dispose = observeDomEvent(target, 'click', callback, options);
    dispose();

    expect(target.removeEventListener).toHaveBeenCalledWith('click', callback, options);
  });

  it('should work with different event types', () => {
    const target = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLElement;

    observeDomEvent(target, 'mousedown', vi.fn());
    observeDomEvent(target, 'touchstart', vi.fn());
    observeDomEvent(target, 'keydown', vi.fn());

    expect(target.addEventListener).toHaveBeenCalledTimes(3);
    expect(target.addEventListener).toHaveBeenNthCalledWith(1, 'mousedown', expect.any(Function), undefined);
    expect(target.addEventListener).toHaveBeenNthCalledWith(2, 'touchstart', expect.any(Function), undefined);
    expect(target.addEventListener).toHaveBeenNthCalledWith(3, 'keydown', expect.any(Function), undefined);
  });
});
