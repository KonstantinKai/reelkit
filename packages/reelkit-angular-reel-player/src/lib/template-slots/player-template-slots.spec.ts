import { Component, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  RkPlayerSlideDirective,
  RkPlayerSlideOverlayDirective,
  RkPlayerControlsDirective,
  RkPlayerNavigationDirective,
  RkPlayerNestedSlideDirective,
  RkPlayerNestedNavigationDirective,
  PLAYER_TEMPLATE_SLOT_DIRECTIVES,
} from './player-template-slots';
import type {
  PlayerControlsContext,
  PlayerNavigationContext,
  PlayerNestedSlideContext,
  PlayerNestedNavigationContext,
  PlayerSoundState,
  ContentItem,
} from '../types';

// ---------------------------------------------------------------------------
// Host components: one per directive, expose directive via viewChild
// ---------------------------------------------------------------------------

@Component({
  standalone: true,
  imports: [RkPlayerSlideDirective],
  template: `<ng-template rkPlayerSlide></ng-template>`,
})
class SlideHost {
  readonly dir = viewChild(RkPlayerSlideDirective);
}

@Component({
  standalone: true,
  imports: [RkPlayerSlideOverlayDirective],
  template: `<ng-template rkPlayerSlideOverlay></ng-template>`,
})
class SlideOverlayHost {
  readonly dir = viewChild(RkPlayerSlideOverlayDirective);
}

@Component({
  standalone: true,
  imports: [RkPlayerControlsDirective],
  template: `<ng-template rkPlayerControls></ng-template>`,
})
class ControlsHost {
  readonly dir = viewChild(RkPlayerControlsDirective);
}

@Component({
  standalone: true,
  imports: [RkPlayerNavigationDirective],
  template: `<ng-template rkPlayerNavigation></ng-template>`,
})
class NavigationHost {
  readonly dir = viewChild(RkPlayerNavigationDirective);
}

@Component({
  standalone: true,
  imports: [RkPlayerNestedSlideDirective],
  template: `<ng-template rkPlayerNestedSlide></ng-template>`,
})
class NestedSlideHost {
  readonly dir = viewChild(RkPlayerNestedSlideDirective);
}

