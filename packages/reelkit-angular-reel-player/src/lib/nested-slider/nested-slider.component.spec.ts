import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RkNestedSliderComponent } from './nested-slider.component';
import { SoundStateService } from '../sound-state/sound-state.service';
import type { MediaItem } from '../types';
import type { ReelApi } from '@reelkit/angular';

jest.mock('@reelkit/core', () => ({
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
}));

jest.mock('@reelkit/angular', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const core = require('@angular/core');
  const { Component, Directive, EventEmitter, Input, Output } =
    core as typeof import('@angular/core');

  @Component({
    selector: 'rk-reel',
    template: '<ng-content/>',
    standalone: true,
  })
  class ReelComponent {
    @Input() count = 0;
    @Input() size: [number, number] = [0, 0];
    @Input() direction = 'horizontal';
    @Input() loop = false;
    @Input() useNavKeys = false;
    @Input() enableWheel = false;
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
    @Input() direction = 'horizontal';
    @Input() visible = 5;
    @Input() radius = 3;
    @Input() gap = 4;
    @Input() activeColor = '#fff';
    @Input() inactiveColor = 'rgba(255,255,255,0.4)';
    @Output() dotClick = new EventEmitter<number>();
  }

  @Directive({ selector: '[rkReelItem]', standalone: true })
  class RkReelItemDirective {
    static ngTemplateContextGuard(_d: unknown, _ctx: unknown): boolean {
      return true;
    }
  }

  class BodyLockService {
    lock = jest.fn();
    unlock = jest.fn();
  }

  return {
    ReelComponent,
    ReelIndicatorComponent,
    RkReelItemDirective,
    BodyLockService,
  };
});

function makeMedia(count: number): MediaItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `media-${i}`,
    type: (i % 2 === 0 ? 'image' : 'video') as MediaItem['type'],
    src: `https://example.com/media-${i}.${i % 2 === 0 ? 'jpg' : 'mp4'}`,
    aspectRatio: 0.5625,
  }));
}

function createFixture(
  media: MediaItem[],
  isActive = false,
): ComponentFixture<RkNestedSliderComponent> {
  const fixture = TestBed.createComponent(RkNestedSliderComponent);
  fixture.componentRef.setInput('media', media);
  fixture.componentRef.setInput('slideKey', 'parent-slide');
  fixture.componentRef.setInput('isActive', isActive);
  fixture.detectChanges();
  return fixture;
}

