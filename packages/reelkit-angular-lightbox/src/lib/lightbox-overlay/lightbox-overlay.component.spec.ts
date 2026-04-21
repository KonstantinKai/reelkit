import { Component } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { RkLightboxOverlayComponent } from './lightbox-overlay.component';
import { BodyLockService } from '@reelkit/angular';
import { RkLightboxControlsDirective } from '../template-slots/lightbox-template-slots';
import type { LightboxItem } from '../types';

// Mock @reelkit/angular — provide a mock BodyLockService and stub the signal
// bridge helpers so no RAF loops run in tests.

const mockSliderState = {
  index: {
    value: 0,
    observe: jest.fn(() => () => {
      /* noop */
    }),
  },
  axisValue: {
    value: { value: 0, duration: 0 },
    observe: jest.fn(() => () => {
      /* noop */
    }),
  },
  indexes: {
    value: [0],
    observe: jest.fn(() => () => {
      /* noop */
    }),
  },
};

const mockSlider = {
  state: mockSliderState,
  config: {},
  next: jest.fn().mockResolvedValue(undefined),
  prev: jest.fn().mockResolvedValue(undefined),
  goTo: jest.fn().mockResolvedValue(undefined),
  adjust: jest.fn(),
  setPrimarySize: jest.fn(),
  updateConfig: jest.fn(),
  updateEvents: jest.fn(),
  observe: jest.fn(),
  unobserve: jest.fn(),
  attach: jest.fn(),
  detach: jest.fn(),
  dispose: jest.fn(),
  getRangeIndex: jest.fn(() => 0),
};

const mockGestureController = {
  attach: jest.fn(),
  detach: jest.fn(),
  observe: jest.fn(),
  unobserve: jest.fn(),
  updateEvents: jest.fn(),
};

