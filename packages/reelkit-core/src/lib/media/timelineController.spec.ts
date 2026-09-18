import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTimelineController,
  type BufferedRange,
} from './timelineController';

type MockVideo = HTMLVideoElement & {
  fireEvent: (type: string) => void;
  setBuffered: (ranges: Array<[number, number]>) => void;
};

const createMockVideo = (): MockVideo => {
  const listeners = new Map<string, Set<(e: Event) => void>>();
  let rawBuffered: Array<[number, number]> = [];

  const video = {
    currentTime: 0,
    duration: 0,
    paused: true,
    muted: true,
    buffered: {
      get length() {
        return rawBuffered.length;
      },
      start(i: number) {
        return rawBuffered[i][0];
      },
      end(i: number) {
        return rawBuffered[i][1];
      },
    } as TimeRanges,
    addEventListener(type: string, handler: (e: Event) => void) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(handler);
    },
    removeEventListener(type: string, handler: (e: Event) => void) {
      listeners.get(type)?.delete(handler);
    },
    fireEvent(type: string) {
      listeners.get(type)?.forEach((fn) => fn(new Event(type)));
    },
    setBuffered(ranges: Array<[number, number]>) {
      rawBuffered = ranges;
    },
  };
  return video as unknown as MockVideo;
};

const firePointer = (
  target: HTMLElement,
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  init: { clientX?: number; pointerId?: number } = {},
): void => {
  const ev = new Event(type, { bubbles: true, cancelable: true }) as Event & {
    clientX: number;
    pointerId: number;
  };
  Object.assign(ev, {
    clientX: init.clientX ?? 0,
    pointerId: init.pointerId ?? 0,
  });
  target.dispatchEvent(ev);
};

const _kRafCallbacks: Array<FrameRequestCallback> = [];
beforeEach(() => {
  _kRafCallbacks.length = 0;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    _kRafCallbacks.push(cb);
    return _kRafCallbacks.length;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    delete _kRafCallbacks[id - 1];
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
});
const flushRaf = () => {
  const pending = _kRafCallbacks.splice(0);
  pending.forEach((cb) => cb?.(performance.now()));
};

