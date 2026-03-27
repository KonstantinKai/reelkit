import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { animate } from './animate';

describe('animate', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  describe('zero/negative duration', () => {
    it('calls onUpdate with target value immediately', () => {
      const onUpdate = vi.fn();
      animate({ from: 0, to: 100, duration: 0, onUpdate });
      expect(onUpdate).toHaveBeenCalledWith(100);
    });

    it('calls onComplete immediately', () => {
      const onComplete = vi.fn();
      animate({ from: 0, to: 100, duration: 0, onUpdate: vi.fn(), onComplete });
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('handles negative duration same as zero', () => {
      const onUpdate = vi.fn();
      const onComplete = vi.fn();
      animate({ from: 0, to: 100, duration: -10, onUpdate, onComplete });
      expect(onUpdate).toHaveBeenCalledWith(100);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('animation lifecycle', () => {
    it('starts with a value close to from on first frame', () => {
      const onUpdate = vi.fn();
      animate({ from: 0, to: 100, duration: 300, onUpdate });

      vi.advanceTimersToNextFrame();

      expect(onUpdate).toHaveBeenCalled();
      expect(onUpdate.mock.calls[0][0]).toBeCloseTo(0, 0);
    });

    it('calls onUpdate on each frame', () => {
      const onUpdate = vi.fn();
      animate({ from: 0, to: 100, duration: 300, onUpdate });

      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();
      vi.advanceTimersToNextFrame();

      expect(onUpdate.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('reaches target value and calls onComplete', () => {
      const onUpdate = vi.fn();
      const onComplete = vi.fn();
      animate({ from: 0, to: 100, duration: 300, onUpdate, onComplete });

      vi.advanceTimersByTime(350);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('interpolates between from and to', () => {
      const values: number[] = [];
      animate({
        from: 0,
        to: 200,
        duration: 300,
        onUpdate: (v) => values.push(v),
      });

      vi.advanceTimersByTime(350);

      expect(values.length).toBeGreaterThan(1);
      expect(values[values.length - 1]).toBeCloseTo(200, 0);
      for (const v of values) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(200);
      }
    });

    it('works with negative direction (from > to)', () => {
      const values: number[] = [];
      animate({
        from: 100,
        to: 0,
        duration: 300,
        onUpdate: (v) => values.push(v),
      });

      vi.advanceTimersByTime(350);

      expect(values[values.length - 1]).toBeCloseTo(0, 0);
    });
  });

  describe('cancel', () => {
    it('stops the animation', () => {
      const onUpdate = vi.fn();
      const cancel = animate({ from: 0, to: 100, duration: 300, onUpdate });

      vi.advanceTimersToNextFrame();
      const callCount = onUpdate.mock.calls.length;

      cancel();
      vi.advanceTimersByTime(300);

      expect(onUpdate.mock.calls.length).toBe(callCount);
    });

    it('does not call onComplete after cancel', () => {
      const onComplete = vi.fn();
      const cancel = animate({
        from: 0,
        to: 100,
        duration: 300,
        onUpdate: vi.fn(),
        onComplete,
      });

      vi.advanceTimersToNextFrame();
      cancel();
      vi.advanceTimersByTime(300);

      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('easing', () => {
    it('uses non-linear easing (not pure lerp)', () => {
      const values: number[] = [];
      animate({
        from: 0,
        to: 100,
        duration: 300,
        onUpdate: (v) => values.push(v),
      });

      vi.advanceTimersByTime(350);

      const midIndex = Math.floor(values.length / 2);
      if (values.length > 2 && midIndex > 0) {
        const linearMid = 50;
        expect(values[midIndex]).not.toBeCloseTo(linearMid, 0);
      }
    });

    it('exercises bezier curve across full range with long animation', () => {
      const values: number[] = [];
      animate({
        from: 0,
        to: 1000,
        duration: 2000,
        onUpdate: (v) => values.push(v),
      });

      // Advance frame by frame to exercise many sample table lookups
      for (let i = 0; i < 130; i++) {
        vi.advanceTimersToNextFrame();
      }

      expect(values.length).toBeGreaterThan(50);
      // Values should be monotonically non-decreasing (easeInOut curve)
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThanOrEqual(values[i - 1] - 0.01);
      }
    });

    it('produces smooth output with no NaN values', () => {
      const values: number[] = [];
      animate({
        from: -500,
        to: 500,
        duration: 1000,
        onUpdate: (v) => values.push(v),
      });

      vi.advanceTimersByTime(1100);

      for (const v of values) {
        expect(v).not.toBeNaN();
        expect(v).toBeGreaterThanOrEqual(-500);
        expect(v).toBeLessThanOrEqual(500);
      }
    });
  });
});
