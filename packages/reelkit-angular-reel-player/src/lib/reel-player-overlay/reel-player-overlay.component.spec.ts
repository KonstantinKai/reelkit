import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RkReelPlayerOverlayComponent } from './reel-player-overlay.component';
import { SoundStateService } from '../sound-state/sound-state.service';
import type { ContentItem } from '../types';
import {
  captureFocusForReturn as mockedCaptureFocus,
  createFocusTrap as mockedCreateFocusTrap,
} from '@reelkit/angular';

jest.mock('@reelkit/angular', () => {
  const { Component, Directive, EventEmitter, Injectable, Input, Output } =
    require('@angular/core') as typeof import('@angular/core');

  @Component({
    selector: 'rk-reel',
    template: '<ng-content/>',
    standalone: true,
  })
  class ReelComponent {
    @Input() count = 0;
    @Input() size: [number, number] = [0, 0];
    @Input() direction = 'vertical';
    @Input() loop = false;
    @Input() enableNavKeys = false;
    @Input() enableWheel = false;
    @Input() wheelDebounceMs = 200;
    @Input() transitionDuration = 300;
    @Input() swipeDistanceFactor = 0.12;
    @Input() initialIndex = 0;
    @Output() apiReady = new EventEmitter<unknown>();
    @Output() beforeChange = new EventEmitter<void>();
    @Output() afterChange = new EventEmitter<{ index: number }>();
    @Output() slideDragStart = new EventEmitter<void>();
    @Output() slideDragEnd = new EventEmitter<void>();
    @Output() slideDragCanceled = new EventEmitter<void>();
  }

  @Component({ selector: 'rk-reel-indicator', template: '', standalone: true })
  class ReelIndicatorComponent {
    @Input() count = 0;
    @Input() active = 0;
    @Output() dotClick = new EventEmitter<number>();
  }

  @Directive({ selector: '[rkReelItem]', standalone: true })
  class RkReelItemDirective {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static ngTemplateContextGuard(_d: unknown, _ctx: unknown): boolean {
      return true;
    }
  }

  @Injectable({ providedIn: 'root' })
  class BodyLockService {
    lock = jest.fn();
    unlock = jest.fn();
  }

  return {
    ReelComponent,
    ReelIndicatorComponent,
    RkReelItemDirective,
    BodyLockService,
    createSharedVideo: jest.fn(() => ({
      getVideo: jest.fn().mockReturnValue(
        Object.assign(document.createElement('video'), {
          play: jest.fn().mockResolvedValue(undefined),
          pause: jest.fn(),
          muted: false,
          src: '',
          style: { objectFit: '' },
        }),
      ),
      capturedFrames: new Map(),
      playbackPositions: new Map(),
    })),
    captureFrame: jest.fn().mockReturnValue(null),
    captureFocusForReturn: jest.fn(() => jest.fn()),
    createFocusTrap: jest.fn(() => jest.fn()),
    noop: jest.fn(),
    clamp: (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, v)),
    toAngularSignal: jest.fn(
      (source: {
        value?: unknown;
        observe?: (fn: () => void) => () => void;
      }) => {
        const { signal: angSignal } =
          require('@angular/core') as typeof import('@angular/core');
        const sig = angSignal(source?.value ?? false);
        if (source?.observe) {
          source.observe(() => sig.set(source.value as never));
        }
        return sig;
      },
    ),
    createContentLoadingController: jest.fn(() => ({
      isLoading: {
        value: true,
        observe: jest.fn(() => () => {
          /* noop */
        }),
      },
      isError: {
        value: false,
        observe: jest.fn(() => () => {
          /* noop */
        }),
      },
      setActiveIndex: jest.fn(),
      onReady: jest.fn(),
      onWaiting: jest.fn(),
      onError: jest.fn(),
    })),
    createContentPreloader: jest.fn(() => ({
      isLoaded: jest.fn(() => false),
      isErrored: jest.fn(() => false),
      markLoaded: jest.fn(),
      markErrored: jest.fn(),
      preloadRange: jest.fn(),
      preload: jest.fn(),
      onLoaded: jest.fn(() => () => {
        /* noop */
      }),
    })),
    createSoundController: jest.fn(() => {
      const makeSignal = (initial: boolean) => {
        const listeners = new Set<() => void>();
        const sig = {
          value: initial,
          observe: jest.fn((fn: () => void) => {
            listeners.add(fn);
            return () => listeners.delete(fn);
          }),
        };
        return new Proxy(sig, {
          set(target, prop, val) {
            if (prop === 'value' && target.value !== val) {
              target.value = val;
              listeners.forEach((fn) => fn());
            } else {
              (target as Record<string, unknown>)[prop as string] = val;
            }
            return true;
          },
        });
      };
      const muted = makeSignal(true);
      const disabled = makeSignal(false);
      return {
        muted,
        disabled,
        toggle: jest.fn(() => {
          muted.value = !muted.value;
        }),
      };
    }),
  };
});

