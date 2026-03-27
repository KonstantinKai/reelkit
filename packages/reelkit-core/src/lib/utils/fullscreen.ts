import { createSignal, type Signal } from './signal';
import { createDisposableList } from './disposable';
import { observeDomEvent } from './observeDomEvent';
import type { Disposer } from './disposable';

type FullscreenDocument = Document & {
  readonly webkitFullscreenElement?: Element | null;
  readonly mozFullScreenElement?: Element | null;
  readonly msFullscreenElement?: Element | null;
  mozCancelFullScreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
  webkitRequestFullScreen?: () => Promise<void>;
  webkitEnterFullscreen?: () => Promise<void>;
  webkitEnterFullScreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
};

const _kIsSafari =
  typeof navigator !== 'undefined' &&
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const checkFullscreen = (): boolean => {
  if (typeof document === 'undefined') return false;
  const doc = document as FullscreenDocument;
  return (
    (doc.fullscreenElement ??
      doc.webkitFullscreenElement ??
      doc.mozFullScreenElement ??
      doc.msFullscreenElement) != null
  );
};

const subscribeToFullscreenChange = (callback: () => void): Disposer => {
  const disposables = createDisposableList();
  disposables.push(
    observeDomEvent(document, 'fullscreenchange', callback),
    observeDomEvent(document, 'webkitfullscreenchange' as 'fullscreenchange', callback),
    observeDomEvent(document, 'mozfullscreenchange' as 'fullscreenchange', callback),
    observeDomEvent(document, 'MSFullscreenChange' as 'fullscreenchange', callback),
  );
  return disposables.dispose;
};

/**
 * Lazy singleton fullscreen signal. Subscribes to `fullscreenchange`
 * events when the first observer is added and unsubscribes when the
 * last observer is removed. No framework state management needed —
 * just read `fullscreenSignal.value` inside a reactive context.
 */
export const fullscreenSignal: Signal<boolean> = (() => {
  const signal = createSignal(checkFullscreen());
  let observerCount = 0;
  let domDispose: Disposer | null = null;

  const startListening = () => {
    if (domDispose) return;
    domDispose = subscribeToFullscreenChange(() => {
      signal.value = checkFullscreen();
    });
  };

  const stopListening = () => {
    if (domDispose) {
      domDispose();
      domDispose = null;
    }
  };

  return {
    get value() {
      return signal.value;
    },
    set value(v: boolean) {
      signal.value = v;
    },
    observe(listener) {
      observerCount++;
      if (observerCount === 1) startListening();

      const dispose = signal.observe(listener);
      return () => {
        dispose();
        observerCount--;
        if (observerCount === 0) stopListening();
      };
    },
  };
})();

/** Requests fullscreen on the given element via the standard or vendor-prefixed API. */
export const requestFullscreen = (element: HTMLElement): Promise<void> => {
  if (_kIsSafari) return Promise.resolve();

  const el = element as FullscreenElement;
  const fn =
    el.requestFullscreen ??
    el.webkitRequestFullscreen ??
    el.webkitRequestFullScreen ??
    el.webkitEnterFullscreen ??
    el.webkitEnterFullScreen ??
    el.mozRequestFullScreen ??
    el.msRequestFullscreen;

  return fn ? fn.call(el) : Promise.resolve();
};

/** Exits fullscreen via the standard or vendor-prefixed API. */
export const exitFullscreen = (): Promise<void> => {
  if (_kIsSafari || !checkFullscreen()) return Promise.resolve();

  const doc = document as FullscreenDocument;
  const fn =
    doc.exitFullscreen ??
    doc.webkitExitFullscreen ??
    doc.mozCancelFullScreen ??
    doc.msExitFullscreen;

  return fn ? fn.call(doc) : Promise.resolve();
};
