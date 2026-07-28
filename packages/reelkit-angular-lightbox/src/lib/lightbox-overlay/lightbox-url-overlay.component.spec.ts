import { Component, TemplateRef, input, output, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { Type } from '@angular/core';
import {
  createOverlayUrlState,
  urlIndexKey,
  type UrlAdapter,
  type UrlStateController,
} from '@reelkit/angular';
import { RkLightboxUrlOverlayComponent } from './lightbox-url-overlay.component';
import { RkLightboxOverlayComponent } from './lightbox-overlay.component';
import { RkLightboxControlsDirective } from '../template-slots/lightbox-template-slots';
import { createFakeUrlAdapter } from '@reelkit/core/testing';
import type { LightboxItem } from '../types';

/** Records what the wrapper hands down, so the forwarding is observable. */
@Component({
  selector: 'rk-lightbox-overlay',
  standalone: true,
  template: '',
})
class MockLightboxOverlayComponent {
  readonly isOpen = input.required<boolean>();
  readonly items = input.required<LightboxItem[]>();
  readonly initialIndex = input<number>(0);
  readonly transitionFn = input<unknown>(undefined);
  readonly showInfo = input<boolean>(true);
  readonly showControls = input<boolean>(true);
  readonly showNavigation = input<boolean>(true);
  readonly transitionDuration = input<number | undefined>(300);
  readonly swipeDistanceFactor = input<number | undefined>(0.12);
  readonly loop = input<boolean | undefined>(false);
  readonly enableNavKeys = input<boolean | undefined>(true);
  readonly enableWheel = input<boolean | undefined>(true);
  readonly wheelDebounceMs = input<number | undefined>(200);
  readonly swipeToCloseDirection = input<string>('up');
  readonly ariaLabel = input<string>('Image gallery');
  readonly controlsTemplate = input<TemplateRef<unknown> | undefined>();
  readonly navigationTemplate = input<TemplateRef<unknown> | undefined>();
  readonly infoTemplate = input<TemplateRef<unknown> | undefined>();
  readonly slideTemplate = input<TemplateRef<unknown> | undefined>();
  readonly loadingTemplate = input<TemplateRef<unknown> | undefined>();
  readonly errorTemplate = input<TemplateRef<unknown> | undefined>();
  readonly closed = output<void>();
  readonly slideChange = output<number>();
}

const images: LightboxItem[] = [
  { src: 'a.jpg', title: 'A' },
  { src: 'b.jpg', title: 'B' },
  { src: 'c.jpg', title: 'C' },
];

@Component({
  standalone: true,
  imports: [RkLightboxUrlOverlayComponent],
  template: `
    <rk-lightbox-url-overlay
      [controller]="controller"
      [items]="items()"
      (closed)="closedCount = closedCount + 1"
      (slideChange)="lastSlideChange = $event"
    />
  `,
})
class HostComponent {
  controller!: UrlStateController;
  readonly items = signal(images);
  closedCount = 0;
  lastSlideChange: number | null = null;
}

@Component({
  standalone: true,
  imports: [RkLightboxUrlOverlayComponent, RkLightboxControlsDirective],
  template: `
    <rk-lightbox-url-overlay [controller]="controller" [items]="items()">
      <ng-template rkLightboxControls>custom</ng-template>
    </rk-lightbox-url-overlay>
  `,
})
class SlotHostComponent {
  controller!: UrlStateController;
  readonly items = signal(images);
}

describe('RkLightboxUrlOverlayComponent', () => {
  const build = <T extends HostComponent | SlotHostComponent>(
    host: Type<T>,
    adapter: UrlAdapter,
  ): ComponentFixture<T> => {
    TestBed.overrideComponent(RkLightboxUrlOverlayComponent, {
      remove: { imports: [RkLightboxOverlayComponent] },
      add: { imports: [MockLightboxOverlayComponent] },
    });

    const fixture = TestBed.createComponent(host);
    fixture.componentInstance.controller = TestBed.runInInjectionContext(() =>
      createOverlayUrlState({
        param: 'photo',
        adapter,
        ...urlIndexKey(() => images.length),
      }),
    );
    fixture.detectChanges();
    return fixture;
  };

  const inner = (
    fixture: ComponentFixture<unknown>,
  ): MockLightboxOverlayComponent =>
    fixture.debugElement.query(By.directive(MockLightboxOverlayComponent))
      .componentInstance as MockLightboxOverlayComponent;

  it('opens at the index named by the url on first render', () => {
    const fake = createFakeUrlAdapter('?photo=1');
    const fixture = build(HostComponent, fake.adapter);

    expect(inner(fixture).isOpen()).toBe(true);
    expect(inner(fixture).initialIndex()).toBe(1);
  });

  it('stays closed while the parameter is absent', () => {
    const fake = createFakeUrlAdapter('?tab=media');
    const fixture = build(HostComponent, fake.adapter);

    expect(inner(fixture).isOpen()).toBe(false);
  });

  it('opens when the parameter appears while running', () => {
    const fake = createFakeUrlAdapter();
    const fixture = build(HostComponent, fake.adapter);
    expect(inner(fixture).isOpen()).toBe(false);

    fake.adapter.push('?photo=2');
    fixture.detectChanges();

    expect(inner(fixture).isOpen()).toBe(true);
    expect(inner(fixture).initialIndex()).toBe(2);
  });

  it('pushes one history entry on open and replaces on every slide change', () => {
    const fake = createFakeUrlAdapter();
    const fixture = build(HostComponent, fake.adapter);

    fixture.componentInstance.controller.set(0);
    fixture.detectChanges();
    expect(fake.counts.push).toBe(1);

    inner(fixture).slideChange.emit(1);
    inner(fixture).slideChange.emit(2);
    fixture.detectChanges();

    // Paging costs nothing: one back step still leaves the gallery.
    expect(fake.counts.push).toBe(1);
    expect(fake.adapter.read()).toBe('?photo=2');
  });

  it('writes the url and re-emits on slide change', () => {
    const fake = createFakeUrlAdapter('?photo=0');
    const fixture = build(HostComponent, fake.adapter);

    inner(fixture).slideChange.emit(2);
    fixture.detectChanges();

    expect(fake.adapter.read()).toBe('?photo=2');
    expect(fixture.componentInstance.lastSlideChange).toBe(2);
  });

  it('drops an out-of-range parameter and stays closed', () => {
    const fake = createFakeUrlAdapter('?photo=99');
    const fixture = build(HostComponent, fake.adapter);

    // The url may not assert a slide the gallery cannot show, and the
    // component's own clamp must never get the chance to repair it.
    expect(inner(fixture).isOpen()).toBe(false);
    expect(fake.adapter.read()).toBe('');
  });

  it('drops an unparseable parameter and stays closed', () => {
    const fake = createFakeUrlAdapter('?photo=bogus');
    const fixture = build(HostComponent, fake.adapter);

    expect(inner(fixture).isOpen()).toBe(false);
    expect(fake.adapter.read()).toBe('');
  });

  it('closes on a back step, clearing the entry it pushed', () => {
    const fake = createFakeUrlAdapter();
    const fixture = build(HostComponent, fake.adapter);

    fake.adapter.push('?photo=2');
    fixture.detectChanges();
    expect(inner(fixture).isOpen()).toBe(true);

    fake.adapter.goBack();
    fixture.detectChanges();

    expect(inner(fixture).isOpen()).toBe(false);
    expect(fake.adapter.read()).toBe('');
  });

  it('clears a link that arrived with the page in place, and re-emits', () => {
    const fake = createFakeUrlAdapter('?photo=1');
    const fixture = build(HostComponent, fake.adapter);

    inner(fixture).closed.emit();
    fixture.detectChanges();

    // Nothing pushed this entry, so closing drops the parameter where it
    // stands rather than stepping off the site.
    expect(inner(fixture).isOpen()).toBe(false);
    expect(fake.adapter.read()).toBe('');
    expect(fixture.componentInstance.closedCount).toBe(1);
  });

  it('forwards a projected slot template down as an input', () => {
    const fake = createFakeUrlAdapter('?photo=0');
    const fixture = build(SlotHostComponent, fake.adapter);

    expect(inner(fixture).controlsTemplate()).toBeTruthy();
    // A slot nobody filled arrives as null, not undefined — the template safe
    // navigation operator yields null. The inner component joins the two with
    // `??`, so either reaches its own query.
    expect(inner(fixture).navigationTemplate()).toBeNull();
  });

  it('stops writing to the url once destroyed', () => {
    const fake = createFakeUrlAdapter('?photo=1');
    const fixture = build(HostComponent, fake.adapter);
    const before = fake.counts.replace + fake.counts.push;

    fixture.destroy();
    fake.adapter.push('?photo=2');

    expect(fake.counts.replace + fake.counts.push).toBe(before + 1);
  });
});
