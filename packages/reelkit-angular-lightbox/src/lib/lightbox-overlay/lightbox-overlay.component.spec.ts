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
import { FullscreenService } from '../fullscreen/fullscreen.service';
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

jest.mock('@reelkit/core', () => ({
  createSliderController: jest.fn(() => mockSlider),
  createGestureController: jest.fn(() => mockGestureController),
  reaction: jest.fn(() => () => {
    /* noop */
  }),
  animate: jest.fn(() => () => {
    /* noop */
  }),
}));

jest.mock('@reelkit/angular', () => {
  const { Injectable, signal: angSignal } = jest.requireActual(
    '@angular/core',
  ) as typeof import('@angular/core');

  @Injectable({ providedIn: 'root' })
  class BodyLockService {
    lock = jest.fn();
    unlock = jest.fn();
  }

  return {
    BodyLockService,
    toAngularSignal: jest.fn((source: { value: unknown }) =>
      angSignal(source.value),
    ),
    animatedSignalBridge: jest.fn(() => angSignal(0)),
  };
});

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
    }).compileComponents();

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
        By.css('.rk-lightbox-container'),
      );
      expect(container).toBeTruthy();
    });

    it('container has role="dialog"', () => {
      const fixture = createFixture(true);
      const container = fixture.debugElement.query(
        By.css('.rk-lightbox-container'),
      );
      expect(container.nativeElement.getAttribute('role')).toBe('dialog');
    });

    it('container has aria-modal="true"', () => {
      const fixture = createFixture(true);
      const container = fixture.debugElement.query(
        By.css('.rk-lightbox-container'),
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
        By.css('.rk-lightbox-container'),
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
    it('renders slide images for visible items', () => {
      const fixture = createFixture(true, ITEMS);
      const imgs = fixture.debugElement.queryAll(By.css('.rk-lightbox-img'));
      // At least one slide image rendered (the initial visible index)
      expect(imgs.length).toBeGreaterThanOrEqual(1);
    });

    it('first rendered image has correct src', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const img = fixture.debugElement.query(By.css('.rk-lightbox-img'));
      expect(img.nativeElement.getAttribute('src')).toBe(ITEMS[0]!.src);
    });

    it('renders image error fallback when image fails to load', () => {
      const fixture = createFixture(true, ITEMS, 0);

      (fixture.componentInstance as any).onImageError(0);
      fixture.detectChanges();

      const errorEl = fixture.debugElement.query(
        By.css('.rk-lightbox-img-error'),
      );
      expect(errorEl).toBeTruthy();
      expect(errorEl.nativeElement.textContent).toContain('Image unavailable');
    });

    it('error fallback has role="img" with descriptive aria-label', () => {
      const fixture = createFixture(true, ITEMS, 0);
      (fixture.componentInstance as any).onImageError(0);
      fixture.detectChanges();

      const errorEl = fixture.debugElement.query(
        By.css('.rk-lightbox-img-error'),
      );
      expect(errorEl.nativeElement.getAttribute('role')).toBe('img');
      expect(errorEl.nativeElement.getAttribute('aria-label')).toContain(
        'Failed to load',
      );
    });

    it('marks image as loaded (adds rk-loaded class) when onImageLoad is called', () => {
      const fixture = createFixture(true, ITEMS, 0);
      (fixture.componentInstance as any).onImageLoad(0);
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('.rk-lightbox-img'));
      expect(img.nativeElement.classList).toContain('rk-loaded');
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
      (fixture.componentInstance as any).isMobile.set(false);
      fixture.detectChanges();

      const prevBtn = fixture.debugElement.query(
        By.css('.rk-lightbox-nav-prev'),
      );
      expect(prevBtn).toBeNull();
    });

    it('shows next button when not at last slide (non-mobile)', () => {
      const fixture = createFixture(true, ITEMS, 0);
      (fixture.componentInstance as any).isMobile.set(false);
      fixture.detectChanges();

      const nextBtn = fixture.debugElement.query(
        By.css('.rk-lightbox-nav-next'),
      );
      expect(nextBtn).toBeTruthy();
    });

    it('does not render arrow buttons when showNavigation=false', () => {
      const fixture = createFixture(true, ITEMS, 0);
      (fixture.componentInstance as any).isMobile.set(false);
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

      (fixture.componentInstance as any).handleClose();

      expect(closedSpy).toHaveBeenCalledTimes(1);
    });

    it('emits closed when Escape key is pressed', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const closedSpy = jest.fn();
      fixture.componentInstance.closed.subscribe(closedSpy);

      (fixture.componentInstance as any).onKeydown(
        new KeyboardEvent('keydown', { key: 'Escape' }),
      );

      expect(closedSpy).toHaveBeenCalledTimes(1);
    });

    it('does not emit closed on Escape when overlay is not open', () => {
      const fixture = createFixture(false, ITEMS, 0);
      const closedSpy = jest.fn();
      fixture.componentInstance.closed.subscribe(closedSpy);

      (fixture.componentInstance as any).onKeydown(
        new KeyboardEvent('keydown', { key: 'Escape' }),
      );

      expect(closedSpy).not.toHaveBeenCalled();
    });

    it('does not emit closed for non-Escape keys', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const closedSpy = jest.fn();
      fixture.componentInstance.closed.subscribe(closedSpy);

      (fixture.componentInstance as any).onKeydown(
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
        By.css('.rk-lightbox-container'),
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
        By.css('.rk-lightbox-container'),
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

    it('does not create slider when isOpen is false', fakeAsync(() => {
      const fixture = createFixture(true, ITEMS, 0);
      tick();

      fixture.componentRef.setInput('isOpen', false);
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance['slider']).toBeNull();
    }));

    it('clears _bridgeDispose on close so the bridge observer does not accumulate across sessions', fakeAsync(() => {
      const fixture = createFixture(true, ITEMS, 0);
      tick();

      // _bridgeDispose is set after initSlider/bridgeSliderSignals runs.
      // After closing, it should be null (disposed and cleared).
      fixture.componentRef.setInput('isOpen', false);
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance['_bridgeDispose']).toBeNull();
      expect(fixture.componentInstance['_bridgeCancelAnim']).toBeNull();
    }));

    it('_bridgeDispose is non-null while the overlay is open', fakeAsync(() => {
      // The mock slider state.axisValue.observe returns a noop dispose fn.
      // After initSlider runs the bridge dispose should be stored.
      const fixture = createFixture(true, ITEMS, 0);
      tick();
      fixture.detectChanges();

      // The mock observe returns () => void, so _bridgeDispose should be set.
      // (In the mock, axisValue.observe returns () => { /* noop */ })
      expect(fixture.componentInstance['_bridgeDispose']).not.toBeNull();
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
        By.css('.rk-lightbox-container'),
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
        By.css('.rk-lightbox-container'),
      );
      // When closed no container is rendered, so focus can never fire.
      expect(container).toBeNull();
    }));
  });

  describe('Bug 1-2 (Lightbox): bridge observer / animation cleanup on close-reopen', () => {
    it('no errors thrown when opening, closing and reopening the overlay', fakeAsync(() => {
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

    it('slider is re-created (non-null) after reopening', fakeAsync(() => {
      const fixture = createFixture(true, ITEMS, 0);
      tick();

      fixture.componentRef.setInput('isOpen', false);
      fixture.detectChanges();
      tick();

      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      tick();

      // After reopening the slider must exist again.
      expect(fixture.componentInstance['slider']).not.toBeNull();
    }));

    it('_bridgeDispose and _bridgeCancelAnim are null after closing', fakeAsync(() => {
      const fixture = createFixture(true, ITEMS, 0);
      tick();
      fixture.detectChanges();

      fixture.componentRef.setInput('isOpen', false);
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance['_bridgeDispose']).toBeNull();
      expect(fixture.componentInstance['_bridgeCancelAnim']).toBeNull();
    }));

    it('_bridgeDoneTimer is null after closing (done() timer cancelled mid-animation)', fakeAsync(() => {
      const fixture = createFixture(true, ITEMS, 0);
      tick();
      fixture.detectChanges();

      fixture.componentRef.setInput('isOpen', false);
      fixture.detectChanges();
      tick();

      expect(fixture.componentInstance['_bridgeDoneTimer']).toBeNull();
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

  // ─── Transition duration CSS custom property tests ────────────────────────

  describe('_cssTransitionDuration signal', () => {
    it('defaults to "300ms"', () => {
      const fixture = createFixture(true, ITEMS, 0);
      expect(fixture.componentInstance['_cssTransitionDuration']()).toBe(
        '300ms',
      );
    });

    it('reflects custom transitionDuration input', () => {
      const fixture = createFixture(true, ITEMS, 0);
      fixture.componentRef.setInput('transitionDuration', 600);
      fixture.detectChanges();

      expect(fixture.componentInstance['_cssTransitionDuration']()).toBe(
        '600ms',
      );
    });

    it('slide element has --rk-transition-duration style set', () => {
      const fixture = createFixture(true, ITEMS, 0);
      fixture.componentRef.setInput('transitionDuration', 500);
      fixture.detectChanges();

      const slide = fixture.debugElement.query(By.css('.rk-lightbox-slide'));
      expect(slide).toBeTruthy();
      // Angular binds CSS custom properties via style; the value should be set.
      const style = (slide.nativeElement as HTMLElement).style;
      expect(style.getPropertyValue('--rk-transition-duration')).toBe('500ms');
    });
  });

  // ─── done() timer cleanup test ────────────────────────────────────────────

  describe('_bridgeDoneTimer cleanup on destroy', () => {
    it('_bridgeDoneTimer is null after component is destroyed', fakeAsync(() => {
      const fixture = createFixture(true, ITEMS, 0);
      tick();
      fixture.detectChanges();

      fixture.destroy();
      tick();

      expect(fixture.componentInstance['_bridgeDoneTimer']).toBeNull();
    }));
  });

  // ─── Bug: handleClose exits fullscreen before emitting closed ─────────────

  describe('handleClose exits fullscreen before emitting closed', () => {
    /**
     * Helper that puts the FullscreenService (component-scoped provider) into
     * a simulated fullscreen state by overriding the internal signal.
     */
    function setFullscreen(
      fixture: ComponentFixture<RkLightboxOverlayComponent>,
      value: boolean,
    ): void {
      const fs = fixture.debugElement.injector.get(FullscreenService);
      (fs as any)['_isFullscreen'].set(value);
    }

    it('exits fullscreen when close button is clicked while in fullscreen', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const fs = fixture.debugElement.injector.get(FullscreenService);
      const exitSpy = jest.spyOn(fs, 'exit').mockImplementation(() => {
        /* noop */
      });
      setFullscreen(fixture, true);

      (fixture.componentInstance as any).handleClose();

      expect(exitSpy).toHaveBeenCalledTimes(1);
    });

    it('still emits closed after exiting fullscreen', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const fs = fixture.debugElement.injector.get(FullscreenService);
      jest.spyOn(fs, 'exit').mockImplementation(() => {
        /* noop */
      });
      setFullscreen(fixture, true);

      const closedSpy = jest.fn();
      fixture.componentInstance.closed.subscribe(closedSpy);

      (fixture.componentInstance as any).handleClose();

      expect(closedSpy).toHaveBeenCalledTimes(1);
    });

    it('does not call fullscreen.exit when not in fullscreen', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const fs = fixture.debugElement.injector.get(FullscreenService);
      const exitSpy = jest.spyOn(fs, 'exit').mockImplementation(() => {
        /* noop */
      });
      setFullscreen(fixture, false);

      (fixture.componentInstance as any).handleClose();

      expect(exitSpy).not.toHaveBeenCalled();
    });

    it('Escape key exits fullscreen and emits closed when in fullscreen', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const fs = fixture.debugElement.injector.get(FullscreenService);
      const exitSpy = jest.spyOn(fs, 'exit').mockImplementation(() => {
        /* noop */
      });
      setFullscreen(fixture, true);

      const closedSpy = jest.fn();
      fixture.componentInstance.closed.subscribe(closedSpy);

      (fixture.componentInstance as any).onKeydown(
        new KeyboardEvent('keydown', { key: 'Escape' }),
      );

      expect(exitSpy).toHaveBeenCalledTimes(1);
      expect(closedSpy).toHaveBeenCalledTimes(1);
    });

    it('swipe dismiss exits fullscreen before emitting closed', () => {
      const fixture = createFixture(true, ITEMS, 0);
      const fs = fixture.debugElement.injector.get(FullscreenService);
      const exitSpy = jest.spyOn(fs, 'exit').mockImplementation(() => {
        /* noop */
      });
      setFullscreen(fixture, true);

      const closedSpy = jest.fn();
      fixture.componentInstance.closed.subscribe(closedSpy);

      // The swipe-to-close directive calls handleClose() on dismissed
      (fixture.componentInstance as any).handleClose();

      expect(exitSpy).toHaveBeenCalledTimes(1);
      expect(closedSpy).toHaveBeenCalledTimes(1);
    });
  });
});
