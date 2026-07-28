import { Component, TemplateRef, input, output, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { Type } from '@angular/core';
import {
  createOverlayUrlState,
  urlIndexKey,
  urlIndexTwoAxisKey,
  type TwoAxisPosition,
  type UrlAdapter,
  type UrlStateController,
} from '@reelkit/angular';
import { createFakeUrlAdapter } from '@reelkit/core/testing';
import { RkReelPlayerUrlOverlayComponent } from './reel-player-url-overlay.component';
import { RkReelPlayerOverlayComponent } from './reel-player-overlay.component';
import { RkPlayerControlsDirective } from '../template-slots/player-template-slots';
import type { ContentItem } from '../types';

const content: ContentItem[] = [
  {
    id: 'a',
    media: [{ id: 'a1', type: 'image', src: 'a.jpg', aspectRatio: 9 / 16 }],
    author: { name: 'A', avatar: 'av-a.jpg' },
    likes: 1,
    description: 'a',
  },
  {
    id: 'b',
    media: [{ id: 'b1', type: 'image', src: 'b.jpg', aspectRatio: 9 / 16 }],
    author: { name: 'B', avatar: 'av-b.jpg' },
    likes: 2,
    description: 'b',
  },
  {
    id: 'c',
    media: [{ id: 'c1', type: 'image', src: 'c.jpg', aspectRatio: 9 / 16 }],
    author: { name: 'C', avatar: 'av-c.jpg' },
    likes: 3,
    description: 'c',
  },
];

/** Records what the wrapper hands down, so the forwarding is observable. */
@Component({
  selector: 'rk-reel-player-overlay',
  standalone: true,
  template: '',
})
class MockReelPlayerOverlayComponent {
  readonly isOpen = input.required<boolean>();
  readonly content = input.required<ContentItem[]>();
  readonly initialIndex = input<number>(0);
  readonly initialInnerIndex = input<number | undefined>(undefined);
  readonly ariaLabel = input<string>('Video player');
  readonly aspectRatio = input<number | undefined>(undefined);
  readonly transitionDuration = input<number>(300);
  readonly swipeDistanceFactor = input<number>(0.12);
  readonly loop = input<boolean>(false);
  readonly enableNavKeys = input<boolean>(true);
  readonly enableWheel = input<boolean>(true);
  readonly wheelDebounceMs = input<number>(200);
  readonly timeline = input<string>('auto');
  readonly timelineMinDurationSeconds = input<number>(30);
  readonly slideTemplate = input<TemplateRef<unknown> | undefined>();
  readonly slideOverlayTemplate = input<TemplateRef<unknown> | undefined>();
  readonly controlsTemplate = input<TemplateRef<unknown> | undefined>();
  readonly timelineTemplate = input<TemplateRef<unknown> | undefined>();
  readonly navigationTemplate = input<TemplateRef<unknown> | undefined>();
  readonly nestedSlideTemplate = input<TemplateRef<unknown> | undefined>();
  readonly nestedNavTemplate = input<TemplateRef<unknown> | undefined>();
  readonly loadingTemplate = input<TemplateRef<unknown> | undefined>();
  readonly errorTemplate = input<TemplateRef<unknown> | undefined>();
  readonly closed = output<void>();
  readonly slideChange = output<number>();
  readonly innerSlideChange = output<{ outer: number; inner: number }>();
}

@Component({
  standalone: true,
  imports: [RkReelPlayerUrlOverlayComponent],
  template: `
    <rk-reel-player-url-overlay
      [controller]="controller"
      [content]="items()"
      (closed)="closedCount = closedCount + 1"
      (slideChange)="lastSlideChange = $event"
    />
  `,
})
class HostComponent {
  controller!: UrlStateController;
  readonly items = signal(content);
  closedCount = 0;
  lastSlideChange: number | null = null;
}

@Component({
  standalone: true,
  imports: [RkReelPlayerUrlOverlayComponent],
  template: `
    <rk-reel-player-url-overlay [controller]="controller" [content]="items()" />
  `,
})
class TwoAxisHostComponent {
  controller!: UrlStateController<TwoAxisPosition>;
  readonly items = signal(content);
}

@Component({
  standalone: true,
  imports: [RkReelPlayerUrlOverlayComponent, RkPlayerControlsDirective],
  template: `
    <rk-reel-player-url-overlay [controller]="controller" [content]="items()">
      <ng-template rkPlayerControls>custom</ng-template>
    </rk-reel-player-url-overlay>
  `,
})
class SlotHostComponent {
  controller!: UrlStateController;
  readonly items = signal(content);
}

describe('RkReelPlayerUrlOverlayComponent', () => {
  const build = <T extends HostComponent | SlotHostComponent>(
    host: Type<T>,
    adapter: UrlAdapter,
  ): ComponentFixture<T> => {
    TestBed.overrideComponent(RkReelPlayerUrlOverlayComponent, {
      remove: { imports: [RkReelPlayerOverlayComponent] },
      add: { imports: [MockReelPlayerOverlayComponent] },
    });

    const fixture = TestBed.createComponent(host);
    fixture.componentInstance.controller = TestBed.runInInjectionContext(() =>
      createOverlayUrlState({
        param: 'reel',
        adapter,
        ...urlIndexKey(() => content.length),
      }),
    );
    fixture.detectChanges();
    return fixture;
  };

  const inner = (
    fixture: ComponentFixture<unknown>,
  ): MockReelPlayerOverlayComponent =>
    fixture.debugElement.query(By.directive(MockReelPlayerOverlayComponent))
      .componentInstance as MockReelPlayerOverlayComponent;

  it('opens at the index named by the url on first render', () => {
    const fake = createFakeUrlAdapter('?reel=1');
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

    fake.adapter.push('?reel=2');
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

    // Paging costs nothing: one back step still leaves the player. A feedback
    // loop from the re-seeded initialIndex would balloon these counts.
    expect(fake.counts.push).toBe(1);
    expect(fake.adapter.read()).toBe('?reel=2');
  });

  it('emits exactly one slideChange write per page step', () => {
    const fake = createFakeUrlAdapter('?reel=0');
    const fixture = build(HostComponent, fake.adapter);
    const replacesBefore = fake.counts.replace;

    inner(fixture).slideChange.emit(1);
    fixture.detectChanges();

    expect(fake.counts.replace).toBe(replacesBefore + 1);
    expect(fake.counts.push).toBe(0);
    expect(fixture.componentInstance.lastSlideChange).toBe(1);
  });

  it('drops an out-of-range parameter and stays closed', () => {
    const fake = createFakeUrlAdapter('?reel=99');
    const fixture = build(HostComponent, fake.adapter);

    expect(inner(fixture).isOpen()).toBe(false);
    expect(fake.adapter.read()).toBe('');
  });

  it('closes on a back step, clearing the entry it pushed', () => {
    const fake = createFakeUrlAdapter();
    const fixture = build(HostComponent, fake.adapter);

    fake.adapter.push('?reel=2');
    fixture.detectChanges();
    expect(inner(fixture).isOpen()).toBe(true);

    fake.adapter.goBack();
    fixture.detectChanges();

    expect(inner(fixture).isOpen()).toBe(false);
    expect(fake.adapter.read()).toBe('');
  });

  it('clears a link that arrived with the page in place, and re-emits', () => {
    const fake = createFakeUrlAdapter('?reel=1');
    const fixture = build(HostComponent, fake.adapter);

    inner(fixture).closed.emit();
    fixture.detectChanges();

    expect(inner(fixture).isOpen()).toBe(false);
    expect(fake.adapter.read()).toBe('');
    expect(fixture.componentInstance.closedCount).toBe(1);
  });

  it('forwards a projected slot template down as an input', () => {
    const fake = createFakeUrlAdapter('?reel=0');
    const fixture = build(SlotHostComponent, fake.adapter);

    expect(inner(fixture).controlsTemplate()).toBeTruthy();
    // A slot nobody filled arrives as null (the safe-navigation operator), and
    // the inner component's `?? contentChild` fallback still reaches its query.
    expect(inner(fixture).navigationTemplate()).toBeNull();
  });

  it('stops writing to the url once destroyed', () => {
    const fake = createFakeUrlAdapter('?reel=1');
    const fixture = build(HostComponent, fake.adapter);
    const before = fake.counts.replace + fake.counts.push;

    fixture.destroy();
    fake.adapter.push('?reel=2');

    expect(fake.counts.replace + fake.counts.push).toBe(before + 1);
  });

  describe('two-axis', () => {
    // post 2 is a multi-media carousel, so an inner index past 0 is valid.
    const twoAxisContent: ContentItem[] = [
      content[0],
      content[1],
      {
        id: 'c',
        media: [
          { id: 'c1', type: 'image', src: 'c1.jpg', aspectRatio: 9 / 16 },
          { id: 'c2', type: 'image', src: 'c2.jpg', aspectRatio: 9 / 16 },
        ],
        author: { name: 'C', avatar: 'av-c.jpg' },
        likes: 3,
        description: 'c',
      },
    ];

    const buildTwoAxis = (
      adapter: UrlAdapter,
    ): ComponentFixture<TwoAxisHostComponent> => {
      TestBed.overrideComponent(RkReelPlayerUrlOverlayComponent, {
        remove: { imports: [RkReelPlayerOverlayComponent] },
        add: { imports: [MockReelPlayerOverlayComponent] },
      });

      const fixture = TestBed.createComponent(TwoAxisHostComponent);
      fixture.componentInstance.items.set(twoAxisContent);
      fixture.componentInstance.controller = TestBed.runInInjectionContext(() =>
        createOverlayUrlState({
          param: 'reel',
          adapter,
          ...urlIndexTwoAxisKey({
            outerCount: () => twoAxisContent.length,
            innerCounts: () => twoAxisContent.map((c) => c.media.length),
          }),
        }),
      );
      fixture.detectChanges();
      return fixture;
    };

    it('opens at a two-axis position, seeding outer and inner together', () => {
      const fake = createFakeUrlAdapter('?reel=2.1');
      const fixture = buildTwoAxis(fake.adapter);

      expect(inner(fixture).isOpen()).toBe(true);
      expect(inner(fixture).initialIndex()).toBe(2);
      expect(inner(fixture).initialInnerIndex()).toBe(1);
    });

    it('treats a bare one-axis param as malformed and stays closed', () => {
      const fake = createFakeUrlAdapter('?reel=3');
      const fixture = buildTwoAxis(fake.adapter);

      expect(inner(fixture).isOpen()).toBe(false);
      expect(fake.adapter.read()).toBe('');
    });

    it('writes both axes strictly dotted on inner navigation', () => {
      const fake = createFakeUrlAdapter('?reel=2.0');
      const fixture = buildTwoAxis(fake.adapter);

      inner(fixture).innerSlideChange.emit({ outer: 2, inner: 1 });
      fixture.detectChanges();

      expect(fake.adapter.read()).toBe('?reel=2.1');
    });

    it('defers the outer-nav write to the inner report so it is never bare', () => {
      const fake = createFakeUrlAdapter('?reel=2.0');
      const fixture = buildTwoAxis(fake.adapter);
      const writesBefore = fake.counts.replace + fake.counts.push;

      // Outer nav alone must not write in two-axis mode — that would name a
      // bare outer before the inner index is known.
      inner(fixture).slideChange.emit(1);
      fixture.detectChanges();
      expect(fake.counts.replace + fake.counts.push).toBe(writesBefore);

      // The activated post reports its inner index, and only then the URL moves.
      inner(fixture).innerSlideChange.emit({ outer: 1, inner: 0 });
      fixture.detectChanges();
      expect(fake.adapter.read()).toBe('?reel=1.0');
    });

    it('closes by clearing the parameter', () => {
      const fake = createFakeUrlAdapter('?reel=2.1');
      const fixture = buildTwoAxis(fake.adapter);
      expect(inner(fixture).isOpen()).toBe(true);

      inner(fixture).closed.emit();
      fixture.detectChanges();

      expect(inner(fixture).isOpen()).toBe(false);
      expect(fake.adapter.read()).toBe('');
    });
  });
});
