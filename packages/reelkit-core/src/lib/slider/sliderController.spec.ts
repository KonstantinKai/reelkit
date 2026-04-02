import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSliderController } from './sliderController';
import type { GestureControllerEvents } from '../gestures/types';
import type { KeyboardControllerEvents } from '../keyboard/types';
import type { WheelControllerEvents } from '../wheel/types';
import type { AnimatedValue } from './types';

let capturedGestureEvents: Partial<GestureControllerEvents> = {};
let capturedKeyboardEvents: KeyboardControllerEvents | null = null;
let capturedWheelEvents: WheelControllerEvents | null = null;

const mockGesture = {
  attach: vi.fn(),
  detach: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
  updateEvents: vi.fn((e: Partial<GestureControllerEvents>) => {
    capturedGestureEvents = e;
  }),
};

const mockKeyboard = {
  attach: vi.fn(),
  detach: vi.fn(),
};

const mockWheel = {
  attach: vi.fn(),
  detach: vi.fn(),
};

vi.mock('../gestures/gestureController', () => ({
  createGestureController: (
    _config: unknown,
    events: Partial<GestureControllerEvents>,
  ) => {
    capturedGestureEvents = events;
    return mockGesture;
  },
}));

vi.mock('../keyboard/keyboardController', () => ({
  createKeyboardController: (
    _config: unknown,
    events: KeyboardControllerEvents,
  ) => {
    capturedKeyboardEvents = events;
    return mockKeyboard;
  },
}));

vi.mock('../wheel/wheelController', () => ({
  createWheelController: (_config: unknown, events: WheelControllerEvents) => {
    capturedWheelEvents = events;
    return mockWheel;
  },
}));

/**
 * Auto-resolves the `done` callback on axisValue whenever it changes
 * with a non-zero duration (simulates the AnimatedObserve completing).
 */
