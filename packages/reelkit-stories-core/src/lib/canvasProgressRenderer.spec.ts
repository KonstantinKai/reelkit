import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCanvasProgressRenderer } from './canvasProgressRenderer';

function createMockCanvas(parentWidth = 300): {
  canvas: HTMLCanvasElement;
  parent: HTMLDivElement;
} {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', {
    value: parentWidth,
    configurable: true,
  });
  document.body.appendChild(parent);

  const canvas = document.createElement('canvas');
  parent.appendChild(canvas);

  return { canvas, parent };
}

describe('createCanvasProgressRenderer', () => {
  beforeEach(() => {
    vi.stubGlobal('devicePixelRatio', 1);
    globalThis.ResizeObserver = class {
      observe() {
        /* noop */
      }
      unobserve() {
        /* noop */
      }
      disconnect() {
        /* noop */
      }
    } as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('creates a renderer with attach, draw, dispose', () => {
    const renderer = createCanvasProgressRenderer();
    expect(renderer.attach).toBeTypeOf('function');
    expect(renderer.draw).toBeTypeOf('function');
    expect(renderer.dispose).toBeTypeOf('function');
  });

  it('width is 0 before attach', () => {
    const renderer = createCanvasProgressRenderer();
    expect(renderer.width).toBe(0);
  });

  it('measures width after attach', () => {
    const { canvas } = createMockCanvas(300);
    const renderer = createCanvasProgressRenderer();
    renderer.attach(canvas);
    expect(renderer.width).toBe(300);
  });

  it('sets canvas dimensions on attach', () => {
    const { canvas } = createMockCanvas(300);
    const renderer = createCanvasProgressRenderer({ barHeight: 4 });
    renderer.attach(canvas);
    expect(canvas.width).toBe(300);
    expect(canvas.height).toBe(4);
    expect(canvas.style.width).toBe('300px');
    expect(canvas.style.height).toBe('4px');
  });

  it('scales canvas by devicePixelRatio', () => {
    vi.stubGlobal('devicePixelRatio', 2);
    const { canvas } = createMockCanvas(300);
    const renderer = createCanvasProgressRenderer({ barHeight: 2 });
    renderer.attach(canvas);
    expect(canvas.width).toBe(600);
    expect(canvas.height).toBe(4);
    expect(canvas.style.width).toBe('300px');
  });

  it('draw does not throw before attach', () => {
    const renderer = createCanvasProgressRenderer();
    expect(() => renderer.draw(5, 0, 0)).not.toThrow();
  });

  it('draw does not throw with valid state', () => {
    const { canvas } = createMockCanvas();
    const renderer = createCanvasProgressRenderer();
    renderer.attach(canvas);
    expect(() => renderer.draw(5, 2, 0.5)).not.toThrow();
  });

  it('draw clears rect before drawing', () => {
    const { canvas } = createMockCanvas();
    const renderer = createCanvasProgressRenderer();
    renderer.attach(canvas);

    const ctx = canvas.getContext('2d')!;
    const clearSpy = vi.spyOn(ctx, 'clearRect');

    renderer.draw(3, 0, 0);
    expect(clearSpy).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
  });

  it('draw calls fill for each segment background', () => {
    const { canvas } = createMockCanvas();
    const renderer = createCanvasProgressRenderer();
    renderer.attach(canvas);

    const ctx = canvas.getContext('2d')!;
    const fillSpy = vi.spyOn(ctx, 'fill');

    renderer.draw(3, 1, 0.5);
    // 3 background fills + completed segment fill + active segment fill = 5
    expect(fillSpy.mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it('dispose resets width to 0', () => {
    const { canvas } = createMockCanvas();
    const renderer = createCanvasProgressRenderer();
    renderer.attach(canvas);
    expect(renderer.width).toBe(300);

    renderer.dispose();
    expect(renderer.width).toBe(0);
  });

  it('dispose disconnects ResizeObserver', () => {
    const disconnectSpy = vi.fn();
    globalThis.ResizeObserver = class {
      observe() {
        /* noop */
      }
      unobserve() {
        /* noop */
      }
      disconnect = disconnectSpy;
    } as unknown as typeof ResizeObserver;

    const { canvas } = createMockCanvas();
    const renderer = createCanvasProgressRenderer();
    renderer.attach(canvas);
    renderer.dispose();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('accepts custom gap and barHeight', () => {
    const { canvas } = createMockCanvas();
    const renderer = createCanvasProgressRenderer({ gap: 4, barHeight: 6 });
    renderer.attach(canvas);
    expect(canvas.height).toBe(6);
  });

  it('handles totalStories = 0 without error', () => {
    const { canvas } = createMockCanvas();
    const renderer = createCanvasProgressRenderer();
    renderer.attach(canvas);
    expect(() => renderer.draw(0, 0, 0)).not.toThrow();
  });

  it('handles totalStories = 1', () => {
    const { canvas } = createMockCanvas();
    const renderer = createCanvasProgressRenderer();
    renderer.attach(canvas);
    expect(() => renderer.draw(1, 0, 0.75)).not.toThrow();
  });

  it('handles large story count triggering sliding window', () => {
    const { canvas } = createMockCanvas(200);
    const renderer = createCanvasProgressRenderer({
      minSegmentWidth: 8,
      gap: 2,
    });
    renderer.attach(canvas);
    // 200px / (8+2) = 20 max visible, 100 stories triggers window
    expect(() => renderer.draw(100, 50, 0.3)).not.toThrow();
  });
});
