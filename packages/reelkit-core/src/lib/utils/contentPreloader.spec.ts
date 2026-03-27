import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createContentPreloader } from './contentPreloader';

let imageInstances: HTMLImageElement[];
let origImage: typeof Image;

beforeEach(() => {
  imageInstances = [];
  origImage = globalThis.Image;
  globalThis.Image = class extends origImage {
    constructor() {
      super();
      imageInstances.push(this);
    }
  } as typeof Image;
});

afterEach(() => {
  globalThis.Image = origImage;
});

const completeAll = () =>
  imageInstances.forEach((img) => img.onload!(new Event('load')));

describe('createContentPreloader', () => {
  describe('preload', () => {
    it('creates Image for image preload', () => {
      const preloader = createContentPreloader();
      preloader.preload('img.jpg');

      expect(imageInstances).toHaveLength(1);
    });

    it('creates video element for video preload', () => {
      const spy = vi.spyOn(document, 'createElement');
      const preloader = createContentPreloader();

      preloader.preload('video.mp4', 'video');

      expect(spy).toHaveBeenCalledWith('video');
      spy.mockRestore();
    });

    it('marks video as loaded on canplaythrough', () => {
      const videos: HTMLVideoElement[] = [];
      const origCreate = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        const el = origCreate(tag);
        if (tag === 'video') videos.push(el as HTMLVideoElement);
        return el;
      });

      const preloader = createContentPreloader();
      preloader.preload('video.mp4', 'video');

      expect(preloader.isPending('video.mp4')).toBe(true);
      videos[0].oncanplaythrough!(new Event('canplaythrough'));

      expect(preloader.isLoaded('video.mp4')).toBe(true);
      expect(preloader.isPending('video.mp4')).toBe(false);
      vi.restoreAllMocks();
    });

    it('marks video as loaded on error', () => {
      const videos: HTMLVideoElement[] = [];
      const origCreate = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        const el = origCreate(tag);
        if (tag === 'video') videos.push(el as HTMLVideoElement);
        return el;
      });

      const preloader = createContentPreloader();
      preloader.preload('bad.mp4', 'video');
      videos[0].onerror!(new Event('error'));

      expect(preloader.isLoaded('bad.mp4')).toBe(true);
      vi.restoreAllMocks();
    });

    it('deduplicates pending preloads', () => {
      const preloader = createContentPreloader();
      preloader.preload('img.jpg');
      preloader.preload('img.jpg');

      expect(imageInstances).toHaveLength(1);
    });

    it('deduplicates already loaded', () => {
      const preloader = createContentPreloader();
      preloader.preload('img.jpg');
      completeAll();

      preloader.preload('img.jpg');
      expect(imageInstances).toHaveLength(1);
    });
  });

  describe('isLoaded / isPending lifecycle', () => {
    it('returns false for unknown source', () => {
      const preloader = createContentPreloader();
      expect(preloader.isLoaded('img.jpg')).toBe(false);
      expect(preloader.isPending('img.jpg')).toBe(false);
    });

    it('isPending=true during load', () => {
      const preloader = createContentPreloader();
      preloader.preload('img.jpg');

      expect(preloader.isPending('img.jpg')).toBe(true);
      expect(preloader.isLoaded('img.jpg')).toBe(false);
    });

    it('transitions to loaded after onload', () => {
      const preloader = createContentPreloader();
      preloader.preload('img.jpg');
      completeAll();

      expect(preloader.isLoaded('img.jpg')).toBe(true);
      expect(preloader.isPending('img.jpg')).toBe(false);
    });

    it('transitions to loaded after onerror', () => {
      const preloader = createContentPreloader();
      preloader.preload('bad.jpg');
      imageInstances[0].onerror!(new Event('error'));

      expect(preloader.isLoaded('bad.jpg')).toBe(true);
    });
  });

  describe('onLoaded', () => {
    it('fires immediately for already loaded source', () => {
      const preloader = createContentPreloader();
      preloader.preload('img.jpg');
      completeAll();

      const cb = vi.fn();
      preloader.onLoaded('img.jpg', cb);

      expect(cb).toHaveBeenCalledTimes(1);
    });

    it('fires when pending source completes', () => {
      const preloader = createContentPreloader();
      preloader.preload('img.jpg');

      const cb = vi.fn();
      preloader.onLoaded('img.jpg', cb);
      expect(cb).not.toHaveBeenCalled();

      completeAll();
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it('returns noop for unknown source', () => {
      const preloader = createContentPreloader();
      const cb = vi.fn();
      const dispose = preloader.onLoaded('unknown.jpg', cb);

      expect(cb).not.toHaveBeenCalled();
      expect(dispose).toBeTypeOf('function');
    });

    it('does not fire after dispose', () => {
      const preloader = createContentPreloader();
      preloader.preload('img.jpg');

      const cb = vi.fn();
      const dispose = preloader.onLoaded('img.jpg', cb);
      dispose();

      completeAll();
      expect(cb).not.toHaveBeenCalled();
    });

    it('supports multiple subscribers for the same source', () => {
      const preloader = createContentPreloader();
      preloader.preload('img.jpg');

      const cb1 = vi.fn();
      const cb2 = vi.fn();
      preloader.onLoaded('img.jpg', cb1);
      preloader.onLoaded('img.jpg', cb2);

      completeAll();

      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(1);
    });

    it('partial dispose does not remove other subscribers', () => {
      const preloader = createContentPreloader();
      preloader.preload('img.jpg');

      const cb1 = vi.fn();
      const cb2 = vi.fn();
      const dispose1 = preloader.onLoaded('img.jpg', cb1);
      preloader.onLoaded('img.jpg', cb2);

      dispose1();
      completeAll();

      expect(cb1).not.toHaveBeenCalled();
      expect(cb2).toHaveBeenCalledTimes(1);
    });
  });

  describe('markLoaded', () => {
    it('marks an external source as loaded', () => {
      const preloader = createContentPreloader();
      preloader.markLoaded('external.jpg');

      expect(preloader.isLoaded('external.jpg')).toBe(true);
    });

    it('does not duplicate if already loaded', () => {
      const preloader = createContentPreloader();
      preloader.preload('img.jpg');
      completeAll();

      preloader.markLoaded('img.jpg');
      expect(preloader.isLoaded('img.jpg')).toBe(true);
    });

    it('skips preload after markLoaded', () => {
      const preloader = createContentPreloader();
      preloader.markLoaded('img.jpg');
      preloader.preload('img.jpg');

      expect(imageInstances).toHaveLength(0);
    });
  });

  describe('LRU eviction', () => {
    it('evicts oldest entries at maxCacheSize', () => {
      const preloader = createContentPreloader({ maxCacheSize: 3 });

      for (let i = 0; i < 4; i++) {
        preloader.preload(`img${i}.jpg`);
      }
      completeAll();

      expect(preloader.isLoaded('img0.jpg')).toBe(false);
      expect(preloader.isLoaded('img1.jpg')).toBe(true);
      expect(preloader.isLoaded('img2.jpg')).toBe(true);
      expect(preloader.isLoaded('img3.jpg')).toBe(true);
    });
  });

  describe('preloadRange', () => {
    it('skips current index', () => {
      const preloader = createContentPreloader();
      const items = [{ src: 'a.jpg' }, { src: 'b.jpg' }, { src: 'c.jpg' }];

      preloader.preloadRange(items, 1, 1);

      expect(imageInstances).toHaveLength(2);
    });

    it('clamps to bounds', () => {
      const preloader = createContentPreloader();
      const items = [{ src: 'a.jpg' }, { src: 'b.jpg' }];

      preloader.preloadRange(items, 0, 5);

      expect(imageInstances).toHaveLength(1);
    });

    it('preloads poster for video items', () => {
      const docSpy = vi.spyOn(document, 'createElement');
      const preloader = createContentPreloader();
      const items = [
        { src: 'img.jpg' },
        { src: 'video.mp4', type: 'video', poster: 'poster.jpg' },
      ];

      preloader.preloadRange(items, 0, 1);

      expect(imageInstances).toHaveLength(1);
      expect(docSpy).not.toHaveBeenCalledWith('video');
      docSpy.mockRestore();
    });

    it('skips video items without poster', () => {
      const preloader = createContentPreloader();
      const items = [{ src: 'img.jpg' }, { src: 'video.mp4', type: 'video' }];

      preloader.preloadRange(items, 0, 1);

      expect(imageInstances).toHaveLength(0);
    });
  });
});