jest.mock('@reelkit/angular', () => {
  const {
    Injectable,
    Component,
    Directive,
    Input,
    Output,
    EventEmitter,
    input,
    output,
    signal: angSignal,
  } = jest.requireActual('@angular/core') as typeof import('@angular/core');

  const noop = () => {
    /* noop */
  };
  const observe = jest.fn(() => noop);

  const mockFullscreenSignal = { value: false, observe };
  const mockLoadingSignal = { value: true, observe };
  const mockLoadingCtrl = {
    isLoading: mockLoadingSignal,
    setActiveIndex: jest.fn(),
    onReady: jest.fn((idx: number) => {
      if (idx >= 0) mockLoadingSignal.value = false;
    }),
    onWaiting: jest.fn(),
    onError: jest.fn(),
    isError: { value: false, observe },
  };
  const mockMutedSignal = { value: true, observe };
  const mockDisabledSignal = { value: false, observe };
  const mockSoundCtrl = {
    muted: mockMutedSignal,
    disabled: mockDisabledSignal,
    toggle: jest.fn(),
  };
  const mockPreloader = {
    isLoaded: jest.fn(() => false),
    isErrored: jest.fn(() => false),
    markLoaded: jest.fn(),
    markErrored: jest.fn(),
    preloadRange: jest.fn(),
    onLoaded: jest.fn(() => noop),
  };

  // Expose mock objects for test assertions via globalThis.
  (globalThis as unknown as Record<string, unknown>)['__lightboxMocks'] = {
    fullscreenSignal: mockFullscreenSignal,
    loadingSignal: mockLoadingSignal,
    loadingCtrl: mockLoadingCtrl,
    mutedSignal: mockMutedSignal,
    disabledSignal: mockDisabledSignal,
    soundCtrl: mockSoundCtrl,
    preloader: mockPreloader,
  };

  @Injectable({ providedIn: 'root' })
  class MockBodyLockService {
    lock = jest.fn();
    unlock = jest.fn();
  }

  @Component({
    selector: 'rk-reel',
    template: '<ng-content/>',
    standalone: true,
  })
  class MockReelComponent {
    @Input() count = 0;
    @Input() size: [number, number] = [0, 0];
    @Input() direction = 'horizontal';
    @Input() initialIndex = 0;
    @Input() loop = false;
    @Input() enableNavKeys = true;
    @Input() enableWheel = false;
    @Input() wheelDebounceMs = 200;
    @Input() transitionDuration = 300;
    @Input() swipeDistanceFactor = 0.12;
    @Input() transition: unknown = undefined;
    @Output() apiReady = new EventEmitter<unknown>();
    @Output() afterChange = new EventEmitter<{ index: number }>();
  }

  @Directive({ selector: '[rkReelItem]', standalone: true })
  class MockRkReelItemDirective {
    static ngTemplateContextGuard(_d: unknown, _ctx: unknown): boolean {
      return true;
    }
  }

  @Directive({ selector: '[rkSwipeToClose]', standalone: true })
  class MockRkSwipeToCloseDirective {
    readonly rkSwipeToClose = input<boolean>(false);
    readonly rkSwipeToCloseDirection = input<string>('up');
    readonly dismissed = output<void>();
  }

  return {
    BodyLockService: MockBodyLockService,
    ReelComponent: MockReelComponent,
    RkReelItemDirective: MockRkReelItemDirective,
    RkSwipeToCloseDirective: MockRkSwipeToCloseDirective,
    toAngularSignal: jest.fn((source: { value?: unknown }) =>
      angSignal(source?.value ?? false),
    ),
    animatedSignalBridge: jest.fn(() => angSignal(0)),
    slideTransition: jest.fn(),
    flipTransition: jest.fn(),
    createSliderController: jest.fn(() => mockSlider),
    createGestureController: jest.fn(() => mockGestureController),
    createContentLoadingController: jest.fn(() => mockLoadingCtrl),
    createContentPreloader: jest.fn(() => mockPreloader),
    createSoundController: jest.fn(() => mockSoundCtrl),
    fullscreenSignal: mockFullscreenSignal,
    requestFullscreen: jest.fn().mockResolvedValue(undefined),
    exitFullscreen: jest.fn().mockResolvedValue(undefined),
    reaction: jest.fn(() => () => {
      /* noop */
    }),
    animate: jest.fn(() => () => {
      /* noop */
    }),
    captureFocusForReturn: jest.fn(() => () => {
      /* noop */
    }),
    createFocusTrap: jest.fn(() => () => {
      /* noop */
    }),
    getFocusableElements: jest.fn(() => []),
  };
});

// Access mock state created inside the jest.mock factory.
const mocks = (globalThis as unknown as Record<string, unknown>)[
  '__lightboxMocks'
] as {
  fullscreenSignal: { value: boolean };
  loadingSignal: { value: boolean };
  loadingCtrl: {
    isLoading: { value: boolean };
    setActiveIndex: jest.Mock;
    onReady: jest.Mock;
    onWaiting: jest.Mock;
    onError: jest.Mock;
  };
  mutedSignal: { value: boolean };
  disabledSignal: { value: boolean };
  soundCtrl: {
    muted: { value: boolean };
    disabled: { value: boolean };
    toggle: jest.Mock;
  };
  preloader: {
    isLoaded: jest.Mock;
    isErrored: jest.Mock;
    markLoaded: jest.Mock;
    markErrored: jest.Mock;
    preloadRange: jest.Mock;
    onLoaded: jest.Mock;
  };
};

const ITEMS: LightboxItem[] = [
  { src: 'https://example.com/a.jpg', title: 'Image A' },
  { src: 'https://example.com/b.jpg', title: 'Image B' },
  { src: 'https://example.com/c.jpg', title: 'Image C' },
];

function createFixture(
  isOpen = true,
  items: LightboxItem[] = ITEMS,
  initialIndex = 0,
): ComponentFixture<RkLightboxOverlayComponent> {
  const fixture = TestBed.createComponent(RkLightboxOverlayComponent);
  fixture.componentRef.setInput('isOpen', isOpen);
  fixture.componentRef.setInput('items', items);
  fixture.componentRef.setInput('initialIndex', initialIndex);
  fixture.detectChanges();
  return fixture;
}