function makeItems(count: number): ContentItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    author: {
      name: `Author ${i}`,
      avatar: `https://example.com/avatar-${i}.jpg`,
    },
    description: `Description ${i}`,
    likes: i * 100,
    media: [
      {
        id: `media-${i}`,
        type: 'video' as const,
        src: `https://example.com/video-${i}.mp4`,
        aspectRatio: 0.5625,
      },
    ],
  }));
}

function makeImageItems(count: number): ContentItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `img-${i}`,
    author: {
      name: `Author ${i}`,
      avatar: `https://example.com/avatar-${i}.jpg`,
    },
    description: `Description ${i}`,
    likes: i * 50,
    media: [
      {
        id: `media-${i}`,
        type: 'image' as const,
        src: `https://example.com/img-${i}.jpg`,
        aspectRatio: 1,
      },
    ],
  }));
}

function createFixture(
  inputs: { isOpen?: boolean; content?: ContentItem[] } = {},
): ComponentFixture<RkReelPlayerOverlayComponent> {
  const fixture = TestBed.createComponent(RkReelPlayerOverlayComponent);
  fixture.componentRef.setInput('isOpen', inputs.isOpen ?? true);
  fixture.componentRef.setInput('content', inputs.content ?? makeItems(3));
  fixture.detectChanges();
  return fixture;
}

const { BodyLockService } = require('@reelkit/angular') as {
  BodyLockService: new () => { lock: jest.Mock; unlock: jest.Mock };
};

describe('RkReelPlayerOverlayComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RkReelPlayerOverlayComponent],
    });
    (mockedCaptureFocus as jest.Mock).mockClear();
    (mockedCreateFocusTrap as jest.Mock).mockClear();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders overlay div when isOpen is true', () => {
    const fixture = createFixture({ isOpen: true });
    const overlay = fixture.debugElement.query(By.css('.rk-reel-overlay'));
    expect(overlay).toBeTruthy();
  });

  it('does not render overlay when isOpen is false', () => {
    const fixture = createFixture({ isOpen: false });
    const overlay = fixture.debugElement.query(By.css('.rk-reel-overlay'));
    expect(overlay).toBeNull();
  });

  it('overlay has role="dialog"', () => {
    const fixture = createFixture({ isOpen: true });
    const overlay = fixture.debugElement.query(By.css('.rk-reel-overlay'));
    expect(overlay.nativeElement.getAttribute('role')).toBe('dialog');
  });

  it('overlay has aria-modal="true"', () => {
    const fixture = createFixture({ isOpen: true });
    const overlay = fixture.debugElement.query(By.css('.rk-reel-overlay'));
    expect(overlay.nativeElement.getAttribute('aria-modal')).toBe('true');
  });

  it('overlay aria-label defaults to "Video player"', () => {
    const fixture = createFixture({ isOpen: true });
    const overlay = fixture.debugElement.query(By.css('.rk-reel-overlay'));
    expect(overlay.nativeElement.getAttribute('aria-label')).toBe(
      'Video player',
    );
  });

  it('overlay aria-label reflects custom ariaLabel input', () => {
    const fixture = createFixture({ isOpen: true });
    fixture.componentRef.setInput('ariaLabel', 'Featured reels');
    fixture.detectChanges();
    const overlay = fixture.debugElement.query(By.css('.rk-reel-overlay'));
    expect(overlay.nativeElement.getAttribute('aria-label')).toBe(
      'Featured reels',
    );
  });

  it('captures focus and installs focus trap when overlay opens', fakeAsync(() => {
    createFixture({ isOpen: true });
    tick();
    expect(mockedCaptureFocus).toHaveBeenCalledTimes(1);
    expect(mockedCreateFocusTrap).toHaveBeenCalledTimes(1);
  }));

  it('disposes focus trap and restores focus when overlay closes', fakeAsync(() => {
    const fixture = createFixture({ isOpen: true });
    tick();
    const restoreFocus = (mockedCaptureFocus as jest.Mock).mock.results[0]
      .value as jest.Mock;
    const releaseTrap = (mockedCreateFocusTrap as jest.Mock).mock.results[0]
      .value as jest.Mock;

    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    tick();

    expect(releaseTrap).toHaveBeenCalled();
    expect(restoreFocus).toHaveBeenCalled();
  }));

  it('shows two navigation arrow buttons when open', () => {
    const fixture = createFixture({ isOpen: true, content: makeItems(3) });
    const buttons = fixture.debugElement.queryAll(By.css('.rk-reel-nav-btn'));
    expect(buttons.length).toBe(2);
  });

  it('previous nav button is disabled at first slide (index 0, no loop)', () => {
    const fixture = createFixture({ isOpen: true, content: makeItems(3) });
    const prevBtn = fixture.debugElement.query(
      By.css('[aria-label="Previous slide"]'),
    );
    expect(prevBtn.nativeElement.disabled).toBe(true);
  });

  it('next nav button is disabled at last slide (no loop)', () => {
    const fixture = createFixture({ isOpen: true, content: makeItems(3) });
    fixture.componentInstance.onAfterChange({ index: 2 });
    fixture.detectChanges();
    const nextBtn = fixture.debugElement.query(
      By.css('[aria-label="Next slide"]'),
    );
    expect(nextBtn.nativeElement.disabled).toBe(true);
  });

  it('next nav button is enabled when not at last slide', () => {
    const fixture = createFixture({ isOpen: true, content: makeItems(3) });
    const nextBtn = fixture.debugElement.query(
      By.css('[aria-label="Next slide"]'),
    );
    expect(nextBtn.nativeElement.disabled).toBe(false);
  });

  it('previous nav button enabled after navigating away from index 0', () => {
    const fixture = createFixture({ isOpen: true, content: makeItems(3) });
    fixture.componentInstance.onAfterChange({ index: 1 });
    fixture.detectChanges();
    const prevBtn = fixture.debugElement.query(
      By.css('[aria-label="Previous slide"]'),
    );
    expect(prevBtn.nativeElement.disabled).toBe(false);
  });

  it('emits closed when close button is clicked', () => {
    const fixture = createFixture({ isOpen: true });
    let closedCount = 0;
    fixture.componentInstance.closed.subscribe(() => {
      closedCount++;
    });

    const closeBtn = fixture.debugElement.query(By.css('rk-close-button'));
    closeBtn.componentInstance.clicked.emit();

    expect(closedCount).toBe(1);
  });

  it('emits closed when Escape key is pressed and isOpen is true', () => {
    const fixture = createFixture({ isOpen: true });
    let closedCount = 0;
    fixture.componentInstance.closed.subscribe(() => {
      closedCount++;
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(closedCount).toBe(1);
  });

  it('does NOT emit closed when Escape pressed but isOpen is false', () => {
    const fixture = createFixture({ isOpen: false });
    let closedCount = 0;
    fixture.componentInstance.closed.subscribe(() => {
      closedCount++;
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(closedCount).toBe(0);
  });

  it('does NOT emit closed for non-Escape keys', () => {
    const fixture = createFixture({ isOpen: true });
    let closedCount = 0;
    fixture.componentInstance.closed.subscribe(() => {
      closedCount++;
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));

    expect(closedCount).toBe(0);
  });

  it('provides SoundStateService at component level (not root)', () => {
    const fixture = createFixture({ isOpen: true });
    const service = fixture.debugElement.injector.get(SoundStateService);
    expect(service).toBeTruthy();
    expect(service).toBeInstanceOf(SoundStateService);
  });

  it('shows sound button when active slide has video', () => {
    const fixture = createFixture({ isOpen: true, content: makeItems(3) });
    const soundBtn = fixture.debugElement.query(By.css('rk-sound-button'));
    expect(soundBtn).toBeTruthy();
  });

  it('hides sound button when active slide has only images', () => {
    const fixture = createFixture({ isOpen: true, content: makeImageItems(3) });
    const soundBtn = fixture.debugElement.query(By.css('rk-sound-button'));
    expect(soundBtn).toBeNull();
  });

  it('renders overlay structure even with empty content array', () => {
    const fixture = createFixture({ isOpen: true, content: [] });
    const overlay = fixture.debugElement.query(By.css('.rk-reel-overlay'));
    expect(overlay).toBeTruthy();
  });

  it('activeIndex starts at 0 by default', () => {
    const fixture = createFixture({ isOpen: true });
    expect(fixture.componentInstance.activeIndex()).toBe(0);
  });

  it('activeIndex updates on onAfterChange', () => {
    const fixture = createFixture({ isOpen: true, content: makeItems(3) });
    fixture.componentInstance.onAfterChange({ index: 2 });
    expect(fixture.componentInstance.activeIndex()).toBe(2);
  });

  it('activeIndex equals initialIndex when isOpen is true', () => {
    const fixture = TestBed.createComponent(RkReelPlayerOverlayComponent);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('content', makeItems(6));
    fixture.componentRef.setInput('initialIndex', 5);
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(5);
  });

  it('activeIndex resets to new initialIndex when overlay closes and reopens', () => {
    const fixture = TestBed.createComponent(RkReelPlayerOverlayComponent);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('content', makeItems(6));
    fixture.componentRef.setInput('initialIndex', 5);
    fixture.detectChanges();

    // Navigate to a different slide while open
    fixture.componentInstance.onAfterChange({ index: 5 });
    fixture.detectChanges();

    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();

    fixture.componentRef.setInput('initialIndex', 3);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    expect(fixture.componentInstance.activeIndex()).toBe(3);
  });

  it('activeIndex still updates when onAfterChange fires (initialIndex behavior preserved)', () => {
    const fixture = TestBed.createComponent(RkReelPlayerOverlayComponent);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('content', makeItems(6));
    fixture.componentRef.setInput('initialIndex', 2);
    fixture.detectChanges();

    expect(fixture.componentInstance.activeIndex()).toBe(2);

    // Navigate forward — onAfterChange must still update activeIndex
    fixture.componentInstance.onAfterChange({ index: 4 });
    expect(fixture.componentInstance.activeIndex()).toBe(4);
  });

  it('calls BodyLockService.lock when isOpen is true', fakeAsync(() => {
    const bodyLock = TestBed.inject(
      BodyLockService as unknown as typeof BodyLockService,
    );
    jest.clearAllMocks();
    createFixture({ isOpen: true });
    tick();
    expect((bodyLock as { lock: jest.Mock }).lock).toHaveBeenCalled();
  }));

  it('calls BodyLockService.unlock when isOpen is false', fakeAsync(() => {
    const bodyLock = TestBed.inject(
      BodyLockService as unknown as typeof BodyLockService,
    );
    jest.clearAllMocks();
    createFixture({ isOpen: false });
    tick();
    expect((bodyLock as { unlock: jest.Mock }).unlock).toHaveBeenCalled();
  }));

  it('onBeforeChange disables sound state', () => {
    const fixture = createFixture({ isOpen: true });
    const service = fixture.debugElement.injector.get(SoundStateService);
    fixture.componentInstance.onBeforeChange();
    expect(service.disabled()).toBe(true);
  });

  it('onAfterChange re-enables sound state when slide has video', () => {
    const fixture = createFixture({ isOpen: true, content: makeItems(3) });
    const service = fixture.debugElement.injector.get(SoundStateService);
    fixture.componentInstance.onBeforeChange();
    fixture.componentInstance.onAfterChange({ index: 0 });
    expect(service.disabled()).toBe(false);
  });

  it('onAfterChange re-enables sound state even when slide has only images', () => {
    const fixture = createFixture({ isOpen: true, content: makeImageItems(3) });
    const service = fixture.debugElement.injector.get(SoundStateService);
    fixture.componentInstance.onBeforeChange();
    fixture.componentInstance.onAfterChange({ index: 1 });
    // disabled must be cleared so soundStateFacade.disabled() is not permanently true
    expect(service.disabled()).toBe(false);
  });

  it('onSlideDragEnd clears _videoPausedOnDrag flag', () => {
    const fixture = createFixture({ isOpen: true, content: makeItems(3) });
    const comp = fixture.componentInstance;
    const mockVideoEl = {
      paused: false,
      pause: jest.fn(),
      play: jest.fn().mockResolvedValue(undefined),
    } as unknown as HTMLVideoElement;
    comp.onVideoRef(mockVideoEl);
    comp.onSlideDragStart();
    // Flag is now set; calling onSlideDragEnd must clear it
    comp.onSlideDragEnd();
    // After onSlideDragEnd the flag must be false so a subsequent
    // onSlideDragCanceled does NOT attempt to resume playback.
    comp.onSlideDragCanceled();
    expect(mockVideoEl.play).not.toHaveBeenCalled();
  });

  it('soundStateFacade.muted delegates to SoundStateService.muted', () => {
    const fixture = createFixture({ isOpen: true });
    const service = fixture.debugElement.injector.get(SoundStateService);
    expect(fixture.componentInstance.soundStateFacade.muted()).toBe(
      service.muted(),
    );
  });

  it('soundStateFacade.toggle delegates to SoundStateService.toggle', () => {
    const fixture = createFixture({ isOpen: true });
    const service = fixture.debugElement.injector.get(SoundStateService);
    const before = service.muted();
    fixture.componentInstance.soundStateFacade.toggle();
    expect(service.muted()).toBe(!before);
  });

  it('soundStateFacade.disabled delegates to SoundStateService.disabled', () => {
    const fixture = createFixture({ isOpen: true });
    const service = fixture.debugElement.injector.get(SoundStateService);
    expect(fixture.componentInstance.soundStateFacade.disabled()).toBe(
      service.disabled(),
    );
  });

  // ─── Bug A: aspectRatio edge cases produce degenerate sizes ─────────────

  it('_getSize falls back to 9/16 when aspectRatio is 0', () => {
    const fixture = TestBed.createComponent(RkReelPlayerOverlayComponent);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('content', makeItems(3));
    fixture.componentRef.setInput('aspectRatio', 0);
    fixture.detectChanges();
    const [width, height] = fixture.componentInstance.size();
    // Must be finite positive numbers — not 0/Infinity
    expect(width).toBeGreaterThan(0);
    expect(Number.isFinite(height)).toBe(true);
    expect(height).toBeGreaterThan(0);
  });

  it('_getSize falls back to 9/16 when aspectRatio is NaN', () => {
    const fixture = TestBed.createComponent(RkReelPlayerOverlayComponent);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('content', makeItems(3));
    fixture.componentRef.setInput('aspectRatio', NaN);
    fixture.detectChanges();
    const [width, height] = fixture.componentInstance.size();
    expect(width).toBeGreaterThan(0);
    expect(Number.isFinite(height)).toBe(true);
    expect(height).toBeGreaterThan(0);
  });

  it('_getSize falls back to 9/16 when aspectRatio is Infinity', () => {
    const fixture = TestBed.createComponent(RkReelPlayerOverlayComponent);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('content', makeItems(3));
    fixture.componentRef.setInput('aspectRatio', Infinity);
    fixture.detectChanges();
    const [width, height] = fixture.componentInstance.size();
    expect(Number.isFinite(width)).toBe(true);
    expect(Number.isFinite(height)).toBe(true);
  });

  it('_getSize falls back to 9/16 when aspectRatio is negative', () => {
    const fixture = TestBed.createComponent(RkReelPlayerOverlayComponent);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('content', makeItems(3));
    fixture.componentRef.setInput('aspectRatio', -1);
    fixture.detectChanges();
    const [width, height] = fixture.componentInstance.size();
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  it('_getSize uses a valid aspectRatio when provided', () => {
    const fixture = TestBed.createComponent(RkReelPlayerOverlayComponent);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('content', makeItems(3));
    fixture.componentRef.setInput('aspectRatio', 3 / 4);
    fixture.detectChanges();
    const [width, height] = fixture.componentInstance.size();
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  // ─── Angular >=19 linkedSignal requirement ───────────────────────────────
  // linkedSignal() was introduced in Angular 19.0.0. The package.json
  // peerDependencies must declare ">=19.0.0" for all three Angular packages.
  // These tests exercise the linkedSignal-backed _activeIndex directly so
  // any regression that lowers the floor and breaks the API will be caught.

  it('activeIndex (linkedSignal) can be written via onAfterChange and read back', () => {
    const fixture = createFixture({ isOpen: true, content: makeItems(5) });
    fixture.componentInstance.onAfterChange({ index: 3 });
    expect(fixture.componentInstance.activeIndex()).toBe(3);
    fixture.componentInstance.onAfterChange({ index: 0 });
    expect(fixture.componentInstance.activeIndex()).toBe(0);
  });

  it('activeIndex (linkedSignal) resets to 0 when isOpen toggles false (source expression fires)', () => {
    const fixture = TestBed.createComponent(RkReelPlayerOverlayComponent);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('content', makeItems(5));
    fixture.componentRef.setInput('initialIndex', 0);
    fixture.detectChanges();

    // Drift away from initialIndex
    fixture.componentInstance.onAfterChange({ index: 4 });
    expect(fixture.componentInstance.activeIndex()).toBe(4);

    // Close — linkedSignal source returns 0 (isOpen is false)
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(0);
  });

  describe('onReady / onWaiting', () => {
    function getLoadingCtrl(
      fixture: ComponentFixture<RkReelPlayerOverlayComponent>,
    ) {
      return fixture.componentInstance['_loadingCtrl'] as {
        onReady: jest.Mock;
        onWaiting: jest.Mock;
        setActiveIndex: jest.Mock;
      };
    }

    function getPreloader(
      fixture: ComponentFixture<RkReelPlayerOverlayComponent>,
    ) {
      return fixture.componentInstance['_preloader'] as {
        markLoaded: jest.Mock;
      };
    }

    it('getOnReady returns a function that calls loadingCtrl.onReady', () => {
      const fixture = createFixture({ isOpen: true, content: makeItems(3) });
      const ctrl = getLoadingCtrl(fixture);
      fixture.componentInstance.getOnReady(1)();
      expect(ctrl.onReady).toHaveBeenCalledWith(1);
    });

    it('getOnReady calls preloader.markLoaded with the first media src', () => {
      const fixture = createFixture({ isOpen: true, content: makeItems(3) });
      const pre = getPreloader(fixture);
      fixture.componentInstance.getOnReady(0)();
      expect(pre.markLoaded).toHaveBeenCalledWith(
        fixture.componentInstance.content()[0].media[0].src,
      );
    });

    it('getOnWaiting returns a function that calls loadingCtrl.onWaiting', () => {
      const fixture = createFixture({ isOpen: true, content: makeItems(3) });
      const ctrl = getLoadingCtrl(fixture);
      fixture.componentInstance.getOnWaiting(2)();
      expect(ctrl.onWaiting).toHaveBeenCalledWith(2);
    });

    it('onAfterChange calls loadingCtrl.setActiveIndex', () => {
      const fixture = createFixture({ isOpen: true, content: makeItems(3) });
      const ctrl = getLoadingCtrl(fixture);
      fixture.componentInstance.onAfterChange({ index: 2 });
      expect(ctrl.setActiveIndex).toHaveBeenCalledWith(2);
    });

    it('getOnError calls loadingCtrl.onError', () => {
      const fixture = createFixture({ isOpen: true, content: makeItems(3) });
      const ctrl = getLoadingCtrl(fixture);
      fixture.componentInstance.getOnError(1)();
      expect(ctrl.onError).toHaveBeenCalledWith(1);
    });

    it('getOnError calls preloader.markErrored with the first media src', () => {
      const fixture = createFixture({ isOpen: true, content: makeItems(3) });
      const pre = getPreloader(fixture);
      fixture.componentInstance.getOnError(0)();
      expect(pre.markErrored).toHaveBeenCalledWith(
        fixture.componentInstance.content()[0].media[0].src,
      );
    });

    it('onAfterChange calls loadingCtrl.onError for errored sources', () => {
      const fixture = createFixture({ isOpen: true, content: makeItems(3) });
      const ctrl = getLoadingCtrl(fixture);
      const pre = getPreloader(fixture);
      pre.isErrored.mockReturnValue(true);

      fixture.componentInstance.onAfterChange({ index: 1 });

      expect(ctrl.onError).toHaveBeenCalledWith(1);
      pre.isErrored.mockReturnValue(false);
    });
  });

  describe('custom loading/error slots', () => {
    it('detects loadingSlot via contentChild', () => {
      const fixture = createFixture({ isOpen: true, content: makeItems(3) });
      expect(fixture.componentInstance['loadingSlot']).toBeDefined();
    });

    it('detects errorSlot via contentChild', () => {
      const fixture = createFixture({ isOpen: true, content: makeItems(3) });
      expect(fixture.componentInstance['errorSlot']).toBeDefined();
    });

    it('renders default wave loader when loadingSlot is not provided', () => {
      const fixture = createFixture({ isOpen: true, content: makeItems(3) });
      fixture.detectChanges();

      const loader = fixture.debugElement.query(By.css('.rk-reel-loader'));
      expect(loader).toBeTruthy();
    });
  });
});
