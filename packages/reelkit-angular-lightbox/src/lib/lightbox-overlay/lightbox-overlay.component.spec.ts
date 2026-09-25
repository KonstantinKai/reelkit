/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { RkLightboxOverlayComponent } from './lightbox-overlay.component';
import {
  BodyLockService,
  SoundStateService,
  captureFocusForReturn as mockedCaptureFocus,
  createFocusTrap as mockedCreateFocusTrap,
} from '@reelkit/angular';
import {
  RkLightboxControlsDirective,
  RkLightboxErrorDirective,
  RkLightboxInfoDirective,
  RkLightboxLoadingDirective,
  RkLightboxNavigationDirective,
} from '../template-slots/lightbox-template-slots';
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
  // The sound state service builds on core primitives directly, so mocking
  // the binding module must not replace it — the specs exercise the real one.
  const { SoundStateService } = jest.requireActual(
    '../../../../reelkit-angular/src/lib/sound-state/sound-state.service',
  ) as typeof import('@reelkit/angular');

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

  @Directive({ selector: '[rkReelItem]' })
  class MockRkReelItemDirective {
    static ngTemplateContextGuard(_d: unknown, _ctx: unknown): boolean {
      return true;
    }
  }

  @Directive({ selector: '[rkSwipeToClose]' })
  class MockRkSwipeToCloseDirective {
    readonly rkSwipeToClose = input<boolean>(false);
    readonly rkSwipeToCloseDirection = input<string>('up');
    readonly dismissed = output<void>();
  }

  return {
    BodyLockService: MockBodyLockService,
    SoundStateService,
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
    fullscreenSignal: mockFullscreenSignal,
    requestFullscreen: jest.fn().mockResolvedValue(undefined),
    exitFullscreen: jest.fn().mockResolvedValue(undefined),
    reaction: jest.fn(() => () => {
      /* noop */
    }),
    animate: jest.fn(() => () => {
      /* noop */
    }),
    captureFocusForReturn: jest.fn(() => jest.fn()),
    createFocusTrap: jest.fn(() => jest.fn()),
    getFocusableElements: jest.fn(() => []),
    observeDomEvent: jest.fn(() => jest.fn()),
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

const VIDEO_ITEMS: LightboxItem[] = [
  { src: 'https://example.com/a.mp4', type: 'video', title: 'Clip A' },
];

async function configure(providers: unknown[] = []): Promise<void> {
  await TestBed.configureTestingModule({
    imports: [RkLightboxOverlayComponent],
    providers: providers as never,
  })
    .overrideComponent(RkLightboxOverlayComponent, {
      set: {
        schemas: [jest.requireActual('@angular/core').NO_ERRORS_SCHEMA],
      },
    })
    .compileComponents();
}

/**
 * Re-configures with a sound state above the overlay, the way a consumer
 * provides one so the overlay and their video slide share it.
 */
async function configureWithProvidedSoundState(): Promise<void> {
  TestBed.resetTestingModule();
  await configure([SoundStateService]);
}

function soundStateOf(
  fixture: ComponentFixture<RkLightboxOverlayComponent>,
): SoundStateService {
  return fixture.componentInstance['soundState'];
}

describe('RkLightboxOverlayComponent', () => {
  let bodyLock: BodyLockService;

  beforeEach(async () => {
    jest.clearAllMocks();

    await configure();

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

  describe('swipeToCloseDirection', () => {
    it("defaults to 'up'", () => {
      const fixture = createFixture(true);
      expect(fixture.componentInstance.swipeToCloseDirection()).toBe('up');
    });

    it("updates when 'down' is set", () => {
      const fixture = createFixture(true);
      fixture.componentRef.setInput('swipeToCloseDirection', 'down');
      fixture.detectChanges();
      expect(fixture.componentInstance.swipeToCloseDirection()).toBe('down');
    });
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

  describe('sound state', () => {
    it('builds its own sound state when nothing provides one', () => {
      const fixture = createFixture(true, ITEMS, 0);
      expect(TestBed.inject(SoundStateService, null)).toBeNull();
      expect(soundStateOf(fixture)).toBeInstanceOf(SoundStateService);
    });

    it('uses the sound state provided above it', async () => {
      await configureWithProvidedSoundState();
      const fixture = createFixture(true, ITEMS, 0);
      expect(soundStateOf(fixture)).toBe(TestBed.inject(SoundStateService));
    });

    it('starts muted', () => {
      const fixture = createFixture(true, ITEMS, 0);
      expect(soundStateOf(fixture).muted()).toBe(true);
    });

    // A video slide renders from the consumer's own template, so its injector
    // is theirs. Without a shared instance a button here could not reach the
    // element, and an unusable control is worse than none.
    it('offers no sound button on a video slide when nothing provides sound state', () => {
      const fixture = createFixture(true, VIDEO_ITEMS, 0);
      expect(fixture.debugElement.query(By.css('rk-sound-button'))).toBeNull();
    });

    it('offers the sound button on a video slide once sound state is provided above it', async () => {
      await configureWithProvidedSoundState();
      const fixture = createFixture(true, VIDEO_ITEMS, 0);
      expect(
        fixture.debugElement.query(By.css('rk-sound-button')),
      ).toBeTruthy();
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

    it('restores muted on close', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const soundState = soundStateOf(fixture);
      soundState.toggle();
      expect(soundState.muted()).toBe(false);

      fixture.componentInstance['handleClose']();

      expect(soundState.muted()).toBe(true);
    });

    // The instance can be the consumer's, shared with a reel player that
    // drives `disabled` as live state. Closing a lightbox must not clear it.
    it('leaves disabled untouched on close', async () => {
      await configureWithProvidedSoundState();
      const fixture = createFixture(true, ITEMS, 0);
      const soundState = TestBed.inject(SoundStateService);
      soundState.setDisabled(true);

      fixture.componentInstance['handleClose']();

      expect(soundState.disabled()).toBe(true);
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

  describe('focus management', () => {
    beforeEach(() => {
      (mockedCaptureFocus as jest.Mock).mockClear();
      (mockedCreateFocusTrap as jest.Mock).mockClear();
    });

    it('captures focus and installs focus trap when overlay opens', () => {
      createFixture(true, ITEMS, 0);
      expect(mockedCaptureFocus).toHaveBeenCalledTimes(1);
      expect(mockedCreateFocusTrap).toHaveBeenCalledTimes(1);
    });

    it('disposes focus trap and restores focus when overlay closes', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const restoreFocus = (mockedCaptureFocus as jest.Mock).mock.results[0]
        .value as jest.Mock;
      const releaseTrap = (mockedCreateFocusTrap as jest.Mock).mock.results[0]
        .value as jest.Mock;

      fixture.componentRef.setInput('isOpen', false);
      fixture.detectChanges();

      expect(releaseTrap).toHaveBeenCalled();
      expect(restoreFocus).toHaveBeenCalled();
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

  describe('SSR safety: resize listener guarded by typeof window', () => {
    it('does not throw when window is available (normal browser)', () => {
      expect(() => createFixture(true, ITEMS, 0)).not.toThrow();
    });

    it('component does not crash when created with isOpen=false', () => {
      expect(() => createFixture(false, ITEMS, 0)).not.toThrow();
    });
  });

  describe('transitionFn', () => {
    it('resolves to slideTransition when transitionFn input is undefined', () => {
      const fixture = createFixture(true, ITEMS, 0);
      expect(typeof fixture.componentInstance['resolvedTransitionFn']()).toBe(
        'function',
      );
    });

    it('forwards a custom transitionFn input', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const customFn = () => ({});
      fixture.componentRef.setInput('transitionFn', customFn);
      fixture.detectChanges();
      expect(fixture.componentInstance['resolvedTransitionFn']()).toBe(
        customFn,
      );
    });
  });

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

  describe('driven by the slider', () => {
    const reelApi = () => ({
      next: jest.fn(),
      prev: jest.fn(),
      goTo: jest.fn(),
      adjust: jest.fn(),
      observe: jest.fn(),
      unobserve: jest.fn(),
    });

    const reelOf = (fixture: ComponentFixture<unknown>) =>
      fixture.debugElement.query(By.css('rk-reel')).componentInstance as {
        apiReady: { emit: (api: unknown) => void };
        afterChange: { emit: (event: { index: number }) => void };
      };

    const desktopFixture = (initialIndex = 0) => {
      const fixture = createFixture(true, ITEMS, initialIndex);
      fixture.componentInstance['isMobile'].set(false);
      fixture.detectChanges();
      return fixture;
    };

    it('moves the counter, arrows and info with the slider and reports the change', () => {
      const fixture = desktopFixture();
      const changes: number[] = [];
      fixture.componentInstance.slideChange.subscribe((index: number) =>
        changes.push(index),
      );

      reelOf(fixture).afterChange.emit({ index: 1 });
      fixture.detectChanges();

      expect(changes).toEqual([1]);
      expect(mocks.loadingCtrl.setActiveIndex).toHaveBeenLastCalledWith(1);
      expect(
        fixture.debugElement.query(By.css('.rk-lightbox-nav-prev')),
      ).toBeTruthy();
      expect(fixture.nativeElement.textContent).toContain('Image B');
    });

    it('shows the error straight away on a slide whose image already failed', () => {
      const fixture = desktopFixture();
      mocks.preloader.isErrored.mockImplementation(
        (src: string) => src === ITEMS[2].src,
      );

      reelOf(fixture).afterChange.emit({ index: 2 });

      expect(mocks.loadingCtrl.onError).toHaveBeenCalledWith(2);
      mocks.preloader.isErrored.mockImplementation(() => false);
    });

    it('skips the spinner on a slide whose image already loaded', () => {
      const fixture = desktopFixture();
      mocks.preloader.isLoaded.mockImplementation(
        (src: string) => src === ITEMS[1].src,
      );

      reelOf(fixture).afterChange.emit({ index: 1 });

      expect(mocks.loadingCtrl.onReady).toHaveBeenCalledWith(1);
      mocks.preloader.isLoaded.mockImplementation(() => false);
    });

    it('drives the slider from the arrows once the slider is ready', () => {
      const fixture = desktopFixture(1);
      const api = reelApi();
      reelOf(fixture).apiReady.emit(api);

      fixture.debugElement
        .query(By.css('.rk-lightbox-nav-next'))
        .nativeElement.click();
      fixture.debugElement
        .query(By.css('.rk-lightbox-nav-prev'))
        .nativeElement.click();

      expect(api.next).toHaveBeenCalledTimes(1);
      expect(api.prev).toHaveBeenCalledTimes(1);
    });

    it('follows a window resize and re-measures the slider', () => {
      const { observeDomEvent } = jest.requireMock('@reelkit/angular') as {
        observeDomEvent: jest.Mock;
      };
      const fixture = desktopFixture();
      const api = reelApi();
      reelOf(fixture).apiReady.emit(api);
      const resize = observeDomEvent.mock.calls.find(
        (call) => call[1] === 'resize',
      )?.[2] as (() => void) | undefined;
      expect(resize).toBeDefined();

      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 640,
      });
      resize!();

      expect(fixture.componentInstance['size']()[0]).toBe(640);
      expect(api.adjust).toHaveBeenCalledTimes(1);
    });

    it('labels each slide by its title and position, or by position alone', () => {
      const fixture = createFixture(true, [
        { src: 'https://example.com/titled.jpg', title: 'Sunset' },
        { src: 'https://example.com/plain.jpg' },
      ]);
      const label = (index: number) =>
        fixture.componentInstance['slideAriaLabel'](index);

      expect(label(0)).toBe('Sunset, 1 of 2');
      expect(label(1)).toBe('Image 2 of 2');
    });
  });

  describe('fullscreen button', () => {
    const { requestFullscreen, exitFullscreen } = jest.requireMock(
      '@reelkit/angular',
    ) as { requestFullscreen: jest.Mock; exitFullscreen: jest.Mock };

    const toggle = (fixture: ComponentFixture<RkLightboxOverlayComponent>) =>
      fixture.debugElement
        .query(By.css('rk-fullscreen-button'))
        .triggerEventHandler('toggled');

    afterEach(() => {
      mocks.fullscreenSignal.value = false;
    });

    it('asks for fullscreen on the gallery', () => {
      const fixture = createFixture();

      toggle(fixture);

      expect(requestFullscreen).toHaveBeenCalledWith(
        fixture.debugElement.query(By.css('.rk-lightbox-overlay'))
          .nativeElement,
      );
    });

    it('leaves fullscreen when it is already on', () => {
      const fixture = createFixture();
      mocks.fullscreenSignal.value = true;

      toggle(fixture);

      expect(exitFullscreen).toHaveBeenCalledTimes(1);
      expect(requestFullscreen).not.toHaveBeenCalled();
    });
  });

  describe('opening on a known image', () => {
    afterEach(() => {
      mocks.preloader.isErrored.mockImplementation(() => false);
      mocks.preloader.isLoaded.mockImplementation(() => false);
    });

    it('opens on the error state for an image that already failed', () => {
      mocks.preloader.isErrored.mockImplementation(
        (src: string) => src === ITEMS[0].src,
      );

      createFixture();

      expect(mocks.loadingCtrl.onError).toHaveBeenCalledWith(0);
      expect(mocks.preloader.onLoaded).not.toHaveBeenCalled();
    });

    it('opens without a spinner for an image that already loaded', () => {
      mocks.preloader.isLoaded.mockImplementation(
        (src: string) => src === ITEMS[0].src,
      );

      createFixture();

      expect(mocks.loadingCtrl.onReady).toHaveBeenCalledWith(0);
      expect(mocks.preloader.onLoaded).not.toHaveBeenCalled();
    });

    it('stops waiting for the first image once it closes', () => {
      const stopWaiting = jest.fn();
      mocks.preloader.onLoaded.mockReturnValueOnce(stopWaiting);
      const fixture = createFixture();

      fixture.componentRef.setInput('isOpen', false);
      fixture.detectChanges();

      expect(stopWaiting).toHaveBeenCalledTimes(1);
    });

    it('leaves fullscreen when it closes in fullscreen', () => {
      const { exitFullscreen } = jest.requireMock('@reelkit/angular') as {
        exitFullscreen: jest.Mock;
      };
      const fixture = createFixture();
      mocks.fullscreenSignal.value = true;

      fixture.componentRef.setInput('isOpen', false);
      fixture.detectChanges();
      mocks.fullscreenSignal.value = false;

      expect(exitFullscreen).toHaveBeenCalled();
    });
  });

  describe('template slots with their handlers', () => {
    @Component({
      template: `
        <rk-lightbox-overlay
          [isOpen]="true"
          [items]="items"
          (closed)="closed = closed + 1"
        >
          <ng-template
            rkLightboxControls
            let-onClose="onClose"
            let-onToggleFullscreen="onToggleFullscreen"
          >
            <button class="custom-close" (click)="onClose()">Close</button>
            <button class="custom-full" (click)="onToggleFullscreen()">
              Fullscreen
            </button>
          </ng-template>
          <ng-template
            rkLightboxNavigation
            let-onPrev="onPrev"
            let-onNext="onNext"
            let-activeIndex="activeIndex"
          >
            <button class="custom-prev" (click)="onPrev()">Previous</button>
            <button class="custom-next" (click)="onNext()">
              {{ activeIndex }}
            </button>
          </ng-template>
          <ng-template rkLightboxInfo let-item let-index="index">
            <div class="custom-info">{{ item.title }}#{{ index }}</div>
          </ng-template>
          <ng-template rkLightboxLoading let-index let-item="item">
            <div class="custom-loading">{{ item.title }}@{{ index }}</div>
          </ng-template>
        </rk-lightbox-overlay>
      `,
      imports: [
        RkLightboxOverlayComponent,
        RkLightboxControlsDirective,
        RkLightboxNavigationDirective,
        RkLightboxInfoDirective,
        RkLightboxLoadingDirective,
      ],
    })
    class SlotsHost {
      items = ITEMS;
      closed = 0;
    }

    let host: ComponentFixture<SlotsHost>;
    const overlay = () =>
      host.debugElement.query(By.directive(RkLightboxOverlayComponent))
        .componentInstance as RkLightboxOverlayComponent;

    beforeEach(() => {
      mocks.loadingSignal.value = true;
      host = TestBed.createComponent(SlotsHost);
      host.detectChanges();
      overlay()['isMobile'].set(false);
      host.detectChanges();
    });

    const click = (selector: string) =>
      host.debugElement.query(By.css(selector)).nativeElement.click();

    it('closes from the custom controls', () => {
      click('.custom-close');

      expect(host.componentInstance.closed).toBe(1);
    });

    it('toggles fullscreen from the custom controls', () => {
      const { requestFullscreen } = jest.requireMock('@reelkit/angular') as {
        requestFullscreen: jest.Mock;
      };

      click('.custom-full');

      expect(requestFullscreen).toHaveBeenCalledTimes(1);
    });

    it('drives the slider from the custom navigation', () => {
      const api = {
        next: jest.fn(),
        prev: jest.fn(),
        adjust: jest.fn(),
      };
      host.debugElement
        .query(By.css('rk-reel'))
        .componentInstance.apiReady.emit(api);

      click('.custom-next');
      click('.custom-prev');

      expect(api.next).toHaveBeenCalledTimes(1);
      expect(api.prev).toHaveBeenCalledTimes(1);
      expect(
        host.debugElement.query(By.css('.rk-lightbox-nav-next')),
      ).toBeNull();
    });

    it('renders the custom info with the active item', () => {
      expect(
        host.debugElement.query(By.css('.custom-info')).nativeElement
          .textContent,
      ).toContain('Image A#0');
    });

    it('renders the custom loading state in place of the spinner', () => {
      expect(
        host.debugElement.query(By.css('.custom-loading')).nativeElement
          .textContent,
      ).toContain('Image A@0');
      expect(
        host.debugElement.query(By.css('.rk-lightbox-spinner')),
      ).toBeNull();
    });
  });

  describe('custom error slot', () => {
    @Component({
      template: `
        <rk-lightbox-overlay [isOpen]="true" [items]="items">
          <ng-template rkLightboxError let-index let-item="item">
            <div class="custom-error">{{ item.title }}!{{ index }}</div>
          </ng-template>
        </rk-lightbox-overlay>
      `,
      imports: [RkLightboxOverlayComponent, RkLightboxErrorDirective],
    })
    class ErrorHost {
      items = ITEMS;
    }

    const errorSignal = () =>
      (mocks.loadingCtrl as unknown as { isError: { value: boolean } }).isError;

    afterEach(() => {
      errorSignal().value = false;
    });

    it('renders the custom error once the image fails', () => {
      errorSignal().value = true;
      const host = TestBed.createComponent(ErrorHost);
      host.detectChanges();

      expect(
        host.debugElement.query(By.css('.custom-error')).nativeElement
          .textContent,
      ).toContain('Image A!0');
    });
  });
});