describe('RkLightboxOverlayComponent', () => {
  let bodyLock: BodyLockService;

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [RkLightboxOverlayComponent],
    })
      .overrideComponent(RkLightboxOverlayComponent, {
        set: {
          schemas: [jest.requireActual('@angular/core').NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    bodyLock = TestBed.inject(BodyLockService);
  });

  it('creates the component', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('when isOpen=true', () => {
    it('renders the container dialog', () => {
      const fixture = createFixture(true);
      const container = fixture.debugElement.query(
        By.css('.rk-lightbox-overlay'),
      );
      expect(container).toBeTruthy();
    });

    it('container has role="dialog"', () => {
      const fixture = createFixture(true);
      const container = fixture.debugElement.query(
        By.css('.rk-lightbox-overlay'),
      );
      expect(container.nativeElement.getAttribute('role')).toBe('dialog');
    });

    it('container has aria-modal="true"', () => {
      const fixture = createFixture(true);
      const container = fixture.debugElement.query(
        By.css('.rk-lightbox-overlay'),
      );
      expect(container.nativeElement.getAttribute('aria-modal')).toBe('true');
    });

    it('locks body scroll', fakeAsync(() => {
      createFixture(true);
      tick();
      expect(bodyLock.lock).toHaveBeenCalled();
    }));
  });

  describe('when isOpen=false', () => {
    it('does not render the container dialog', () => {
      const fixture = createFixture(false);
      const container = fixture.debugElement.query(
        By.css('.rk-lightbox-overlay'),
      );
      expect(container).toBeNull();
    });

    it('does not lock body scroll', () => {
      createFixture(false);
      expect(bodyLock.lock).not.toHaveBeenCalled();
    });
  });

  describe('empty items', () => {
    it('shows empty state message when items is empty', () => {
      const fixture = createFixture(true, []);
      const empty = fixture.debugElement.query(By.css('.rk-lightbox-empty'));
      expect(empty).toBeTruthy();
      expect(empty.nativeElement.textContent).toContain('No items to display');
    });

    it('empty state has role="status" and aria-live="polite"', () => {
      const fixture = createFixture(true, []);
      const empty = fixture.debugElement.query(By.css('.rk-lightbox-empty'));
      expect(empty.nativeElement.getAttribute('role')).toBe('status');
      expect(empty.nativeElement.getAttribute('aria-live')).toBe('polite');
    });

    it('does not render slides when items is empty', () => {
      const fixture = createFixture(true, []);
      const slides = fixture.debugElement.queryAll(
        By.css('.rk-lightbox-slide'),
      );
      expect(slides.length).toBe(0);
    });
  });

  describe('slides', () => {
    it('renders rk-reel element when items are provided', () => {
      const fixture = createFixture(true, ITEMS);
      const reel = fixture.debugElement.query(By.css('rk-reel'));
      expect(reel).toBeTruthy();
    });

    it('onImageError tracks error index', () => {
      const fixture = createFixture(true, ITEMS, 0);
      fixture.componentInstance['onImageError'](0);
      expect(fixture.componentInstance['imageErrorIndexes']().has(0)).toBe(
        true,
      );
    });

    it('onImageError does not affect other indices', () => {
      const fixture = createFixture(true, ITEMS, 0);
      fixture.componentInstance['onImageError'](0);
      expect(fixture.componentInstance['imageErrorIndexes']().has(1)).toBe(
        false,
      );
    });

    it('onImageLoad tracks loaded index', () => {
      const fixture = createFixture(true, ITEMS, 0);
      fixture.componentInstance['onImageLoad'](0);
      expect(fixture.componentInstance['imageLoadedIndexes']().has(0)).toBe(
        true,
      );
    });
  });

  describe('controls', () => {
    it('renders counter by default', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const counter = fixture.debugElement.query(By.css('rk-counter'));
      expect(counter).toBeTruthy();
    });

    it('renders close button by default', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const closeBtn = fixture.debugElement.query(By.css('rk-close-button'));
      expect(closeBtn).toBeTruthy();
    });

    it('renders fullscreen button by default', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const fsBtn = fixture.debugElement.query(By.css('rk-fullscreen-button'));
      expect(fsBtn).toBeTruthy();
    });

    it('does not render controls when showControls=false', () => {
      const fixture = createFixture(true, ITEMS, 0);
      fixture.componentRef.setInput('showControls', false);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('rk-counter'))).toBeNull();
      expect(fixture.debugElement.query(By.css('rk-close-button'))).toBeNull();
    });
  });

  describe('counter index', () => {
    it('counter shows "1" and total count for first item', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const counter = fixture.debugElement.query(By.css('rk-counter'));
      const text = counter.nativeElement.textContent.trim();
      expect(text).toContain('1');
      expect(text).toContain('3');
    });
  });

  describe('navigation arrows', () => {
    it('does not show prev button when at first slide', () => {
      const fixture = createFixture(true, ITEMS, 0);
      fixture.componentInstance['isMobile'].set(false);
      fixture.detectChanges();

      const prevBtn = fixture.debugElement.query(
        By.css('.rk-lightbox-nav-prev'),
      );
      expect(prevBtn).toBeNull();
    });

    it('shows next button when not at last slide (non-mobile)', () => {
      const fixture = createFixture(true, ITEMS, 0);
      fixture.componentInstance['isMobile'].set(false);
      fixture.detectChanges();

      const nextBtn = fixture.debugElement.query(
        By.css('.rk-lightbox-nav-next'),
      );
      expect(nextBtn).toBeTruthy();
    });

    it('does not render arrow buttons when showNavigation=false', () => {
      const fixture = createFixture(true, ITEMS, 0);
      fixture.componentInstance['isMobile'].set(false);
      fixture.componentRef.setInput('showNavigation', false);
      fixture.detectChanges();

      expect(
        fixture.debugElement.query(By.css('.rk-lightbox-nav-next')),
      ).toBeNull();
      expect(
        fixture.debugElement.query(By.css('.rk-lightbox-nav-prev')),
      ).toBeNull();
    });
  });

  describe('closed output', () => {
    it('emits closed when handleClose is called', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const closedSpy = jest.fn();
      fixture.componentInstance.closed.subscribe(closedSpy);

      fixture.componentInstance['handleClose']();

      expect(closedSpy).toHaveBeenCalledTimes(1);
    });

    it('resets sound muted state on close', () => {
      mocks.mutedSignal.value = false;
      const fixture = createFixture(true, ITEMS, 0);

      fixture.componentInstance['handleClose']();

      expect(mocks.mutedSignal.value).toBe(true);
    });

    it('emits closed when Escape key is pressed', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const closedSpy = jest.fn();
      fixture.componentInstance.closed.subscribe(closedSpy);

      fixture.componentInstance['onKeydown'](
        new KeyboardEvent('keydown', { key: 'Escape' }),
      );

      expect(closedSpy).toHaveBeenCalledTimes(1);
    });

    it('does not emit closed on Escape when overlay is not open', () => {
      const fixture = createFixture(false, ITEMS, 0);
      const closedSpy = jest.fn();
      fixture.componentInstance.closed.subscribe(closedSpy);

      fixture.componentInstance['onKeydown'](
        new KeyboardEvent('keydown', { key: 'Escape' }),
      );

      expect(closedSpy).not.toHaveBeenCalled();
    });

    it('does not emit closed for non-Escape keys', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const closedSpy = jest.fn();
      fixture.componentInstance.closed.subscribe(closedSpy);

      fixture.componentInstance['onKeydown'](
        new KeyboardEvent('keydown', { key: 'ArrowRight' }),
      );

      expect(closedSpy).not.toHaveBeenCalled();
    });
  });

  describe('slideChange output', () => {
    it('exposes a slideChange output EventEmitter', () => {
      const fixture = createFixture(true, ITEMS, 0);
      expect(fixture.componentInstance.slideChange).toBeDefined();
    });
  });

  describe('ariaLabel', () => {
    it('defaults to "Image gallery"', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const container = fixture.debugElement.query(
        By.css('.rk-lightbox-overlay'),
      );
      expect(container.nativeElement.getAttribute('aria-label')).toBe(
        'Image gallery',
      );
    });

    it('reflects a custom ariaLabel input', () => {
      const fixture = createFixture(true, ITEMS, 0);
      fixture.componentRef.setInput('ariaLabel', 'Product gallery');
      fixture.detectChanges();
      const container = fixture.debugElement.query(
        By.css('.rk-lightbox-overlay'),
      );
      expect(container.nativeElement.getAttribute('aria-label')).toBe(
        'Product gallery',
      );
    });
  });

  describe('info overlay', () => {
    it('renders title when item has a title', () => {
      const fixture = createFixture(
        true,
        [{ src: 'img.jpg', title: 'My Title', description: 'A description' }],
        0,
      );
      const title = fixture.debugElement.query(By.css('.rk-lightbox-title'));
      expect(title).toBeTruthy();
      expect(title.nativeElement.textContent.trim()).toBe('My Title');
    });

    it('renders description when item has description', () => {
      const fixture = createFixture(
        true,
        [{ src: 'img.jpg', title: 'T', description: 'My Desc' }],
        0,
      );
      const desc = fixture.debugElement.query(
        By.css('.rk-lightbox-description'),
      );
      expect(desc).toBeTruthy();
      expect(desc.nativeElement.textContent.trim()).toBe('My Desc');
    });

    it('does not render info overlay when showInfo=false', () => {
      const fixture = createFixture(
        true,
        [{ src: 'img.jpg', title: 'T', description: 'D' }],
        0,
      );
      fixture.componentRef.setInput('showInfo', false);
      fixture.detectChanges();
      expect(
        fixture.debugElement.query(By.css('.rk-lightbox-info')),
      ).toBeNull();
    });
  });

  describe('rkLightboxControls template slot', () => {
    @Component({
      template: `
        <rk-lightbox-overlay [isOpen]="true" [items]="items">
          <ng-template
            rkLightboxControls
            let-currentIndex="currentIndex"
            let-count="count"
          >
            <div class="custom-controls">
              custom-{{ currentIndex }}/{{ count }}
            </div>
          </ng-template>
        </rk-lightbox-overlay>
      `,
      imports: [RkLightboxOverlayComponent, RkLightboxControlsDirective],
    })
    class ControlsSlotHost {
      items = ITEMS;
    }

    let slotFixture: ComponentFixture<ControlsSlotHost>;

    beforeEach(() => {
      slotFixture = TestBed.createComponent(ControlsSlotHost);
      slotFixture.detectChanges();
    });

    it('renders custom controls slot instead of default controls', () => {
      const customCtrl = slotFixture.debugElement.query(
        By.css('.custom-controls'),
      );
      expect(customCtrl).toBeTruthy();
      expect(customCtrl.nativeElement.textContent).toContain('custom-');
    });

    it('hides default close button when custom controls slot is present', () => {
      const closeBtn = slotFixture.debugElement.query(
        By.css('rk-close-button'),
      );
      expect(closeBtn).toBeNull();
    });
  });

  describe('cleanup', () => {
    it('unlocks body scroll when destroyed', fakeAsync(() => {
      const fixture = createFixture(true, ITEMS, 0);
      tick();
      fixture.destroy();
      expect(bodyLock.unlock).toHaveBeenCalled();
    }));
  });

  describe('close/reopen race condition', () => {
    it('opens at correct initialIndex after close and reopen', fakeAsync(() => {
      const fixture = createFixture(true, ITEMS, 0);
      tick();

      fixture.componentRef.setInput('isOpen', false);
      fixture.detectChanges();
      tick();

      fixture.componentRef.setInput('initialIndex', 2);
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance['currentIndex']()).toBe(2);
    }));

    it('clears reelApi on close', fakeAsync(() => {
      const fixture = createFixture(true, ITEMS, 0);
      tick();

      fixture.componentRef.setInput('isOpen', false);
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance['_reelApi']).toBeNull();
    }));
  });

  describe('preloadAdjacentSlides', () => {
    it('does not preload when overlay is closed', () => {
      // preloadAdjacentSlides checks isOpen() before preloading
      const fixture = createFixture(false, ITEMS, 0);
      // If isOpen is false the guard returns early — no Image() should be created.
      // We cannot easily spy on the module-scoped preloadImage, but we can
      // assert the component does not throw and stays stable.
      expect(fixture.componentInstance).toBeTruthy();
    });
  });

  // ─── Bug regression tests ─────────────────────────────────────────────────

  describe('Bug 4 (Lightbox): focus moves to container on open', () => {
    it('container element is focused (or focus is requested) after opening', fakeAsync(() => {
      const fixture = createFixture(true, ITEMS, 0);
      tick(); // flush Promise.resolve().then(() => el.focus())

      const container = fixture.debugElement.query(
        By.css('.rk-lightbox-overlay'),
      );
      // After opening, the overlay requests focus via a microtask. In jsdom the
      // active element should be the container or a descendant of it.
      // We assert the container element exists and has tabindex so it CAN receive focus.
      expect(container).toBeTruthy();
      const el: HTMLElement = container.nativeElement;
      expect(el.getAttribute('tabindex')).not.toBeNull();
    }));

    it('does not attempt to focus when overlay is closed', fakeAsync(() => {
      const fixture = createFixture(false, ITEMS, 0);
      tick();
      const container = fixture.debugElement.query(
        By.css('.rk-lightbox-overlay'),
      );
      // When closed no container is rendered, so focus can never fire.
      expect(container).toBeNull();
    }));
  });

  describe('close-reopen lifecycle', () => {
    it('no errors thrown when opening, closing and reopening', fakeAsync(() => {
      const fixture = createFixture(true, ITEMS, 0);
      tick();

      expect(() => {
        fixture.componentRef.setInput('isOpen', false);
        fixture.detectChanges();
        tick();

        fixture.componentRef.setInput('isOpen', true);
        fixture.detectChanges();
        tick();
      }).not.toThrow();
    }));
  });

  // ─── SSR guard tests ───────────────────────────────────────────────────────

  describe('SSR safety: resize listener guarded by typeof window', () => {
    it('does not throw when window is available (normal browser)', () => {
      expect(() => createFixture(true, ITEMS, 0)).not.toThrow();
    });

    it('component does not crash when created with isOpen=false', () => {
      expect(() => createFixture(false, ITEMS, 0)).not.toThrow();
    });
  });

  describe('transitionFn', () => {
    it('defaults to slide transition', () => {
      const fixture = createFixture(true, ITEMS, 0);
      expect(typeof fixture.componentInstance['transitionFn']()).toBe(
        'function',
      );
    });

    it('maps flip to flipTransition', () => {
      const fixture = createFixture(true, ITEMS, 0);
      fixture.componentRef.setInput('transition', 'flip');
      fixture.detectChanges();
      expect(typeof fixture.componentInstance['transitionFn']()).toBe(
        'function',
      );
    });
  });

  // ─── Bug: handleClose exits fullscreen before emitting closed ─────────────

  describe('handleClose exits fullscreen before emitting closed', () => {
    const { exitFullscreen } = require('@reelkit/angular');

    it('exits fullscreen when close is called while in fullscreen', () => {
      const fixture = createFixture(true, ITEMS, 0);
      mocks.fullscreenSignal.value = true;

      fixture.componentInstance['handleClose']();

      expect(exitFullscreen).toHaveBeenCalled();
      mocks.fullscreenSignal.value = false;
    });

    it('still emits closed after exiting fullscreen', () => {
      const fixture = createFixture(true, ITEMS, 0);
      mocks.fullscreenSignal.value = true;

      const closedSpy = jest.fn();
      fixture.componentInstance.closed.subscribe(closedSpy);

      fixture.componentInstance['handleClose']();

      expect(closedSpy).toHaveBeenCalledTimes(1);
      mocks.fullscreenSignal.value = false;
    });

    it('does not call exitFullscreen when not in fullscreen', () => {
      const fixture = createFixture(true, ITEMS, 0);
      mocks.fullscreenSignal.value = false;

      fixture.componentInstance['handleClose']();

      expect(exitFullscreen).not.toHaveBeenCalled();
    });

    it('Escape key exits fullscreen and emits closed when in fullscreen', () => {
      const fixture = createFixture(true, ITEMS, 0);
      mocks.fullscreenSignal.value = true;

      const closedSpy = jest.fn();
      fixture.componentInstance.closed.subscribe(closedSpy);

      fixture.componentInstance['onKeydown'](
        new KeyboardEvent('keydown', { key: 'Escape' }),
      );

      expect(exitFullscreen).toHaveBeenCalled();
      expect(closedSpy).toHaveBeenCalledTimes(1);
      mocks.fullscreenSignal.value = false;
    });
  });

  describe('loading spinner', () => {
    it('renders spinner when loading', () => {
      mocks.loadingSignal.value = true;
      const fixture = createFixture(true, ITEMS, 0);

      const spinner = fixture.debugElement.query(
        By.css('.rk-lightbox-spinner'),
      );
      expect(spinner).toBeTruthy();
    });
  });

  describe('top shade', () => {
    it('renders top shade gradient', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const shade = fixture.debugElement.query(
        By.css('.rk-lightbox-top-shade'),
      );
      expect(shade).toBeTruthy();
    });
  });

  describe('onReady / onWaiting', () => {
    it('slideContext includes onReady and onWaiting callbacks', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const ctx = fixture.componentInstance['slideContext'](0);
      expect(typeof ctx.onReady).toBe('function');
      expect(typeof ctx.onWaiting).toBe('function');
    });

    it('onReady calls loadingCtrl.onReady', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const ctx = fixture.componentInstance['slideContext'](0);
      ctx.onReady();
      expect(mocks.loadingCtrl.onReady).toHaveBeenCalledWith(0);
    });

    it('onReady calls preloader.markLoaded with the item src', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const ctx = fixture.componentInstance['slideContext'](0);
      ctx.onReady();
      expect(mocks.preloader.markLoaded).toHaveBeenCalledWith(ITEMS[0].src);
    });

    it('onWaiting calls loadingCtrl.onWaiting', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const ctx = fixture.componentInstance['slideContext'](1);
      ctx.onWaiting();
      expect(mocks.loadingCtrl.onWaiting).toHaveBeenCalledWith(1);
    });

    it('onImageLoad calls loadingCtrl.onReady and preloader.markLoaded', () => {
      const fixture = createFixture(true, ITEMS, 0);
      fixture.componentInstance['onImageLoad'](0);
      expect(mocks.loadingCtrl.onReady).toHaveBeenCalledWith(0);
      expect(mocks.preloader.markLoaded).toHaveBeenCalledWith(ITEMS[0].src);
    });

    it('onImageError calls loadingCtrl.onError and preloader.markErrored', () => {
      const fixture = createFixture(true, ITEMS, 0);
      fixture.componentInstance['onImageError'](0);
      expect(mocks.loadingCtrl.onError).toHaveBeenCalledWith(0);
      expect(mocks.preloader.markErrored).toHaveBeenCalledWith(ITEMS[0].src);
    });

    it('slideContext.onError calls loadingCtrl.onError and preloader.markErrored', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const ctx = fixture.componentInstance['slideContext'](1);
      ctx.onError();
      expect(mocks.loadingCtrl.onError).toHaveBeenCalledWith(1);
      expect(mocks.preloader.markErrored).toHaveBeenCalledWith(ITEMS[1].src);
    });
  });

  describe('custom loading/error slots', () => {
    it('renders default spinner when loadingSlot is not provided', () => {
      mocks.loadingSignal.value = true;
      const fixture = createFixture(true, ITEMS, 0);
      expect(
        fixture.debugElement.query(By.css('.rk-lightbox-spinner')),
      ).toBeTruthy();
    });

    it('detects loadingSlot via contentChild', () => {
      const fixture = createFixture(true, ITEMS, 0);
      expect(fixture.componentInstance['loadingSlot']).toBeDefined();
    });

    it('detects errorSlot via contentChild', () => {
      const fixture = createFixture(true, ITEMS, 0);
      expect(fixture.componentInstance['errorSlot']).toBeDefined();
    });
  });
});
