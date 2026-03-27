import { noop } from './noop';
import { createLruCache } from './lruCache';
import type { Disposer } from './disposable';

export interface ContentPreloaderConfig {
  /**
   * Maximum number of entries in the loaded cache.
   * Oldest entries are evicted when the limit is reached (LRU).
   * @default 200
   */
  maxCacheSize?: number;
}

export interface ContentPreloader {
  /** Whether the source has finished loading. */
  isLoaded: (src: string) => boolean;

  /** Whether the source is currently being loaded. */
  isPending: (src: string) => boolean;

  /**
   * Preload a single source. Images use `new Image()`,
   * videos create a `<video>` with `preload="auto"`.
   * No-op if the source is already pending or loaded.
   */
  preload: (src: string, type?: 'image' | 'video') => void;

  /**
   * Mark a source as loaded without going through the preload pipeline.
   * Useful when content was loaded externally (e.g. by an `<img>` element).
   */
  markLoaded: (src: string) => void;

  /**
   * Preload sources around the current index within the given range.
   * Skips the current index itself. For video items, preloads the
   * poster image instead of the video source.
   */
  preloadRange: (
    items: ReadonlyArray<{ src: string; poster?: string; type?: string }>,
    currentIndex: number,
    range: number,
  ) => void;

  /**
   * Subscribe to a source's load completion.
   * Calls the callback immediately if already loaded.
   * Returns a disposer. No-op if the source is not pending.
   */
  onLoaded: (src: string, callback: () => void) => Disposer;
}

/**
 * Creates a content preloader with LRU cache, pending/loaded tracking,
 * and observable completion.
 */
export const createContentPreloader = (
  config: ContentPreloaderConfig = {},
): ContentPreloader => {
  const { maxCacheSize = 200 } = config;

  const pending = new Set<string>();
  const loaded = createLruCache<true>(maxCacheSize);
  const listeners = new Map<string, Set<() => void>>();

  const markLoaded = (src: string) => {
    pending.delete(src);
    loaded.set(src, true);

    const subs = listeners.get(src);
    if (subs) {
      subs.forEach((cb) => cb());
      listeners.delete(src);
    }
  };

  const preload = (src: string, type: 'image' | 'video' = 'image') => {
    if (pending.has(src) || loaded.has(src)) return;
    pending.add(src);

    if (type === 'video') {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.oncanplaythrough = () => markLoaded(src);
      video.onerror = () => markLoaded(src);
      video.src = src;
      video.load();
    } else {
      const img = new Image();
      img.onload = () => markLoaded(src);
      img.onerror = () => markLoaded(src);
      img.src = src;
    }
  };

  const onLoaded: ContentPreloader['onLoaded'] = (src, callback) => {
    if (loaded.has(src)) {
      callback();
      return noop;
    }

    if (!pending.has(src)) return noop;

    let subs = listeners.get(src);
    if (!subs) {
      subs = new Set();
      listeners.set(src, subs);
    }
    subs.add(callback);

    return () => {
      subs!.delete(callback);
      if (subs!.size === 0) listeners.delete(src);
    };
  };

  const preloadRange: ContentPreloader['preloadRange'] = (
    items,
    currentIndex,
    range,
  ) => {
    const start = currentIndex - range < 0 ? 0 : currentIndex - range;
    const end =
      currentIndex + range > items.length - 1
        ? items.length - 1
        : currentIndex + range;

    for (let i = start; i <= end; i++) {
      if (i === currentIndex) continue;
      const item = items[i];
      const itemType = (item.type ?? 'image') as 'image' | 'video';
      if (itemType === 'video') {
        if (item.poster) preload(item.poster, 'image');
      } else {
        preload(item.src, 'image');
      }
    }
  };

  return {
    preload,
    markLoaded: (src: string) => {
      if (!loaded.has(src)) markLoaded(src);
    },
    isLoaded: (src) => loaded.has(src),
    isPending: (src) => pending.has(src),
    onLoaded,
    preloadRange,
  };
};