describe('RkNestedSliderComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RkNestedSliderComponent],
      providers: [SoundStateService],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    const fixture = createFixture(makeMedia(2));
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders horizontal rk-reel', () => {
    const fixture = createFixture(makeMedia(2));
    const reel = fixture.debugElement.query(By.css('rk-reel'));
    expect(reel).toBeTruthy();
  });

  it('shows indicator dots when there are multiple media items', () => {
    const fixture = createFixture(makeMedia(3));
    const indicator = fixture.debugElement.query(By.css('rk-reel-indicator'));
    expect(indicator).toBeTruthy();
  });

  it('hides indicator dots when there is only one media item', () => {
    const fixture = createFixture(makeMedia(1));
    const indicator = fixture.debugElement.query(By.css('rk-reel-indicator'));
    expect(indicator).toBeNull();
  });

  it('innerActiveIndex starts at 0', () => {
    const fixture = createFixture(makeMedia(3));
    expect(fixture.componentInstance.innerActiveIndex()).toBe(0);
  });

  it('innerActiveIndex resets to 0 when media input changes (linkedSignal)', () => {
    const fixture = createFixture(makeMedia(3));
    fixture.componentInstance.onAfterChange({ index: 2 });
    fixture.detectChanges();
    expect(fixture.componentInstance.innerActiveIndex()).toBe(2);

    fixture.componentRef.setInput('media', makeMedia(2));
    fixture.detectChanges();
    expect(fixture.componentInstance.innerActiveIndex()).toBe(0);
  });

  it('onAfterChange updates innerActiveIndex', () => {
    const fixture = createFixture(makeMedia(3));
    fixture.componentInstance.onAfterChange({ index: 1 });
    expect(fixture.componentInstance.innerActiveIndex()).toBe(1);
  });

  it('onBeforeChange pauses video element when not paused', () => {
    const fixture = createFixture(makeMedia(2));
    const mockVideoEl = {
      paused: false,
      pause: jest.fn(),
    } as unknown as HTMLVideoElement;
    fixture.componentInstance.onVideoRef(mockVideoEl);
    fixture.componentInstance.onBeforeChange();
    expect(mockVideoEl.pause).toHaveBeenCalled();
  });

  it('onBeforeChange does not pause when video is already paused', () => {
    const fixture = createFixture(makeMedia(2));
    const mockVideoEl = {
      paused: true,
      pause: jest.fn(),
    } as unknown as HTMLVideoElement;
    fixture.componentInstance.onVideoRef(mockVideoEl);
    fixture.componentInstance.onBeforeChange();
    expect(mockVideoEl.pause).not.toHaveBeenCalled();
  });

  it('onBeforeChange does nothing when videoRef is null', () => {
    const fixture = createFixture(makeMedia(2));
    fixture.componentInstance.onVideoRef(null);
    expect(() => fixture.componentInstance.onBeforeChange()).not.toThrow();
  });

  it('shows prev button when not at first slide', () => {
    const fixture = createFixture(makeMedia(3));
    fixture.componentInstance.onAfterChange({ index: 1 });
    fixture.detectChanges();
    const prevBtn = fixture.debugElement.query(By.css('.rk-nested-nav-prev'));
    expect(prevBtn).toBeTruthy();
  });

  it('hides prev button when at first slide (index 0)', () => {
    const fixture = createFixture(makeMedia(3));
    fixture.detectChanges();
    const prevBtn = fixture.debugElement.query(By.css('.rk-nested-nav-prev'));
    expect(prevBtn).toBeNull();
  });

  it('shows next button when not at last slide', () => {
    const fixture = createFixture(makeMedia(3));
    fixture.detectChanges();
    const nextBtn = fixture.debugElement.query(By.css('.rk-nested-nav-next'));
    expect(nextBtn).toBeTruthy();
  });

  it('hides next button when at last slide', () => {
    const fixture = createFixture(makeMedia(3));
    fixture.componentInstance.onAfterChange({ index: 2 });
    fixture.detectChanges();
    const nextBtn = fixture.debugElement.query(By.css('.rk-nested-nav-next'));
    expect(nextBtn).toBeNull();
  });

  it('onInnerApiReady stores api and emits innerApiReady', () => {
    const fixture = createFixture(makeMedia(2));
    const mockApi = {
      prev: jest.fn(),
      next: jest.fn(),
      goTo: jest.fn().mockResolvedValue(undefined),
      unobserve: jest.fn(),
      observe: jest.fn(),
      adjust: jest.fn(),
    } as unknown as ReelApi;
    const emitted: ReelApi[] = [];
    fixture.componentInstance.innerApiReady.subscribe((a) => emitted.push(a));
    fixture.componentInstance.onInnerApiReady(mockApi);
    expect(emitted).toContain(mockApi);
  });

  it('onPrev calls api.prev()', () => {
    const fixture = createFixture(makeMedia(2));
    const mockApi = {
      prev: jest.fn(),
      next: jest.fn(),
      goTo: jest.fn().mockResolvedValue(undefined),
      unobserve: jest.fn(),
      observe: jest.fn(),
      adjust: jest.fn(),
    } as unknown as ReelApi;
    fixture.componentInstance.onInnerApiReady(mockApi);
    fixture.componentInstance.onPrev();
    expect(mockApi.prev).toHaveBeenCalled();
  });

  it('onNext calls api.next()', () => {
    const fixture = createFixture(makeMedia(2));
    const mockApi = {
      prev: jest.fn(),
      next: jest.fn(),
      goTo: jest.fn().mockResolvedValue(undefined),
      unobserve: jest.fn(),
      observe: jest.fn(),
      adjust: jest.fn(),
    } as unknown as ReelApi;
    fixture.componentInstance.onInnerApiReady(mockApi);
    fixture.componentInstance.onNext();
    expect(mockApi.next).toHaveBeenCalled();
  });

  it('onVideoRef(null) clears _videoEl so stale ref is not paused', () => {
    const fixture = createFixture(makeMedia(3));
    const mockVideoEl = {
      paused: false,
      pause: jest.fn(),
    } as unknown as HTMLVideoElement;
    fixture.componentInstance.onVideoRef(mockVideoEl);
    // Simulate cleanup null emission from an inactive slide
    fixture.componentInstance.onVideoRef(null);
    // onBeforeChange should now be a no-op (no pause on stale element)
    fixture.componentInstance.onBeforeChange();
    expect(mockVideoEl.pause).not.toHaveBeenCalled();
  });

  it('mediaAt() returns first item as fallback for out-of-bounds index', () => {
    const fixture = createFixture(makeMedia(2));
    const firstItem = fixture.componentInstance.media()[0];
    expect(fixture.componentInstance.mediaAt(999)).toBe(firstItem);
  });

  // ─── Bug regression: Bug 2 (Player) – stale _videoEl on inner navigation ─

  it('onVideoRef(null) is forwarded as videoRef output even when coming from a non-inner-active slide', () => {
    // The template condition `isInnerActive || !$event` ensures that a null
    // cleanup emission is ALWAYS forwarded so the parent can clear its
    // stale _videoEl reference. This test verifies the forwarding at the
    // component method level.
    const fixture = createFixture(makeMedia(3));
    const comp = fixture.componentInstance;

    const emitted: Array<HTMLVideoElement | null> = [];
    comp.videoRef.subscribe((v) => emitted.push(v));

    const mockVideoEl = {
      paused: false,
      pause: jest.fn(),
    } as unknown as HTMLVideoElement;

    // Set a real video ref first.
    comp.onVideoRef(mockVideoEl);
    expect(emitted).toContain(mockVideoEl);

    // Now emit null (cleanup from a slide that has become non-inner-active).
    comp.onVideoRef(null);

    // The null MUST have been forwarded so the parent clears its stale ref.
    expect(emitted[emitted.length - 1]).toBeNull();
  });

  it('applies container width and height', () => {
    const fixture = createFixture(makeMedia(2));
    fixture.componentRef.setInput('width', 375);
    fixture.componentRef.setInput('height', 812);
    fixture.detectChanges();
    const inner = fixture.debugElement.query(By.css('.rk-nested-slider-inner'));
    expect(inner.nativeElement.style.width).toBe('375px');
    expect(inner.nativeElement.style.height).toBe('812px');
  });

  it('host element has display:block style', () => {
    const fixture = createFixture(makeMedia(2));
    const hostEl: HTMLElement = fixture.nativeElement;
    expect(hostEl.style.display).toBe('block');
  });
});
