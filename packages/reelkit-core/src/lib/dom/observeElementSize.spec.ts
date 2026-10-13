import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  installResizeObserverStub,
  type ResizeObserverStub,
} from '../../testing';
import { observeElementSize } from './observeElementSize';

describe('observeElementSize', () => {
  let stub: ResizeObserverStub;

  beforeEach(() => {
    stub = installResizeObserverStub();
  });

  afterEach(() => {
    stub.restore();
  });

  it('reports the element size when it changes', () => {
    const element = document.createElement('div');
    const callback = vi.fn();

    observeElementSize(element, callback);
    stub.resize(400, 600);

    expect(callback).toHaveBeenCalledWith([400, 600]);
  });

  it('reports the padding box, not the content box', () => {
    const element = document.createElement('div');
    element.style.padding = '10px';
    const callback = vi.fn();

    observeElementSize(element, callback);
    // clientWidth includes padding; the stub stands in for the layout engine.
    stub.resize(420, 620);

    expect(callback).toHaveBeenCalledWith([420, 620]);
  });

  it('skips a size with a zero dimension', () => {
    const element = document.createElement('div');
    const callback = vi.fn();

    observeElementSize(element, callback);
    stub.resize(0, 600);
    stub.resize(400, 0);

    expect(callback).not.toHaveBeenCalled();
  });

  it('skips a size equal to the last one reported', () => {
    const element = document.createElement('div');
    const callback = vi.fn();

    observeElementSize(element, callback);
    stub.resize(400, 600);
    stub.resize(400, 600);
    stub.resize(320, 600);

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith([320, 600]);
  });

  it('stops observing once disposed', () => {
    const element = document.createElement('div');
    const callback = vi.fn();

    const dispose = observeElementSize(element, callback);
    expect(stub.observed).toEqual([element]);

    dispose();
    stub.resize(400, 600);

    expect(stub.observed).toEqual([]);
    expect(stub.disconnected).toBe(1);
    expect(callback).not.toHaveBeenCalled();
  });

  it('does nothing without ResizeObserver, as during server rendering', () => {
    stub.restore();
    const original = globalThis.ResizeObserver;
    // @ts-expect-error simulating an environment without the API
    delete globalThis.ResizeObserver;

    try {
      const callback = vi.fn();
      const dispose = observeElementSize(
        document.createElement('div'),
        callback,
      );

      expect(() => dispose()).not.toThrow();
      expect(callback).not.toHaveBeenCalled();
    } finally {
      globalThis.ResizeObserver = original;
    }
  });
});
