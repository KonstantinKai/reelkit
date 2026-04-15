import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createWheelController } from './wheelController';
import type { WheelDirection } from './types';

const dispatch = (deltaX: number, deltaY: number) =>
  window.dispatchEvent(
    new WheelEvent('wheel', { deltaX, deltaY, cancelable: true }),
  );

describe('createWheelController', () => {
  let onWheel: ReturnType<
    typeof vi.fn<(direction: WheelDirection, event: WheelEvent) => void>
  >;

  beforeEach(() => {
    vi.useFakeTimers();
    onWheel = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('direction mapping', () => {
    it('maps positive deltaY to down', () => {
      const ctrl = createWheelController({}, { onWheel });
      ctrl.attach();
      dispatch(0, 50);
      vi.advanceTimersByTime(200);

      expect(onWheel).toHaveBeenCalledWith('down', expect.any(WheelEvent));
      ctrl.detach();
    });

    it('maps negative deltaY to up', () => {
      const ctrl = createWheelController({}, { onWheel });
      ctrl.attach();
      dispatch(0, -50);
      vi.advanceTimersByTime(200);

      expect(onWheel).toHaveBeenCalledWith('up', expect.any(WheelEvent));
      ctrl.detach();
    });

    it('maps positive deltaX to right', () => {
      const ctrl = createWheelController({}, { onWheel });
      ctrl.attach();
      dispatch(50, 0);
      vi.advanceTimersByTime(200);

      expect(onWheel).toHaveBeenCalledWith('right', expect.any(WheelEvent));
      ctrl.detach();
    });

    it('maps negative deltaX to left', () => {
      const ctrl = createWheelController({}, { onWheel });
      ctrl.attach();
      dispatch(-50, 0);
      vi.advanceTimersByTime(200);

      expect(onWheel).toHaveBeenCalledWith('left', expect.any(WheelEvent));
      ctrl.detach();
    });

    it('prefers vertical over horizontal when both exceed threshold', () => {
      const ctrl = createWheelController({}, { onWheel });
      ctrl.attach();
      dispatch(50, 50);
      vi.advanceTimersByTime(200);

      expect(onWheel).toHaveBeenCalledWith('down', expect.any(WheelEvent));
      ctrl.detach();
    });
  });

  describe('threshold', () => {
    it('ignores events below default threshold', () => {
      const ctrl = createWheelController({}, { onWheel });
      ctrl.attach();
      dispatch(0, 5);
      vi.advanceTimersByTime(200);

      expect(onWheel).not.toHaveBeenCalled();
      ctrl.detach();
    });

    it('respects custom threshold', () => {
      const ctrl = createWheelController({ deltaThreshold: 100 }, { onWheel });
      ctrl.attach();

      dispatch(0, 50);
      vi.advanceTimersByTime(200);
      expect(onWheel).not.toHaveBeenCalled();

      dispatch(0, 100);
      vi.advanceTimersByTime(200);
      expect(onWheel).toHaveBeenCalledTimes(1);
      ctrl.detach();
    });
  });

  describe('debounce', () => {
    it('debounces rapid events into one callback', () => {
      const ctrl = createWheelController({}, { onWheel });
      ctrl.attach();

      dispatch(0, 50);
      dispatch(0, 50);
      dispatch(0, 50);
      vi.advanceTimersByTime(200);

      expect(onWheel).toHaveBeenCalledTimes(1);
      ctrl.detach();
    });

    it('uses the last direction when direction changes during debounce', () => {
      const ctrl = createWheelController({}, { onWheel });
      ctrl.attach();

      dispatch(0, 50);
      dispatch(0, -50);
      vi.advanceTimersByTime(200);

      expect(onWheel).toHaveBeenCalledWith('up', expect.any(WheelEvent));
      ctrl.detach();
    });

    it('respects custom debounceMs', () => {
      const ctrl = createWheelController({ debounceMs: 500 }, { onWheel });
      ctrl.attach();

      dispatch(0, 50);
      vi.advanceTimersByTime(200);
      expect(onWheel).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);
      expect(onWheel).toHaveBeenCalledTimes(1);
      ctrl.detach();
    });

    it('fires separate callbacks for events outside debounce window', () => {
      const ctrl = createWheelController({}, { onWheel });
      ctrl.attach();

      dispatch(0, 50);
      vi.advanceTimersByTime(200);

      dispatch(0, -50);
      vi.advanceTimersByTime(200);

      expect(onWheel).toHaveBeenCalledTimes(2);
      expect(onWheel).toHaveBeenNthCalledWith(
        1,
        'down',
        expect.any(WheelEvent),
      );
      expect(onWheel).toHaveBeenNthCalledWith(2, 'up', expect.any(WheelEvent));
      ctrl.detach();
    });
  });

  describe('attach / detach', () => {
    it('does not fire before attach', () => {
      createWheelController({}, { onWheel });
      dispatch(0, 50);
      vi.advanceTimersByTime(200);

      expect(onWheel).not.toHaveBeenCalled();
    });

    it('does not fire after detach', () => {
      const ctrl = createWheelController({}, { onWheel });
      ctrl.attach();
      ctrl.detach();

      dispatch(0, 50);
      vi.advanceTimersByTime(200);

      expect(onWheel).not.toHaveBeenCalled();
    });

    it('cancels pending debounce on detach', () => {
      const ctrl = createWheelController({}, { onWheel });
      ctrl.attach();

      dispatch(0, 50);
      ctrl.detach();
      vi.advanceTimersByTime(200);

      expect(onWheel).not.toHaveBeenCalled();
    });

    it('re-attaches after detach', () => {
      const ctrl = createWheelController({}, { onWheel });
      ctrl.attach();
      ctrl.detach();
      ctrl.attach();

      dispatch(0, 50);
      vi.advanceTimersByTime(200);

      expect(onWheel).toHaveBeenCalledTimes(1);
      ctrl.detach();
    });

    it('replaces listener on double attach', () => {
      const ctrl = createWheelController({}, { onWheel });
      ctrl.attach();
      ctrl.attach();

      dispatch(0, 50);
      vi.advanceTimersByTime(200);

      expect(onWheel).toHaveBeenCalledTimes(1);
      ctrl.detach();
    });
  });

  describe('preventDefault', () => {
    it('calls preventDefault on qualifying events', () => {
      const ctrl = createWheelController({}, { onWheel });
      ctrl.attach();

      const event = new WheelEvent('wheel', { deltaY: 50, cancelable: true });
      const spy = vi.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);

      expect(spy).toHaveBeenCalled();
      ctrl.detach();
    });

    it('does not call preventDefault on sub-threshold events', () => {
      const ctrl = createWheelController({}, { onWheel });
      ctrl.attach();

      const event = new WheelEvent('wheel', { deltaY: 1, cancelable: true });
      const spy = vi.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);

      expect(spy).not.toHaveBeenCalled();
      ctrl.detach();
    });
  });
});
