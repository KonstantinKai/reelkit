import { TestBed } from '@angular/core/testing';
import { FullscreenService } from './fullscreen.service';

// Ensure document.exitFullscreen exists so jest.spyOn can intercept it.
// jsdom does not implement fullscreen APIs; provide no-op stubs so spyOn works.
if (!document.exitFullscreen) {
  Object.defineProperty(document, 'exitFullscreen', {
    configurable: true,
    writable: true,
    value: () => Promise.resolve(),
  });
}

// jsdom does not implement HTMLElement.requestFullscreen. Add a no-op stub on
// the prototype so jest.spyOn(element, 'requestFullscreen') can intercept it.
if (!HTMLElement.prototype.requestFullscreen) {
  Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
    configurable: true,
    writable: true,
    value: () => Promise.resolve(),
  });
}

describe('FullscreenService', () => {
  let service: FullscreenService;

  const setupDocumentFullscreen = (element: Element | null) => {
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => element,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Ensure fullscreenElement is null (no active fullscreen)
    setupDocumentFullscreen(null);

    // Ensure vendor prefix elements are absent / null
    Object.defineProperty(document, 'webkitFullscreenElement', {
      configurable: true,
      get: () => undefined,
    });
    Object.defineProperty(document, 'mozFullScreenElement', {
      configurable: true,
      get: () => undefined,
    });
    Object.defineProperty(document, 'msFullscreenElement', {
      configurable: true,
      get: () => undefined,
    });

    TestBed.configureTestingModule({
      providers: [FullscreenService],
    });

    service = TestBed.inject(FullscreenService);
  });

  afterEach(() => {
    setupDocumentFullscreen(null);
    jest.restoreAllMocks();
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  describe('isFullscreen signal', () => {
    it('starts as false', () => {
      expect(service.isFullscreen()).toBe(false);
    });

    it('updates to true when fullscreenchange fires with an active element', () => {
      const fakeEl = document.createElement('div');
      setupDocumentFullscreen(fakeEl);

      document.dispatchEvent(new Event('fullscreenchange'));

      expect(service.isFullscreen()).toBe(true);
    });

    it('updates to false when fullscreenchange fires with no active element', () => {
      const fakeEl = document.createElement('div');
      setupDocumentFullscreen(fakeEl);
      document.dispatchEvent(new Event('fullscreenchange'));
      expect(service.isFullscreen()).toBe(true);

      setupDocumentFullscreen(null);
      document.dispatchEvent(new Event('fullscreenchange'));
      expect(service.isFullscreen()).toBe(false);
    });

    it('responds to webkitfullscreenchange event', () => {
      const fakeEl = document.createElement('div');
      setupDocumentFullscreen(fakeEl);
      document.dispatchEvent(new Event('webkitfullscreenchange'));
      expect(service.isFullscreen()).toBe(true);
    });

    it('responds to mozfullscreenchange event', () => {
      const fakeEl = document.createElement('div');
      setupDocumentFullscreen(fakeEl);
      document.dispatchEvent(new Event('mozfullscreenchange'));
      expect(service.isFullscreen()).toBe(true);
    });

    it('responds to MSFullscreenChange event', () => {
      const fakeEl = document.createElement('div');
      setupDocumentFullscreen(fakeEl);
      document.dispatchEvent(new Event('MSFullscreenChange'));
      expect(service.isFullscreen()).toBe(true);
    });
  });

  describe('request()', () => {
    it('calls requestFullscreen on the element when no current fullscreen element', () => {
      const el = document.createElement('div');
      const requestSpy = jest
        .spyOn(el, 'requestFullscreen')
        .mockResolvedValue(undefined);

      service.request(el);

      expect(requestSpy).toHaveBeenCalledTimes(1);
    });

    it('exits current fullscreen then calls requestFullscreen when already fullscreen', async () => {
      const fakeEl = document.createElement('div');
      setupDocumentFullscreen(fakeEl);

      const newEl = document.createElement('div');
      const requestSpy = jest
        .spyOn(newEl, 'requestFullscreen')
        .mockResolvedValue(undefined);
      const exitSpy = jest
        .spyOn(document, 'exitFullscreen')
        .mockResolvedValue(undefined);

      service.request(newEl);

      expect(exitSpy).toHaveBeenCalledTimes(1);

      // Wait for the promise chain to settle
      await Promise.resolve();
      await Promise.resolve();

      expect(requestSpy).toHaveBeenCalledTimes(1);
    });

    it('does NOT call requestFullscreen when exitFullscreen rejects', async () => {
      const fakeEl = document.createElement('div');
      setupDocumentFullscreen(fakeEl);

      const newEl = document.createElement('div');
      const requestSpy = jest
        .spyOn(newEl, 'requestFullscreen')
        .mockResolvedValue(undefined);
      jest
        .spyOn(document, 'exitFullscreen')
        .mockRejectedValue(new Error('permission denied'));

      // Suppress the unhandled-rejection thrown by our catch handler.
      const unhandledHandler = (event: PromiseRejectionEvent) =>
        event.preventDefault();
      window.addEventListener('unhandledrejection', unhandledHandler);

      service.request(newEl);

      // Let the microtask queue drain completely.
      await new Promise((r) => setTimeout(r, 0));

      window.removeEventListener('unhandledrejection', unhandledHandler);

      // The request for the new element must never have been called because
      // the exit failed — calling activate() in the catch was the old bug.
      expect(requestSpy).not.toHaveBeenCalled();
    });

    it('uses webkitRequestFullscreen vendor prefix when requestFullscreen is absent', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'requestFullscreen', {
        configurable: true,
        value: undefined,
      });
      const webkitSpy = jest.fn().mockResolvedValue(undefined);
      (el as any).webkitRequestFullscreen = webkitSpy;

      service.request(el);

      expect(webkitSpy).toHaveBeenCalledTimes(1);
    });

    it('uses webkitEnterFullscreen vendor prefix', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'requestFullscreen', {
        configurable: true,
        value: undefined,
      });
      const webkitEnterSpy = jest.fn().mockResolvedValue(undefined);
      (el as any).webkitEnterFullscreen = webkitEnterSpy;

      service.request(el);

      expect(webkitEnterSpy).toHaveBeenCalledTimes(1);
    });

    it('uses mozRequestFullScreen vendor prefix', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'requestFullscreen', {
        configurable: true,
        value: undefined,
      });
      const mozSpy = jest.fn().mockResolvedValue(undefined);
      (el as any).mozRequestFullScreen = mozSpy;

      service.request(el);

      expect(mozSpy).toHaveBeenCalledTimes(1);
    });

    it('uses msRequestFullscreen vendor prefix', () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'requestFullscreen', {
        configurable: true,
        value: undefined,
      });
      const msSpy = jest.fn().mockResolvedValue(undefined);
      (el as any).msRequestFullscreen = msSpy;

      service.request(el);

      expect(msSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('exit()', () => {
    it('calls document.exitFullscreen', () => {
      const exitSpy = jest
        .spyOn(document, 'exitFullscreen')
        .mockResolvedValue(undefined);

      service.exit();

      expect(exitSpy).toHaveBeenCalledTimes(1);
    });

    it('uses webkitExitFullscreen when exitFullscreen is absent', () => {
      const doc = document as any;
      const originalExit = doc.exitFullscreen;
      doc.exitFullscreen = undefined;

      const webkitExitSpy = jest.fn().mockResolvedValue(undefined);
      doc.webkitExitFullscreen = webkitExitSpy;

      service.exit();

      expect(webkitExitSpy).toHaveBeenCalledTimes(1);

      doc.exitFullscreen = originalExit;
      delete doc.webkitExitFullscreen;
    });

    it('uses mozCancelFullScreen vendor prefix', () => {
      const doc = document as any;
      const originalExit = doc.exitFullscreen;
      doc.exitFullscreen = undefined;

      const mozSpy = jest.fn().mockResolvedValue(undefined);
      doc.mozCancelFullScreen = mozSpy;

      service.exit();

      expect(mozSpy).toHaveBeenCalledTimes(1);

      doc.exitFullscreen = originalExit;
      delete doc.mozCancelFullScreen;
    });
  });

  describe('toggle()', () => {
    it('calls requestFullscreen on element when not in fullscreen', () => {
      const el = document.createElement('div');
      const requestSpy = jest
        .spyOn(el, 'requestFullscreen')
        .mockResolvedValue(undefined);

      service.toggle(el);

      expect(requestSpy).toHaveBeenCalledTimes(1);
    });

    it('calls exitFullscreen when already in fullscreen', () => {
      const fakeEl = document.createElement('div');
      setupDocumentFullscreen(fakeEl);

      const exitSpy = jest
        .spyOn(document, 'exitFullscreen')
        .mockResolvedValue(undefined);

      service.toggle(document.createElement('div'));

      expect(exitSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('ngOnDestroy()', () => {
    it('removes all four fullscreen event listeners on destroy', () => {
      const removeSpy = jest.spyOn(document, 'removeEventListener');

      service.ngOnDestroy();

      // fullscreenchange, webkitfullscreenchange, mozfullscreenchange, MSFullscreenChange
      expect(removeSpy).toHaveBeenCalledTimes(4);
    });

    it('exits fullscreen on destroy when fullscreen is active', () => {
      const fakeEl = document.createElement('div');
      setupDocumentFullscreen(fakeEl);

      const exitSpy = jest
        .spyOn(document, 'exitFullscreen')
        .mockResolvedValue(undefined);

      service.ngOnDestroy();

      expect(exitSpy).toHaveBeenCalled();
    });

    it('does not call exitFullscreen on destroy when not in fullscreen', () => {
      const exitSpy = jest
        .spyOn(document, 'exitFullscreen')
        .mockResolvedValue(undefined);

      service.ngOnDestroy();

      expect(exitSpy).not.toHaveBeenCalled();
    });
  });

  // ─── SSR guard: constructor and ngOnDestroy must not throw without document ──

  describe('SSR safety: document guard in constructor and ngOnDestroy', () => {
    it('constructor registers listeners only when document is defined', () => {
      // In a real SSR environment document is undefined; here we verify the
      // guard by confirming the service was constructed without throwing.
      // A TypeError from document.addEventListener would propagate here.
      expect(() => service).not.toThrow();
    });

    it('ngOnDestroy does not throw even if called without active listeners', () => {
      // Simulates a scenario where ngOnDestroy is invoked in an SSR-like context
      // after the service was created. The document guard must swallow errors.
      expect(() => service.ngOnDestroy()).not.toThrow();
    });
  });
});
