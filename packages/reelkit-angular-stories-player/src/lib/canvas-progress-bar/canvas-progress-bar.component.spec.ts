import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createSignal } from '@reelkit/angular';
import { RkCanvasProgressBarComponent } from './canvas-progress-bar.component';

const mockRenderer = {
  attach: jest.fn(),
  draw: jest.fn(),
  dispose: jest.fn(),
  width: 300,
  /** Every configuration a renderer was created with, newest last. */
  configs: [] as unknown[],
};

jest.mock('@reelkit/stories-core', () => ({
  ...jest.requireActual('@reelkit/stories-core'),
  createCanvasProgressRenderer: (config: unknown) => {
    mockRenderer.configs.push(config);
    return mockRenderer;
  },
}));

let resizeCallbacks: (() => void)[] = [];

function createBar(
  inputs: Record<string, unknown>,
): ComponentFixture<RkCanvasProgressBarComponent> {
  const fixture = TestBed.createComponent(RkCanvasProgressBarComponent);
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
  fixture.detectChanges();
  return fixture;
}

describe('RkCanvasProgressBarComponent', () => {
  // Angular schedules work on animation frames too, so a call count says
  // nothing about the bar; what a frame draws does.
  let frames = new Map<number, FrameRequestCallback>();
  let nextFrame = 0;
  const frame = jest.fn((callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  const cancelFrame = (id: number) => frames.delete(id);
  const drawsOnNextFrame = (): boolean => {
    mockRenderer.draw.mockClear();
    const due = [...frames.values()];
    frames = new Map();
    due.forEach((callback) => callback(0));
    return mockRenderer.draw.mock.calls.length > 0;
  };
  const originalFrame = globalThis.requestAnimationFrame;
  const originalCancel = globalThis.cancelAnimationFrame;
  const originalObserver = globalThis.ResizeObserver;

  beforeEach(() => {
    resizeCallbacks = [];
    frames = new Map();
    mockRenderer.attach.mockClear();
    mockRenderer.draw.mockClear();
    mockRenderer.dispose.mockClear();
    frame.mockClear();
    globalThis.requestAnimationFrame = frame;
    globalThis.cancelAnimationFrame = cancelFrame;
    globalThis.ResizeObserver = class {
      constructor(callback: () => void) {
        resizeCallbacks.push(callback);
      }
      observe() {
        /* noop */
      }
      disconnect() {
        /* noop */
      }
    } as unknown as typeof ResizeObserver;
    TestBed.configureTestingModule({
      imports: [RkCanvasProgressBarComponent],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    globalThis.requestAnimationFrame = originalFrame;
    globalThis.cancelAnimationFrame = originalCancel;
    globalThis.ResizeObserver = originalObserver;
  });

  // The same separate inputs the React and Vue bars take, rather than one
  // configuration object.
  it('hands its separate size and colour inputs to the renderer', () => {
    mockRenderer.configs.length = 0;
    createBar({
      totalStories: 3,
      activeIndex: createSignal(0),
      progress: createSignal(0),
      gap: 4,
      barHeight: 6,
      minSegmentWidth: 12,
      bgColor: '#333',
      fillColor: '#f0f',
    });

    expect(mockRenderer.configs.at(-1)).toEqual({
      gap: 4,
      barHeight: 6,
      minSegmentWidth: 12,
      bgColor: '#333',
      fillColor: '#f0f',
    });
  });

  it('keeps an animation loop running by default', () => {
    createBar({
      totalStories: 3,
      activeIndex: createSignal(1),
      progress: createSignal(0.5),
    });

    expect(drawsOnNextFrame()).toBe(true);
    expect(drawsOnNextFrame()).toBe(true);
  });

  it('draws a still bar once, without an animation loop', () => {
    createBar({
      live: false,
      totalStories: 3,
      activeIndex: createSignal(1),
      progress: createSignal(0.5),
    });

    expect(mockRenderer.draw).toHaveBeenCalledTimes(1);
    expect(mockRenderer.draw).toHaveBeenLastCalledWith(3, 1, 0.5);
    expect(drawsOnNextFrame()).toBe(false);
  });

  it('redraws a still bar when its signals change', () => {
    const activeIndex = createSignal(0);
    const progress = createSignal(0.25);
    createBar({ live: false, totalStories: 3, activeIndex, progress });

    activeIndex.value = 2;
    expect(mockRenderer.draw).toHaveBeenLastCalledWith(3, 2, 0.25);

    progress.value = 1;
    expect(mockRenderer.draw).toHaveBeenLastCalledWith(3, 2, 1);
  });

  // Resizing the canvas clears it, and nothing else would paint a bar that
  // has no animation loop.
  it('redraws a still bar after its container resizes', () => {
    createBar({
      live: false,
      totalStories: 3,
      activeIndex: createSignal(1),
      progress: createSignal(0.5),
    });
    mockRenderer.draw.mockClear();

    resizeCallbacks.forEach((callback) => callback());

    expect(mockRenderer.draw).toHaveBeenCalledWith(3, 1, 0.5);
  });

  it('draws from new signals handed to it after mount', () => {
    const fixture = createBar({
      live: false,
      totalStories: 3,
      activeIndex: createSignal(0),
      progress: createSignal(0),
    });

    fixture.componentRef.setInput('totalStories', 4);
    fixture.componentRef.setInput('activeIndex', createSignal(2));
    fixture.componentRef.setInput('progress', createSignal(0.75));
    fixture.detectChanges();

    expect(mockRenderer.draw).toHaveBeenLastCalledWith(4, 2, 0.75);
  });

  it('does not redraw when change detection runs with nothing changed', () => {
    const fixture = createBar({
      live: false,
      totalStories: 3,
      activeIndex: createSignal(1),
      progress: createSignal(0.5),
    });
    mockRenderer.draw.mockClear();
    mockRenderer.attach.mockClear();

    fixture.detectChanges();
    fixture.detectChanges();

    expect(mockRenderer.draw).not.toHaveBeenCalled();
    expect(mockRenderer.attach).not.toHaveBeenCalled();
  });

  // A group the player leaves hands its bar still signals. The loop from when
  // it was live must end, or it keeps painting the running timer over them.
  it('stops its animation loop when it stops being live', () => {
    const fixture = createBar({
      totalStories: 3,
      activeIndex: createSignal(0),
      progress: createSignal(0),
    });
    expect(drawsOnNextFrame()).toBe(true);

    fixture.componentRef.setInput('live', false);
    fixture.componentRef.setInput('activeIndex', createSignal(1));
    fixture.componentRef.setInput('progress', createSignal(0.5));
    fixture.detectChanges();
    mockRenderer.draw.mockClear();

    expect(drawsOnNextFrame()).toBe(false);
    expect(mockRenderer.dispose).toHaveBeenCalled();
  });

  it('starts its animation loop when it turns live', () => {
    const fixture = createBar({
      live: false,
      totalStories: 3,
      activeIndex: createSignal(0),
      progress: createSignal(0),
    });
    expect(drawsOnNextFrame()).toBe(false);

    fixture.componentRef.setInput('live', true);
    fixture.detectChanges();

    expect(drawsOnNextFrame()).toBe(true);
  });
});
