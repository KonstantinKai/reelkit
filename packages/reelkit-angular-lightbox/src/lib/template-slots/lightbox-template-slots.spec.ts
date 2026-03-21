import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  RkLightboxControlsDirective,
  RkLightboxInfoDirective,
  RkLightboxNavigationDirective,
  RkLightboxSlideDirective,
} from './lightbox-template-slots';
import type {
  LightboxInfoContext,
  LightboxNavContext,
  LightboxSlideContext,
} from '../types';

/**
 * Host components — one per directive.
 * Each host exposes the directive instance via @ViewChild so tests can assert
 * on it directly without relying on DebugElement traversal of <ng-template>
 * nodes (which are not rendered in the live DOM).
 */
@Component({
  template: `<ng-template rkLightboxControls>controls content</ng-template>`,
  imports: [RkLightboxControlsDirective],
})
class ControlsHostComponent {
  @ViewChild(RkLightboxControlsDirective)
  directive!: RkLightboxControlsDirective;
}

@Component({
  template: `<ng-template rkLightboxNavigation>nav content</ng-template>`,
  imports: [RkLightboxNavigationDirective],
})
class NavigationHostComponent {
  @ViewChild(RkLightboxNavigationDirective)
  directive!: RkLightboxNavigationDirective;
}

@Component({
  template: `<ng-template rkLightboxInfo>info content</ng-template>`,
  imports: [RkLightboxInfoDirective],
})
class InfoHostComponent {
  @ViewChild(RkLightboxInfoDirective)
  directive!: RkLightboxInfoDirective;
}

@Component({
  template: `<ng-template rkLightboxSlide>slide content</ng-template>`,
  imports: [RkLightboxSlideDirective],
})
class SlideHostComponent {
  @ViewChild(RkLightboxSlideDirective)
  directive!: RkLightboxSlideDirective;
}

describe('RkLightboxControlsDirective', () => {
  let fixture: ComponentFixture<ControlsHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlsHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlsHostComponent);
    fixture.detectChanges();
  });

  it('creates the directive', () => {
    expect(fixture.componentInstance.directive).toBeTruthy();
  });

  it('injects TemplateRef and exposes it via templateRef property', () => {
    expect(fixture.componentInstance.directive.templateRef).toBeInstanceOf(
      TemplateRef,
    );
  });

  it('ngTemplateContextGuard returns true for any value', () => {
    const ctx: unknown = {
      $implicit: undefined,
      onClose: () => {
        /* noop */
      },
      currentIndex: 0,
      count: 3,
      isFullscreen: false,
      onToggleFullscreen: () => {
        /* noop */
      },
    };
    expect(
      RkLightboxControlsDirective.ngTemplateContextGuard(
        {} as RkLightboxControlsDirective,
        ctx,
      ),
    ).toBe(true);
  });

  it('ngTemplateContextGuard returns true for null', () => {
    expect(
      RkLightboxControlsDirective.ngTemplateContextGuard(
        {} as RkLightboxControlsDirective,
        null,
      ),
    ).toBe(true);
  });
});

describe('RkLightboxNavigationDirective', () => {
  let fixture: ComponentFixture<NavigationHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationHostComponent);
    fixture.detectChanges();
  });

  it('creates the directive', () => {
    expect(fixture.componentInstance.directive).toBeTruthy();
  });

  it('injects TemplateRef and exposes it via templateRef property', () => {
    expect(fixture.componentInstance.directive.templateRef).toBeInstanceOf(
      TemplateRef,
    );
  });

  it('ngTemplateContextGuard returns true', () => {
    const ctx: unknown = {
      $implicit: undefined,
      onPrev: () => {
        /* noop */
      },
      onNext: () => {
        /* noop */
      },
      activeIndex: 0,
      count: 5,
    } satisfies LightboxNavContext;

    expect(
      RkLightboxNavigationDirective.ngTemplateContextGuard(
        {} as RkLightboxNavigationDirective,
        ctx,
      ),
    ).toBe(true);
  });
});

describe('RkLightboxInfoDirective', () => {
  let fixture: ComponentFixture<InfoHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoHostComponent);
    fixture.detectChanges();
  });

  it('creates the directive', () => {
    expect(fixture.componentInstance.directive).toBeTruthy();
  });

  it('injects TemplateRef and exposes it via templateRef property', () => {
    expect(fixture.componentInstance.directive.templateRef).toBeInstanceOf(
      TemplateRef,
    );
  });

  it('ngTemplateContextGuard returns true', () => {
    const ctx: unknown = {
      $implicit: { src: 'img.jpg' },
      index: 1,
    } satisfies LightboxInfoContext;

    expect(
      RkLightboxInfoDirective.ngTemplateContextGuard(
        {} as RkLightboxInfoDirective,
        ctx,
      ),
    ).toBe(true);
  });
});

describe('RkLightboxSlideDirective', () => {
  let fixture: ComponentFixture<SlideHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlideHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlideHostComponent);
    fixture.detectChanges();
  });

  it('creates the directive', () => {
    expect(fixture.componentInstance.directive).toBeTruthy();
  });

  it('injects TemplateRef and exposes it via templateRef property', () => {
    expect(fixture.componentInstance.directive.templateRef).toBeInstanceOf(
      TemplateRef,
    );
  });

  it('ngTemplateContextGuard returns true', () => {
    const ctx: unknown = {
      $implicit: { src: 'video.mp4', type: 'video' as const },
      index: 0,
      size: [800, 600] as [number, number],
      isActive: true,
    } satisfies LightboxSlideContext;

    expect(
      RkLightboxSlideDirective.ngTemplateContextGuard(
        {} as RkLightboxSlideDirective,
        ctx,
      ),
    ).toBe(true);
  });
});
