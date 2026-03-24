import { Injectable, OnDestroy, signal } from '@angular/core';
import type { Signal } from '@angular/core';

const FULLSCREEN_EVENTS = [
  'fullscreenchange',
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'MSFullscreenChange',
] as const;

type FullscreenEventName = (typeof FULLSCREEN_EVENTS)[number];

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
  webkitEnterFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
};

const getFullscreenElement = (): Element | null => {
  const doc = document as FullscreenDocument;
  return (
    doc.fullscreenElement ??
    doc.webkitFullscreenElement ??
    doc.mozFullScreenElement ??
    doc.msFullscreenElement ??
    null
  );
};

const exitFullscreen = (): Promise<void> => {
  const doc = document as FullscreenDocument;
  if (doc.exitFullscreen) return doc.exitFullscreen();
  if (doc.webkitExitFullscreen) return doc.webkitExitFullscreen();
  if (doc.mozCancelFullScreen) return doc.mozCancelFullScreen();
  if (doc.msExitFullscreen) return doc.msExitFullscreen();
  return Promise.resolve();
};

const requestFullscreen = (element: HTMLElement): Promise<void> => {
  const el = element as FullscreenElement;
  if (el.requestFullscreen) return el.requestFullscreen();
  if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
  if (el.webkitEnterFullscreen) return el.webkitEnterFullscreen();
  if (el.mozRequestFullScreen) return el.mozRequestFullScreen();
  if (el.msRequestFullscreen) return el.msRequestFullscreen();
  return Promise.resolve();
};

const buildFullscreenErrorMessage = (action: string, err: Error): string =>
  `Error attempting to ${action} full-screen mode: ${err.message} (${err.name})`;

/**
 * Service for managing the Fullscreen API with cross-browser support.
 *
 * Wraps the standard `requestFullscreen` / `exitFullscreen` methods
 * together with their WebKit, Mozilla, and MS vendor-prefixed variants.
 * Automatically listens for `fullscreenchange` events and keeps the
 * `isFullscreen` signal in sync.
 *
 * Provide at component level (not root) so each overlay instance gets
 * its own fullscreen state:
 * ```ts
 * providers: [FullscreenService]
 * ```
 */
@Injectable()
export class FullscreenService implements OnDestroy {
  private readonly _isFullscreen = signal(false);

  /** Reactive signal indicating whether the browser is currently in fullscreen mode. */
  readonly isFullscreen: Signal<boolean> = this._isFullscreen.asReadonly();

  private readonly handleFullscreenChange = (): void => {
    this._isFullscreen.set(getFullscreenElement() != null);
  };

  constructor() {
    if (typeof document !== 'undefined') {
      this.registerFullscreenListeners('addEventListener');
    }
  }

  request(element: HTMLElement): void {
    const activate = (): void => {
      // State is updated via the `fullscreenchange` event listener, not here,
      // to avoid a double-update and to correctly handle browser-initiated exits
      // (e.g. pressing F11 or Escape in fullscreen mode).
      requestFullscreen(element).catch((err: Error) => {
        throw new Error(buildFullscreenErrorMessage('enable', err));
      });
    };

    if (getFullscreenElement() != null) {
      // Only request fullscreen on the new element after a successful exit.
      // If exit is rejected (e.g. permission denied) do not proceed — calling
      // activate() in the catch handler would attempt requestFullscreen while
      // another element already owns fullscreen, which always fails.
      exitFullscreen()
        .then(activate)
        .catch((err: Error) => {
          throw new Error(buildFullscreenErrorMessage('exit', err));
        });
    } else {
      activate();
    }
  }

  exit(): void {
    exitFullscreen().catch((err: Error) => {
      throw new Error(buildFullscreenErrorMessage('exit', err));
    });
  }

  toggle(element: HTMLElement): void {
    if (getFullscreenElement() != null) {
      this.exit();
    } else {
      this.request(element);
    }
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      this.registerFullscreenListeners('removeEventListener');
      if (getFullscreenElement() != null) {
        exitFullscreen();
      }
    }
  }

  private registerFullscreenListeners(
    method: 'addEventListener' | 'removeEventListener',
  ): void {
    for (const event of FULLSCREEN_EVENTS as readonly FullscreenEventName[]) {
      document[method](event, this.handleFullscreenChange);
    }
  }
}