describe('createTimelineController', () => {
  describe('signal defaults', () => {
    it('starts at duration=0, currentTime=0, no buffered, not scrubbing', () => {
      const tl = createTimelineController();
      expect(tl.duration.value).toBe(0);
      expect(tl.currentTime.value).toBe(0);
      expect(tl.bufferedRanges.value).toEqual([]);
      expect(tl.isScrubbing.value).toBe(false);
      expect(tl.progress.value).toBe(0);
    });

    it('progress returns 0 when duration is 0 or non-finite', () => {
      const tl = createTimelineController();
      const video = createMockVideo();
      video.duration = NaN;
      tl.attach(video);
      expect(tl.progress.value).toBe(0);
    });
  });

  describe('attach / detach lifecycle', () => {
    it('populates signals from initial metadata', () => {
      const tl = createTimelineController();
      const video = createMockVideo();
      video.duration = 120;
      video.currentTime = 30;
      video.setBuffered([[0, 60]]);
      tl.attach(video);
      expect(tl.duration.value).toBe(120);
      expect(tl.currentTime.value).toBe(30);
      expect(tl.bufferedRanges.value).toEqual([{ start: 0, end: 0.5 }]);
    });

    it('updates currentTime on timeupdate', () => {
      const tl = createTimelineController();
      const video = createMockVideo();
      video.duration = 100;
      tl.attach(video);
      video.currentTime = 42;
      video.fireEvent('timeupdate');
      expect(tl.currentTime.value).toBe(42);
    });

    it('updates duration on durationchange', () => {
      const tl = createTimelineController();
      const video = createMockVideo();
      tl.attach(video);
      video.duration = 300;
      video.fireEvent('durationchange');
      expect(tl.duration.value).toBe(300);
    });

    it('detach is idempotent and resets all signals', () => {
      const tl = createTimelineController();
      const video = createMockVideo();
      video.duration = 100;
      video.currentTime = 50;
      tl.attach(video);
      tl.detach();
      expect(tl.duration.value).toBe(0);
      expect(tl.currentTime.value).toBe(0);
      expect(tl.bufferedRanges.value).toEqual([]);
      expect(() => tl.detach()).not.toThrow();
    });

    it('re-attach swaps video cleanly', () => {
      const tl = createTimelineController();
      const a = createMockVideo();
      a.duration = 100;
      const b = createMockVideo();
      b.duration = 200;
      tl.attach(a);
      tl.attach(b);
      expect(tl.duration.value).toBe(200);
    });
  });

  describe('buffered normalisation', () => {
    it('normalises to 0–1 fractions sorted by start', () => {
      const tl = createTimelineController();
      const video = createMockVideo();
      video.duration = 100;
      video.setBuffered([
        [50, 80],
        [0, 20],
      ]);
      tl.attach(video);
      expect(tl.bufferedRanges.value).toEqual<BufferedRange[]>([
        { start: 0, end: 0.2 },
        { start: 0.5, end: 0.8 },
      ]);
    });

    it('merges overlapping ranges', () => {
      const tl = createTimelineController();
      const video = createMockVideo();
      video.duration = 100;
      video.setBuffered([
        [0, 40],
        [30, 60],
      ]);
      tl.attach(video);
      expect(tl.bufferedRanges.value).toEqual<BufferedRange[]>([
        { start: 0, end: 0.6 },
      ]);
    });

    it('returns empty array when duration is not finite', () => {
      const tl = createTimelineController();
      const video = createMockVideo();
      video.duration = Infinity;
      video.setBuffered([[0, 10]]);
      tl.attach(video);
      expect(tl.bufferedRanges.value).toEqual([]);
    });
  });

  describe('seek()', () => {
    it('clamps negatives to 0 and overshoots to duration', () => {
      const tl = createTimelineController();
      const video = createMockVideo();
      video.duration = 100;
      tl.attach(video);
      tl.seek(-50);
      expect(video.currentTime).toBe(0);
      tl.seek(999);
      expect(video.currentTime).toBe(100);
    });

    it('fires onSeek with the clamped value', () => {
      const onSeek = vi.fn();
      const tl = createTimelineController({ onSeek });
      const video = createMockVideo();
      video.duration = 100;
      tl.attach(video);
      tl.seek(40);
      expect(onSeek).toHaveBeenCalledWith(40);
    });

    it('no-ops when duration is 0 or Infinity', () => {
      const onSeek = vi.fn();
      const tl = createTimelineController({ onSeek });
      const video = createMockVideo();
      video.duration = 0;
      tl.attach(video);
      tl.seek(10);
      expect(video.currentTime).toBe(0);
      expect(onSeek).not.toHaveBeenCalled();

      video.duration = Infinity;
      video.fireEvent('durationchange');
      tl.seek(10);
      expect(onSeek).not.toHaveBeenCalled();
    });

    it('no-ops before attach', () => {
      const onSeek = vi.fn();
      const tl = createTimelineController({ onSeek });
      expect(() => tl.seek(10)).not.toThrow();
      expect(onSeek).not.toHaveBeenCalled();
    });
  });

  describe('bindInteractions — pointer', () => {
    const makeTarget = () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'getBoundingClientRect', {
        value: () =>
          ({
            left: 0,
            top: 0,
            width: 100,
            height: 10,
            right: 100,
            bottom: 10,
            x: 0,
            y: 0,
          }) as DOMRect,
      });
      el.setPointerCapture = vi.fn();
      el.releasePointerCapture = vi.fn();
      return el;
    };

    it('pointerdown sets isScrubbing, fires onScrubStart, previews seek', () => {
      const onScrubStart = vi.fn();
      const onSeek = vi.fn();
      const tl = createTimelineController({ onScrubStart, onSeek });
      const video = createMockVideo();
      video.duration = 100;
      tl.attach(video);

      const target = makeTarget();
      tl.bindInteractions(target);
      firePointer(target, 'pointerdown', { clientX: 50, pointerId: 1 });

      expect(tl.isScrubbing.value).toBe(true);
      expect(onScrubStart).toHaveBeenCalled();
      expect(video.currentTime).toBe(50);
      expect(onSeek).not.toHaveBeenCalled();
      expect(target.setPointerCapture).toHaveBeenCalledWith(1);
    });

    it('pointerup fires onScrubEnd and final onSeek, clears isScrubbing', () => {
      const onScrubEnd = vi.fn();
      const onSeek = vi.fn();
      const tl = createTimelineController({ onScrubEnd, onSeek });
      const video = createMockVideo();
      video.duration = 100;
      tl.attach(video);

      const target = makeTarget();
      tl.bindInteractions(target);
      firePointer(target, 'pointerdown', { clientX: 25, pointerId: 1 });
      firePointer(target, 'pointermove', { clientX: 75, pointerId: 1 });
      firePointer(target, 'pointerup', { clientX: 75, pointerId: 1 });

      expect(tl.isScrubbing.value).toBe(false);
      expect(onScrubEnd).toHaveBeenCalled();
      expect(onSeek).toHaveBeenCalledWith(75);
      expect(target.releasePointerCapture).toHaveBeenCalledWith(1);
    });

    it('pointermove is ignored when not scrubbing', () => {
      const tl = createTimelineController();
      const video = createMockVideo();
      video.duration = 100;
      tl.attach(video);

      const target = makeTarget();
      tl.bindInteractions(target);
      firePointer(target, 'pointermove', { clientX: 50, pointerId: 1 });
      expect(video.currentTime).toBe(0);
    });

    it('disposer releases capture and resets scrubbing', () => {
      const tl = createTimelineController();
      const video = createMockVideo();
      video.duration = 100;
      tl.attach(video);

      const target = makeTarget();
      const dispose = tl.bindInteractions(target);
      firePointer(target, 'pointerdown', { clientX: 50, pointerId: 1 });
      dispose();
      expect(tl.isScrubbing.value).toBe(false);
      expect(target.releasePointerCapture).toHaveBeenCalledWith(1);
    });

    it('pointerdown no-ops for non-seekable video (Infinity duration)', () => {
      const onScrubStart = vi.fn();
      const tl = createTimelineController({ onScrubStart });
      const video = createMockVideo();
      video.duration = Infinity;
      tl.attach(video);

      const target = makeTarget();
      tl.bindInteractions(target);
      firePointer(target, 'pointerdown', { clientX: 50, pointerId: 1 });
      expect(tl.isScrubbing.value).toBe(false);
      expect(onScrubStart).not.toHaveBeenCalled();
    });
  });

  describe('bindInteractions — keyboard', () => {
    const makeTarget = () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'getBoundingClientRect', {
        value: () =>
          ({
            left: 0,
            top: 0,
            width: 100,
            height: 10,
            right: 100,
            bottom: 10,
            x: 0,
            y: 0,
          }) as DOMRect,
      });
      return el;
    };

    it.each([
      ['ArrowLeft', 30, 25],
      ['ArrowRight', 30, 35],
      ['Home', 30, 0],
      ['End', 30, 100],
      ['PageUp', 30, 40],
      ['PageDown', 30, 20],
    ])('%s seeks to expected position', (key, from, expected) => {
      const tl = createTimelineController();
      const video = createMockVideo();
      video.duration = 100;
      video.currentTime = from;
      tl.attach(video);
      video.fireEvent('timeupdate');

      const target = makeTarget();
      tl.bindInteractions(target);
      target.dispatchEvent(new KeyboardEvent('keydown', { key }));
      expect(video.currentTime).toBe(expected);
    });

    it('keydown fires onSeek', () => {
      const onSeek = vi.fn();
      const tl = createTimelineController({ onSeek });
      const video = createMockVideo();
      video.duration = 100;
      video.currentTime = 0;
      tl.attach(video);

      const target = makeTarget();
      tl.bindInteractions(target);
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(onSeek).toHaveBeenCalledWith(5);
    });

    it('keydown ignored on non-seekable video', () => {
      const onSeek = vi.fn();
      const tl = createTimelineController({ onSeek });
      const video = createMockVideo();
      video.duration = Infinity;
      tl.attach(video);

      const target = makeTarget();
      tl.bindInteractions(target);
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(onSeek).not.toHaveBeenCalled();
    });
  });

  describe('rAF loop', () => {
    it('starts on play, emits currentTime per frame', () => {
      const tl = createTimelineController();
      const video = createMockVideo();
      video.duration = 100;
      tl.attach(video);

      video.paused = false;
      video.fireEvent('play');

      video.currentTime = 1;
      flushRaf();
      expect(tl.currentTime.value).toBe(1);

      video.currentTime = 2;
      flushRaf();
      expect(tl.currentTime.value).toBe(2);
    });

    it('stops on pause', () => {
      const tl = createTimelineController();
      const video = createMockVideo();
      video.duration = 100;
      tl.attach(video);

      video.paused = false;
      video.fireEvent('play');
      flushRaf();

      video.paused = true;
      video.fireEvent('pause');
      video.currentTime = 99;
      flushRaf();
      expect(tl.currentTime.value).toBe(0); // last emitted before pause
    });

    it('stops on detach', () => {
      const tl = createTimelineController();
      const video = createMockVideo();
      video.duration = 100;
      tl.attach(video);
      video.paused = false;
      video.fireEvent('play');

      tl.detach();
      expect(_kRafCallbacks.filter(Boolean)).toHaveLength(0);
    });
  });

  describe('progress (computed)', () => {
    it('reflects currentTime / duration', () => {
      const tl = createTimelineController();
      const video = createMockVideo();
      video.duration = 100;
      tl.attach(video);

      video.currentTime = 25;
      video.fireEvent('timeupdate');
      expect(tl.progress.value).toBe(0.25);
    });
  });
});
