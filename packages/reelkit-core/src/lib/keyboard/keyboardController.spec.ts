import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createKeyboardController } from './keyboardController';
import type { NavKey } from './types';

const dispatch = (key: string) =>
  window.dispatchEvent(new KeyboardEvent('keydown', { key }));

describe('createKeyboardController', () => {
  let onKeyPress: ReturnType<
    typeof vi.fn<(key: NavKey, event: KeyboardEvent) => void>
  >;

  beforeEach(() => {
    onKeyPress = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('key mapping', () => {
    it('maps ArrowUp to up', () => {
      const ctrl = createKeyboardController({}, { onKeyPress });
      ctrl.attach();
      dispatch('ArrowUp');
      expect(onKeyPress).toHaveBeenCalledWith('up', expect.any(KeyboardEvent));
      ctrl.detach();
    });

    it('maps ArrowRight to right', () => {
      const ctrl = createKeyboardController({}, { onKeyPress });
      ctrl.attach();
      dispatch('ArrowRight');
      expect(onKeyPress).toHaveBeenCalledWith(
        'right',
        expect.any(KeyboardEvent),
      );
      ctrl.detach();
    });

    it('maps ArrowDown to down', () => {
      const ctrl = createKeyboardController({}, { onKeyPress });
      ctrl.attach();
      dispatch('ArrowDown');
      expect(onKeyPress).toHaveBeenCalledWith(
        'down',
        expect.any(KeyboardEvent),
      );
      ctrl.detach();
    });

    it('maps ArrowLeft to left', () => {
      const ctrl = createKeyboardController({}, { onKeyPress });
      ctrl.attach();
      dispatch('ArrowLeft');
      expect(onKeyPress).toHaveBeenCalledWith(
        'left',
        expect.any(KeyboardEvent),
      );
      ctrl.detach();
    });

    it('maps Escape to escape', () => {
      const ctrl = createKeyboardController({}, { onKeyPress });
      ctrl.attach();
      dispatch('Escape');
      expect(onKeyPress).toHaveBeenCalledWith(
        'escape',
        expect.any(KeyboardEvent),
      );
      ctrl.detach();
    });

    it('ignores unmapped keys', () => {
      const ctrl = createKeyboardController({}, { onKeyPress });
      ctrl.attach();
      dispatch('Enter');
      dispatch('Space');
      dispatch('a');
      expect(onKeyPress).not.toHaveBeenCalled();
      ctrl.detach();
    });
  });

  describe('filter', () => {
    it('restricts to filtered keys only', () => {
      const ctrl = createKeyboardController(
        { filter: ['up', 'down'] },
        { onKeyPress },
      );
      ctrl.attach();

      dispatch('ArrowUp');
      dispatch('ArrowLeft');
      dispatch('ArrowDown');

      expect(onKeyPress).toHaveBeenCalledTimes(2);
      expect(onKeyPress).toHaveBeenNthCalledWith(
        1,
        'up',
        expect.any(KeyboardEvent),
      );
      expect(onKeyPress).toHaveBeenNthCalledWith(
        2,
        'down',
        expect.any(KeyboardEvent),
      );
      ctrl.detach();
    });

    it('always allows escape regardless of filter', () => {
      const ctrl = createKeyboardController({ filter: ['up'] }, { onKeyPress });
      ctrl.attach();

      dispatch('Escape');
      dispatch('ArrowLeft');

      expect(onKeyPress).toHaveBeenCalledTimes(1);
      expect(onKeyPress).toHaveBeenCalledWith(
        'escape',
        expect.any(KeyboardEvent),
      );
      ctrl.detach();
    });

    it('allows all keys when filter is empty', () => {
      const ctrl = createKeyboardController({ filter: [] }, { onKeyPress });
      ctrl.attach();

      dispatch('ArrowUp');
      dispatch('ArrowRight');
      dispatch('ArrowDown');
      dispatch('ArrowLeft');
      dispatch('Escape');

      expect(onKeyPress).toHaveBeenCalledTimes(5);
      ctrl.detach();
    });
  });

  describe('throttle', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('throttles rapid key presses', () => {
      const ctrl = createKeyboardController(
        { throttleMs: 100 },
        { onKeyPress },
      );
      ctrl.attach();

      dispatch('ArrowUp'); // t=0, fires
      vi.advanceTimersByTime(50);
      dispatch('ArrowUp'); // t=50, throttled
      vi.advanceTimersByTime(150);
      dispatch('ArrowUp'); // t=200, fires

      expect(onKeyPress).toHaveBeenCalledTimes(2);
      ctrl.detach();
    });

    it('escape is subject to throttle like other keys', () => {
      const ctrl = createKeyboardController(
        { throttleMs: 100 },
        { onKeyPress },
      );
      ctrl.attach();

      dispatch('ArrowUp'); // t=0, fires
      vi.advanceTimersByTime(10);
      dispatch('Escape'); // t=10, throttled

      expect(onKeyPress).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      dispatch('Escape'); // t=110, fires

      expect(onKeyPress).toHaveBeenCalledTimes(2);
      ctrl.detach();
    });

    it('does not throttle when throttleMs is 0', () => {
      const ctrl = createKeyboardController({ throttleMs: 0 }, { onKeyPress });
      ctrl.attach();

      dispatch('ArrowUp');
      dispatch('ArrowUp');
      dispatch('ArrowUp');

      expect(onKeyPress).toHaveBeenCalledTimes(3);
      ctrl.detach();
    });
  });

  describe('attach / detach', () => {
    it('does not fire before attach', () => {
      createKeyboardController({}, { onKeyPress });
      dispatch('ArrowUp');
      expect(onKeyPress).not.toHaveBeenCalled();
    });

    it('does not fire after detach', () => {
      const ctrl = createKeyboardController({}, { onKeyPress });
      ctrl.attach();
      ctrl.detach();
      dispatch('ArrowUp');
      expect(onKeyPress).not.toHaveBeenCalled();
    });

    it('re-attaches after detach', () => {
      const ctrl = createKeyboardController({}, { onKeyPress });
      ctrl.attach();
      ctrl.detach();
      ctrl.attach();
      dispatch('ArrowUp');
      expect(onKeyPress).toHaveBeenCalledTimes(1);
      ctrl.detach();
    });

    it('replaces listener on double attach', () => {
      const ctrl = createKeyboardController({}, { onKeyPress });
      ctrl.attach();
      ctrl.attach();
      dispatch('ArrowUp');
      expect(onKeyPress).toHaveBeenCalledTimes(1);
      ctrl.detach();
    });
  });
});