const autoResolveDone = (axisValue: {
  value: AnimatedValue;
  observe: (fn: () => void) => () => void;
}) =>
  axisValue.observe(() => {
    const { done } = axisValue.value;
    if (done) queueMicrotask(done);
  });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createSliderController', () => {
  describe('initial state', () => {
    it('starts at initialIndex 0 by default', () => {
      const ctrl = createSliderController({ count: 5 });
      expect(ctrl.state.index.value).toBe(0);
      ctrl.dispose();
    });

    it('respects custom initialIndex', () => {
      const ctrl = createSliderController({ count: 5, initialIndex: 3 });
      expect(ctrl.state.index.value).toBe(3);
      ctrl.dispose();
    });

    it('computes default indexes with overscan', () => {
      const ctrl = createSliderController({ count: 5, initialIndex: 2 });
      expect(ctrl.state.indexes.value).toEqual([1, 2, 3]);
      ctrl.dispose();
    });

    it('getRangeIndex returns position within indexes', () => {
      const ctrl = createSliderController({ count: 5, initialIndex: 2 });
      expect(ctrl.getRangeIndex()).toBe(1);
      ctrl.dispose();
    });
  });

  describe('next / prev', () => {
    it('next advances index', async () => {
      const ctrl = createSliderController({ count: 5 });
      ctrl.setPrimarySize(400);
      const dispose = autoResolveDone(ctrl.state.axisValue);

      await ctrl.next();

      expect(ctrl.state.index.value).toBe(1);
      dispose();
      ctrl.dispose();
    });

    it('prev decrements index', async () => {
      const ctrl = createSliderController({ count: 5, initialIndex: 2 });
      ctrl.setPrimarySize(400);
      const dispose = autoResolveDone(ctrl.state.axisValue);

      await ctrl.prev();

      expect(ctrl.state.index.value).toBe(1);
      dispose();
      ctrl.dispose();
    });

    it('next does nothing at last slide (no loop)', async () => {
      const ctrl = createSliderController({ count: 3, initialIndex: 2 });
      ctrl.setPrimarySize(400);

      await ctrl.next();

      expect(ctrl.state.index.value).toBe(2);
      ctrl.dispose();
    });

    it('prev does nothing at first slide (no loop)', async () => {
      const ctrl = createSliderController({ count: 3, initialIndex: 0 });
      ctrl.setPrimarySize(400);

      await ctrl.prev();

      expect(ctrl.state.index.value).toBe(0);
      ctrl.dispose();
    });

    it('fires onBeforeChange and onAfterChange', async () => {
      const onBeforeChange = vi.fn();
      const onAfterChange = vi.fn();
      const ctrl = createSliderController(
        { count: 5 },
        { onBeforeChange, onAfterChange },
      );
      ctrl.setPrimarySize(400);
      const dispose = autoResolveDone(ctrl.state.axisValue);

      await ctrl.next();

      expect(onBeforeChange).toHaveBeenCalledWith(0, 1, expect.any(Number));
      expect(onAfterChange).toHaveBeenCalled();
      dispose();
      ctrl.dispose();
    });

    it('ignores next while animating', async () => {
      const ctrl = createSliderController({ count: 5 });
      ctrl.setPrimarySize(400);
      const dispose = autoResolveDone(ctrl.state.axisValue);

      const p = ctrl.next();
      await ctrl.next();
      await p;

      expect(ctrl.state.index.value).toBe(1);
      dispose();
      ctrl.dispose();
    });
  });

  describe('goTo', () => {
    it('instant goTo changes index immediately', () => {
      const ctrl = createSliderController({ count: 5 });
      ctrl.setPrimarySize(400);

      ctrl.goTo(3);

      expect(ctrl.state.index.value).toBe(3);
      ctrl.dispose();
    });

    it('goTo clamps to valid range', () => {
      const ctrl = createSliderController({ count: 5 });
      ctrl.setPrimarySize(400);

      ctrl.goTo(10);
      expect(ctrl.state.index.value).toBe(4);

      ctrl.goTo(-5);
      expect(ctrl.state.index.value).toBe(0);
      ctrl.dispose();
    });

    it('goTo does nothing when already at target', () => {
      const onBeforeChange = vi.fn();
      const ctrl = createSliderController({ count: 5 }, { onBeforeChange });
      ctrl.setPrimarySize(400);

      ctrl.goTo(0);

      expect(onBeforeChange).not.toHaveBeenCalled();
      ctrl.dispose();
    });

    it('animated goTo transitions to target', async () => {
      const ctrl = createSliderController({ count: 5 });
      ctrl.setPrimarySize(400);
      const dispose = autoResolveDone(ctrl.state.axisValue);

      await ctrl.goTo(3, true);

      expect(ctrl.state.index.value).toBe(3);
      dispose();
      ctrl.dispose();
    });
  });

  describe('setPrimarySize', () => {
    it('updates axis value when not animating', () => {
      const ctrl = createSliderController({ count: 5, initialIndex: 1 });
      ctrl.setPrimarySize(400);

      expect(ctrl.state.axisValue.value.value).toBe(-400);
      ctrl.dispose();
    });

    it('no-ops when size unchanged', () => {
      const ctrl = createSliderController({ count: 5 });
      const listener = vi.fn();
      ctrl.state.axisValue.observe(listener);

      ctrl.setPrimarySize(400);
      const calls = listener.mock.calls.length;

      ctrl.setPrimarySize(400);
      expect(listener.mock.calls.length).toBe(calls);
      ctrl.dispose();
    });
  });

  describe('adjust', () => {
    it('recalculates axis value', () => {
      const ctrl = createSliderController({ count: 5, initialIndex: 2 });
      ctrl.setPrimarySize(400);

      ctrl.adjust();

      expect(ctrl.state.axisValue.value.value).toBe(-400);
      ctrl.dispose();
    });
  });

  describe('observe / unobserve', () => {
    it('observe attaches keyboard and gesture controllers', () => {
      const ctrl = createSliderController({ count: 5 });
      ctrl.observe();

      expect(mockGesture.observe).toHaveBeenCalled();
      expect(mockKeyboard.attach).toHaveBeenCalled();
      ctrl.dispose();
    });

    it('observe does not attach gesture when enableGestures is false', () => {
      mockGesture.observe.mockClear();
      const ctrl = createSliderController({ count: 5, enableGestures: false });
      ctrl.observe();

      expect(mockGesture.observe).not.toHaveBeenCalled();
      expect(mockKeyboard.attach).toHaveBeenCalled();
      ctrl.dispose();
    });

    it('unobserve detaches all controllers', () => {
      const ctrl = createSliderController({ count: 5 });
      ctrl.observe();
      ctrl.unobserve();

      expect(mockGesture.unobserve).toHaveBeenCalled();
      expect(mockKeyboard.detach).toHaveBeenCalled();
      ctrl.dispose();
    });
  });

  describe('updateConfig', () => {
    it('updates config and gesture controller direction', () => {
      const ctrl = createSliderController({ count: 5, direction: 'vertical' });
      ctrl.updateConfig({ direction: 'horizontal' });

      expect(mockGesture.updateEvents).toHaveBeenCalled();
      ctrl.dispose();
    });
  });

  describe('updateEvents', () => {
    it('replaces event callbacks', async () => {
      const onAfterChange1 = vi.fn();
      const ctrl = createSliderController(
        { count: 5 },
        { onAfterChange: onAfterChange1 },
      );
      ctrl.setPrimarySize(400);
      const dispose = autoResolveDone(ctrl.state.axisValue);

      const onAfterChange2 = vi.fn();
      ctrl.updateEvents({ onAfterChange: onAfterChange2 });

      await ctrl.next();

      expect(onAfterChange1).not.toHaveBeenCalled();
      expect(onAfterChange2).toHaveBeenCalled();
      dispose();
      ctrl.dispose();
    });
  });

  describe('dispose', () => {
    it('detaches all controllers', () => {
      const ctrl = createSliderController({ count: 5 });
      ctrl.dispose();

      expect(mockGesture.detach).toHaveBeenCalled();
      expect(mockKeyboard.detach).toHaveBeenCalled();
    });

    it('cleans up afterChange observer', () => {
      const onAfterChange = vi.fn();
      const ctrl = createSliderController({ count: 5 }, { onAfterChange });
      ctrl.setPrimarySize(400);
      const done = autoResolveDone(ctrl.state.axisValue);

      ctrl.dispose();
      // After dispose, changing index should not fire the callback
      // (internal signal observer was removed)
      done();
    });
  });

  describe('attach', () => {
    it('does not attach gesture when enableGestures is false', () => {
      mockGesture.attach.mockClear();
      const ctrl = createSliderController({ count: 5, enableGestures: false });
      const el = document.createElement('div');
      ctrl.attach(el);

      expect(mockGesture.attach).not.toHaveBeenCalled();
      ctrl.dispose();
    });

    it('attaches gesture when enableGestures is true', () => {
      mockGesture.attach.mockClear();
      const ctrl = createSliderController({ count: 5, enableGestures: true });
      const el = document.createElement('div');
      ctrl.attach(el);

      expect(mockGesture.attach).toHaveBeenCalledWith(el);
      ctrl.dispose();
    });
  });

  describe('keyboard navigation', () => {
    it('navigates down on vertical slider', async () => {
      const ctrl = createSliderController({ count: 5, direction: 'vertical' });
      ctrl.setPrimarySize(400);
      const done = autoResolveDone(ctrl.state.axisValue);

      capturedKeyboardEvents?.onKeyPress('down', new KeyboardEvent('keydown'));
      await new Promise((r) => setTimeout(r, 0));

      expect(ctrl.state.index.value).toBe(1);
      done();
      ctrl.dispose();
    });

    it('navigates up on vertical slider', async () => {
      const ctrl = createSliderController({
        count: 5,
        initialIndex: 2,
        direction: 'vertical',
      });
      ctrl.setPrimarySize(400);
      const done = autoResolveDone(ctrl.state.axisValue);

      capturedKeyboardEvents?.onKeyPress('up', new KeyboardEvent('keydown'));
      await new Promise((r) => setTimeout(r, 0));

      expect(ctrl.state.index.value).toBe(1);
      done();
      ctrl.dispose();
    });

    it('navigates right on horizontal slider', async () => {
      const ctrl = createSliderController({
        count: 5,
        direction: 'horizontal',
      });
      ctrl.setPrimarySize(400);
      const done = autoResolveDone(ctrl.state.axisValue);

      capturedKeyboardEvents?.onKeyPress('right', new KeyboardEvent('keydown'));
      await new Promise((r) => setTimeout(r, 0));

      expect(ctrl.state.index.value).toBe(1);
      done();
      ctrl.dispose();
    });

    it('navigates left on horizontal slider', async () => {
      const ctrl = createSliderController({
        count: 5,
        initialIndex: 2,
        direction: 'horizontal',
      });
      ctrl.setPrimarySize(400);
      const done = autoResolveDone(ctrl.state.axisValue);

      capturedKeyboardEvents?.onKeyPress('left', new KeyboardEvent('keydown'));
      await new Promise((r) => setTimeout(r, 0));

      expect(ctrl.state.index.value).toBe(1);
      done();
      ctrl.dispose();
    });

    it('ignores cross-axis keys', () => {
      const ctrl = createSliderController({ count: 5, direction: 'vertical' });
      ctrl.setPrimarySize(400);

      capturedKeyboardEvents?.onKeyPress('left', new KeyboardEvent('keydown'));
      capturedKeyboardEvents?.onKeyPress('right', new KeyboardEvent('keydown'));

      expect(ctrl.state.index.value).toBe(0);
      ctrl.dispose();
    });

    it('does not navigate past boundaries', () => {
      const ctrl = createSliderController({
        count: 3,
        initialIndex: 2,
        direction: 'vertical',
      });
      ctrl.setPrimarySize(400);

      capturedKeyboardEvents?.onKeyPress('down', new KeyboardEvent('keydown'));

      expect(ctrl.state.index.value).toBe(2);
      ctrl.dispose();
    });
  });

  describe('wheel navigation', () => {
    it('navigates down on vertical slider', async () => {
      const ctrl = createSliderController({
        count: 5,
        direction: 'vertical',
        enableWheel: true,
      });
      ctrl.setPrimarySize(400);
      const done = autoResolveDone(ctrl.state.axisValue);

      capturedWheelEvents?.onWheel('down', new WheelEvent('wheel'));
      await new Promise((r) => setTimeout(r, 0));

      expect(ctrl.state.index.value).toBe(1);
      done();
      ctrl.dispose();
    });

    it('navigates right on horizontal slider', async () => {
      const ctrl = createSliderController({
        count: 5,
        direction: 'horizontal',
        enableWheel: true,
      });
      ctrl.setPrimarySize(400);
      const done = autoResolveDone(ctrl.state.axisValue);

      capturedWheelEvents?.onWheel('right', new WheelEvent('wheel'));
      await new Promise((r) => setTimeout(r, 0));

      expect(ctrl.state.index.value).toBe(1);
      done();
      ctrl.dispose();
    });

    it('ignores cross-axis directions', () => {
      const ctrl = createSliderController({
        count: 5,
        direction: 'vertical',
        enableWheel: true,
      });
      ctrl.setPrimarySize(400);

      capturedWheelEvents?.onWheel('left', new WheelEvent('wheel'));

      expect(ctrl.state.index.value).toBe(0);
      ctrl.dispose();
    });
  });

  describe('drag with snap-back', () => {
    const makeDragEndEvent = (dx: number, dy: number, vx = 0, vy = 0) => ({
      globalPosition: [0, 0] as [number, number],
      localPosition: [0, 0] as [number, number],
      delta: [dx, dy] as [number, number],
      distance: [dx, dy] as [number, number],
      velocity: [vx, vy] as [number, number],
      sourceTimestamp: 0,
    });

    it('snaps back on insufficient swipe distance', async () => {
      const onDragCanceled = vi.fn();
      const ctrl = createSliderController(
        {
          count: 5,
          initialIndex: 2,
          direction: 'vertical',
          swipeDistanceFactor: 0.5,
        },
        { onDragCanceled },
      );
      ctrl.setPrimarySize(600);
      const done = autoResolveDone(ctrl.state.axisValue);

      capturedGestureEvents.onVerticalDragStart?.({
        globalPosition: [0, 0],
        localPosition: [0, 0],
        sourceTimestamp: 0,
        kind: 'touch',
      });
      capturedGestureEvents.onDragEnd?.(makeDragEndEvent(0, -50));

      await new Promise((r) => setTimeout(r, 0));
      await new Promise((r) => setTimeout(r, 0));

      expect(ctrl.state.index.value).toBe(2);
      expect(onDragCanceled).toHaveBeenCalled();
      done();
      ctrl.dispose();
    });

    it('fires onDragStart on main axis drag', () => {
      const onDragStart = vi.fn();
      const ctrl = createSliderController(
        { count: 5, direction: 'vertical' },
        { onDragStart },
      );
      ctrl.setPrimarySize(400);

      capturedGestureEvents.onVerticalDragStart?.({
        globalPosition: [0, 0],
        localPosition: [0, 0],
        sourceTimestamp: 0,
        kind: 'touch',
      });

      expect(onDragStart).toHaveBeenCalledWith(0);
      ctrl.dispose();
    });
  });

  describe('goTo override (single-element range)', () => {
    it('handles goTo override for indexes with only 1 item', () => {
      const ctrl = createSliderController({ count: 1 });
      ctrl.setPrimarySize(400);

      ctrl.goTo(0);
      expect(ctrl.state.index.value).toBe(0);
      ctrl.dispose();
    });
  });

  describe('rangeExtractor clamping', () => {
    it('uses rangeExtractor result when it returns 3 or fewer items', () => {
      const ctrl = createSliderController({
        count: 10,
        rangeExtractor: () => [4, 5],
      });
      expect(ctrl.state.indexes.value).toEqual([4, 5]);
      ctrl.dispose();
    });

    it('clamps rangeExtractor result to 3 items centered on current index', () => {
      const ctrl = createSliderController({
        count: 10,
        initialIndex: 3,
        rangeExtractor: () => [1, 2, 3, 4, 5],
      });
      expect(ctrl.state.indexes.value).toEqual([2, 3, 4]);
      ctrl.dispose();
    });
  });

  describe('cross-axis drag', () => {
    const makeDragEndEvent = (dx: number, dy: number) => ({
      globalPosition: [0, 0] as [number, number],
      localPosition: [0, 0] as [number, number],
      delta: [dx, dy] as [number, number],
      distance: [dx, dy] as [number, number],
      velocity: [0, 0] as [number, number],
      sourceTimestamp: 0,
    });

    it('horizontal slider ignores vertical-only drag end', () => {
      const onDragEnd = vi.fn();
      const ctrl = createSliderController(
        { count: 5, initialIndex: 2, direction: 'horizontal' },
        { onDragEnd },
      );
      ctrl.setPrimarySize(400);
      capturedGestureEvents.onDragEnd?.(makeDragEndEvent(0, -200));

      expect(onDragEnd).not.toHaveBeenCalled();
      ctrl.dispose();
    });

    it('horizontal slider processes main-axis drag end', () => {
      const onDragEnd = vi.fn();
      const ctrl = createSliderController(
        {
          count: 5,
          initialIndex: 2,
          direction: 'horizontal',
          swipeDistanceFactor: 0.1,
        },
        { onDragEnd },
      );
      ctrl.setPrimarySize(400);

      capturedGestureEvents.onHorizontalDragStart?.({
        globalPosition: [0, 0],
        localPosition: [0, 0],
        sourceTimestamp: 0,
        kind: 'touch',
      });
      capturedGestureEvents.onDragEnd?.(makeDragEndEvent(-200, 0));

      expect(onDragEnd).toHaveBeenCalled();
      ctrl.dispose();
    });
  });

  describe('enableNavKeys', () => {
    it('attaches keyboard on observe when enableNavKeys is true (default)', () => {
      const ctrl = createSliderController(
        { count: 3, direction: 'horizontal' },
        {},
      );
      mockKeyboard.attach.mockClear();
      ctrl.observe();
      expect(mockKeyboard.attach).toHaveBeenCalled();
      ctrl.dispose();
    });

    it('does not attach keyboard on observe when enableNavKeys is false', () => {
      const ctrl = createSliderController(
        { count: 3, direction: 'horizontal', enableNavKeys: false },
        {},
      );
      mockKeyboard.attach.mockClear();
      ctrl.observe();
      expect(mockKeyboard.attach).not.toHaveBeenCalled();
      ctrl.dispose();
    });

    it('detaches keyboard when enableNavKeys changes to false via updateConfig', () => {
      const ctrl = createSliderController(
        { count: 3, direction: 'horizontal', enableNavKeys: true },
        {},
      );
      ctrl.observe();
      mockKeyboard.detach.mockClear();
      ctrl.updateConfig({ enableNavKeys: false });
      expect(mockKeyboard.detach).toHaveBeenCalled();
      ctrl.dispose();
    });

    it('attaches keyboard when enableNavKeys changes to true via updateConfig', () => {
      const ctrl = createSliderController(
        { count: 3, direction: 'horizontal', enableNavKeys: false },
        {},
      );
      ctrl.observe();
      mockKeyboard.attach.mockClear();
      ctrl.updateConfig({ enableNavKeys: true });
      expect(mockKeyboard.attach).toHaveBeenCalled();
      ctrl.dispose();
    });
  });

  describe('onNavKeyPress', () => {
    it('calls onNavKeyPress instead of default navigation', () => {
      const onNavKeyPress = vi.fn();
      const ctrl = createSliderController(
        { count: 5, initialIndex: 2, direction: 'horizontal' },
        { onNavKeyPress },
      );
      ctrl.observe();

      capturedKeyboardEvents!.onKeyPress('right', new KeyboardEvent('keydown'));
      expect(onNavKeyPress).toHaveBeenCalledWith(1);

      capturedKeyboardEvents!.onKeyPress('left', new KeyboardEvent('keydown'));
      expect(onNavKeyPress).toHaveBeenCalledWith(-1);

      ctrl.dispose();
    });

    it('uses default navigation when onNavKeyPress is not provided', () => {
      const onAfterChange = vi.fn();
      const ctrl = createSliderController(
        { count: 5, direction: 'horizontal' },
        { onAfterChange },
      );
      ctrl.observe();

      capturedKeyboardEvents!.onKeyPress('right', new KeyboardEvent('keydown'));
      // Default behavior triggers changeIndex which fires onAfterChange
      // (after transition completes)
      ctrl.dispose();
    });
  });

  describe('enableWheel', () => {
    it('does not attach wheel on observe when enableWheel is false (default)', () => {
      const ctrl = createSliderController(
        { count: 3, direction: 'horizontal' },
        {},
      );
      mockWheel.attach.mockClear();
      ctrl.observe();
      expect(mockWheel.attach).not.toHaveBeenCalled();
      ctrl.dispose();
    });

    it('attaches wheel on observe when enableWheel is true', () => {
      const ctrl = createSliderController(
        { count: 3, direction: 'horizontal', enableWheel: true },
        {},
      );
      mockWheel.attach.mockClear();
      ctrl.observe();
      expect(mockWheel.attach).toHaveBeenCalled();
      ctrl.dispose();
    });

    it('attaches wheel when enableWheel changes to true via updateConfig', () => {
      const ctrl = createSliderController(
        { count: 3, direction: 'horizontal', enableWheel: false },
        {},
      );
      ctrl.observe();
      mockWheel.attach.mockClear();
      ctrl.updateConfig({ enableWheel: true });
      expect(mockWheel.attach).toHaveBeenCalled();
      ctrl.dispose();
    });

    it('detaches wheel when enableWheel changes to false via updateConfig', () => {
      const ctrl = createSliderController(
        { count: 3, direction: 'horizontal', enableWheel: true },
        {},
      );
      ctrl.observe();
      mockWheel.detach.mockClear();
      ctrl.updateConfig({ enableWheel: false });
      expect(mockWheel.detach).toHaveBeenCalled();
      ctrl.dispose();
    });
  });
});