@Component({
  standalone: true,
  imports: [RkPlayerNestedNavigationDirective],
  template: `<ng-template rkPlayerNestedNavigation></ng-template>`,
})
class NestedNavigationHost {
  readonly dir = viewChild(RkPlayerNestedNavigationDirective);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getDirectiveFromHost<T>(
  fixture: ComponentFixture<{ dir: () => T | undefined }>,
): T {
  // viewChild signal returns the directive instance or undefined
  const dir = (fixture.componentInstance as { dir: () => T | undefined }).dir();
  if (dir === undefined) {
    throw new Error(
      'Directive not found via viewChild query. Did you forget to call detectChanges()?',
    );
  }
  return dir;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Player template slot directives', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SlideHost,
        SlideOverlayHost,
        ControlsHost,
        NavigationHost,
        NestedSlideHost,
        NestedNavigationHost,
      ],
    });
  });

  // ---------------------------------------------------------------------------
  // RkPlayerSlideDirective
  // ---------------------------------------------------------------------------
  describe('RkPlayerSlideDirective', () => {
    let fixture: ComponentFixture<SlideHost>;

    beforeEach(() => {
      fixture = TestBed.createComponent(SlideHost);
      fixture.detectChanges();
    });

    it('creates the directive', () => {
      const dir = getDirectiveFromHost(fixture);
      expect(dir).toBeTruthy();
    });

    it('injects and exposes a TemplateRef', () => {
      const dir = getDirectiveFromHost(fixture);
      expect(dir.templateRef).toBeInstanceOf(TemplateRef);
    });

    it('ngTemplateContextGuard returns true for any context', () => {
      const result = RkPlayerSlideDirective.ngTemplateContextGuard(
        {} as RkPlayerSlideDirective,
        {},
      );
      expect(result).toBe(true);
    });

    it('ngTemplateContextGuard narrows type (context treated as PlayerSlideContext)', () => {
      const noop = (): void => {
        /* noop */
      };
      const ctx: unknown = {
        $implicit: { id: 'x', media: [] } as ContentItem,
        index: 0,
        size: [375, 812] as [number, number],
        isActive: true,
        slideKey: 'x',
        onReady: noop,
        onWaiting: noop,
        onError: noop,
      };
      const result = RkPlayerSlideDirective.ngTemplateContextGuard(
        {} as RkPlayerSlideDirective,
        ctx,
      );
      expect(result).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // RkPlayerSlideOverlayDirective
  // ---------------------------------------------------------------------------
  describe('RkPlayerSlideOverlayDirective', () => {
    let fixture: ComponentFixture<SlideOverlayHost>;

    beforeEach(() => {
      fixture = TestBed.createComponent(SlideOverlayHost);
      fixture.detectChanges();
    });

    it('creates the directive', () => {
      const dir = getDirectiveFromHost(fixture);
      expect(dir).toBeTruthy();
    });

    it('injects and exposes a TemplateRef', () => {
      const dir = getDirectiveFromHost(fixture);
      expect(dir.templateRef).toBeInstanceOf(TemplateRef);
    });

    it('ngTemplateContextGuard returns true', () => {
      const result = RkPlayerSlideOverlayDirective.ngTemplateContextGuard(
        {} as RkPlayerSlideOverlayDirective,
        {},
      );
      expect(result).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // RkPlayerControlsDirective
  // ---------------------------------------------------------------------------
  describe('RkPlayerControlsDirective', () => {
    let fixture: ComponentFixture<ControlsHost>;

    beforeEach(() => {
      fixture = TestBed.createComponent(ControlsHost);
      fixture.detectChanges();
    });

    it('creates the directive', () => {
      const dir = getDirectiveFromHost(fixture);
      expect(dir).toBeTruthy();
    });

    it('injects and exposes a TemplateRef', () => {
      const dir = getDirectiveFromHost(fixture);
      expect(dir.templateRef).toBeInstanceOf(TemplateRef);
    });

    it('ngTemplateContextGuard returns true', () => {
      const result = RkPlayerControlsDirective.ngTemplateContextGuard(
        {} as RkPlayerControlsDirective,
        {},
      );
      expect(result).toBe(true);
    });

    it('ngTemplateContextGuard narrows to PlayerControlsContext', () => {
      const soundState: PlayerSoundState = {
        muted: () => false,
        disabled: () => false,
        toggle: () => {
          /* noop */
        },
      };
      const ctx: unknown = {
        $implicit: () => {
          /* noop */
        },
        item: { id: 'x', media: [] },
        activeIndex: 0,
        content: [],
        soundState,
        onClose: () => {
          /* noop */
        },
      } satisfies PlayerControlsContext;
      expect(
        RkPlayerControlsDirective.ngTemplateContextGuard(
          {} as RkPlayerControlsDirective,
          ctx,
        ),
      ).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // RkPlayerNavigationDirective
  // ---------------------------------------------------------------------------
  describe('RkPlayerNavigationDirective', () => {
    let fixture: ComponentFixture<NavigationHost>;

    beforeEach(() => {
      fixture = TestBed.createComponent(NavigationHost);
      fixture.detectChanges();
    });

    it('creates the directive', () => {
      const dir = getDirectiveFromHost(fixture);
      expect(dir).toBeTruthy();
    });

    it('injects and exposes a TemplateRef', () => {
      const dir = getDirectiveFromHost(fixture);
      expect(dir.templateRef).toBeInstanceOf(TemplateRef);
    });

    it('ngTemplateContextGuard returns true', () => {
      const result = RkPlayerNavigationDirective.ngTemplateContextGuard(
        {} as RkPlayerNavigationDirective,
        {},
      );
      expect(result).toBe(true);
    });

    it('ngTemplateContextGuard narrows to PlayerNavigationContext', () => {
      const noop = () => {
        /* noop */
      };
      const ctx: unknown = {
        $implicit: noop,
        item: { id: 'x', media: [] },
        onPrev: noop,
        onNext: noop,
        activeIndex: 1,
        count: 5,
      } satisfies PlayerNavigationContext;
      expect(
        RkPlayerNavigationDirective.ngTemplateContextGuard(
          {} as RkPlayerNavigationDirective,
          ctx,
        ),
      ).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // RkPlayerNestedSlideDirective
  // ---------------------------------------------------------------------------
  describe('RkPlayerNestedSlideDirective', () => {
    let fixture: ComponentFixture<NestedSlideHost>;

    beforeEach(() => {
      fixture = TestBed.createComponent(NestedSlideHost);
      fixture.detectChanges();
    });

    it('creates the directive', () => {
      const dir = getDirectiveFromHost(fixture);
      expect(dir).toBeTruthy();
    });

    it('injects and exposes a TemplateRef', () => {
      const dir = getDirectiveFromHost(fixture);
      expect(dir.templateRef).toBeInstanceOf(TemplateRef);
    });

    it('ngTemplateContextGuard returns true', () => {
      const result = RkPlayerNestedSlideDirective.ngTemplateContextGuard(
        {} as RkPlayerNestedSlideDirective,
        {},
      );
      expect(result).toBe(true);
    });

    it('ngTemplateContextGuard narrows to PlayerNestedSlideContext', () => {
      const ctx: unknown = {
        $implicit: {
          id: 'm1',
          type: 'image',
          src: 'https://example.com/img.jpg',
          aspectRatio: 1,
        },
        index: 0,
        size: [375, 812] as [number, number],
        isActive: true,
        isInnerActive: true,
        slideKey: 'slide:m1',
      } satisfies PlayerNestedSlideContext;
      expect(
        RkPlayerNestedSlideDirective.ngTemplateContextGuard(
          {} as RkPlayerNestedSlideDirective,
          ctx,
        ),
      ).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // RkPlayerNestedNavigationDirective
  // ---------------------------------------------------------------------------
  describe('RkPlayerNestedNavigationDirective', () => {
    let fixture: ComponentFixture<NestedNavigationHost>;

    beforeEach(() => {
      fixture = TestBed.createComponent(NestedNavigationHost);
      fixture.detectChanges();
    });

    it('creates the directive', () => {
      const dir = getDirectiveFromHost(fixture);
      expect(dir).toBeTruthy();
    });

    it('injects and exposes a TemplateRef', () => {
      const dir = getDirectiveFromHost(fixture);
      expect(dir.templateRef).toBeInstanceOf(TemplateRef);
    });

    it('ngTemplateContextGuard returns true', () => {
      const result = RkPlayerNestedNavigationDirective.ngTemplateContextGuard(
        {} as RkPlayerNestedNavigationDirective,
        {},
      );
      expect(result).toBe(true);
    });

    it('ngTemplateContextGuard narrows to PlayerNestedNavigationContext', () => {
      const noop = () => {
        /* noop */
      };
      const ctx: unknown = {
        $implicit: noop,
        media: { id: 'm1', type: 'image', src: 'img.jpg', aspectRatio: 1 },
        onPrev: noop,
        onNext: noop,
        activeIndex: 0,
        count: 3,
      } satisfies PlayerNestedNavigationContext;
      expect(
        RkPlayerNestedNavigationDirective.ngTemplateContextGuard(
          {} as RkPlayerNestedNavigationDirective,
          ctx,
        ),
      ).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // PLAYER_TEMPLATE_SLOT_DIRECTIVES barrel
  // ---------------------------------------------------------------------------
  describe('PLAYER_TEMPLATE_SLOT_DIRECTIVES', () => {
    it('exports all 7 slot directives', () => {
      expect(PLAYER_TEMPLATE_SLOT_DIRECTIVES).toHaveLength(7);
    });

    it('contains RkPlayerSlideDirective', () => {
      expect(PLAYER_TEMPLATE_SLOT_DIRECTIVES).toContain(RkPlayerSlideDirective);
    });

    it('contains RkPlayerSlideOverlayDirective', () => {
      expect(PLAYER_TEMPLATE_SLOT_DIRECTIVES).toContain(
        RkPlayerSlideOverlayDirective,
      );
    });

    it('contains RkPlayerControlsDirective', () => {
      expect(PLAYER_TEMPLATE_SLOT_DIRECTIVES).toContain(
        RkPlayerControlsDirective,
      );
    });

    it('contains RkPlayerNavigationDirective', () => {
      expect(PLAYER_TEMPLATE_SLOT_DIRECTIVES).toContain(
        RkPlayerNavigationDirective,
      );
    });

    it('contains RkPlayerNestedSlideDirective', () => {
      expect(PLAYER_TEMPLATE_SLOT_DIRECTIVES).toContain(
        RkPlayerNestedSlideDirective,
      );
    });

    it('contains RkPlayerNestedNavigationDirective', () => {
      expect(PLAYER_TEMPLATE_SLOT_DIRECTIVES).toContain(
        RkPlayerNestedNavigationDirective,
      );
    });
  });
});
