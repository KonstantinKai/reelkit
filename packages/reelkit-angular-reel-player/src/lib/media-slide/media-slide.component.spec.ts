import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RkMediaSlideComponent } from './media-slide.component';
import { SoundStateService } from '../sound-state/sound-state.service';
import type { BaseContentItem } from '../types';

// ---------------------------------------------------------------------------
// Mock @reelkit/angular
// ---------------------------------------------------------------------------
jest.mock('@reelkit/angular', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Component, Directive, EventEmitter, Input, Output } =
    require('@angular/core') as typeof import('@angular/core');

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
    @Input() enableNavKeys = false;
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
    toAngularSignal: jest.fn((source: { value?: unknown }) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { signal: angSignal } =
        require('@angular/core') as typeof import('@angular/core');
      return angSignal(source?.value ?? false);
    }),
    createSoundController: jest.fn(() => ({
      muted: { value: true, observe: jest.fn(() => () => {}) },
      disabled: { value: false, observe: jest.fn(() => () => {}) },
      toggle: jest.fn(),
    })),
  };
});

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
function singleImage(): BaseContentItem {
  return {
    id: 'img-1',
    media: [
      {
        id: 'm1',
        type: 'image',
        src: 'https://example.com/img.jpg',
        aspectRatio: 1,
      },
    ],
  };
}

function singleVideo(): BaseContentItem {
  return {
    id: 'vid-1',
    media: [
      {
        id: 'm1',
        type: 'video',
        src: 'https://example.com/video.mp4',
        aspectRatio: 0.5625,
      },
    ],
  };
}

function multiMedia(): BaseContentItem {
  return {
    id: 'multi-1',
    media: [
      {
        id: 'm1',
        type: 'image',
        src: 'https://example.com/img.jpg',
        aspectRatio: 1,
      },
      {
        id: 'm2',
        type: 'video',
        src: 'https://example.com/video.mp4',
        aspectRatio: 0.5625,
      },
    ],
  };
}

function createFixture(
  content: BaseContentItem,
): ComponentFixture<RkMediaSlideComponent> {
  const fixture = TestBed.createComponent(RkMediaSlideComponent);
  fixture.componentRef.setInput('content', content);
  fixture.detectChanges();
  return fixture;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('RkMediaSlideComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RkMediaSlideComponent],
      providers: [SoundStateService],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders rk-image-slide for single image media', () => {
    const fixture = createFixture(singleImage());
    const imageSlide = fixture.debugElement.query(By.css('rk-image-slide'));
    expect(imageSlide).toBeTruthy();
  });

  it('does not render rk-video-slide for single image media', () => {
    const fixture = createFixture(singleImage());
    const videoSlide = fixture.debugElement.query(By.css('rk-video-slide'));
    expect(videoSlide).toBeNull();
  });

  it('renders rk-video-slide for single video media', () => {
    const fixture = createFixture(singleVideo());
    const videoSlide = fixture.debugElement.query(By.css('rk-video-slide'));
    expect(videoSlide).toBeTruthy();
  });

  it('does not render rk-image-slide for single video media', () => {
    const fixture = createFixture(singleVideo());
    const imageSlide = fixture.debugElement.query(By.css('rk-image-slide'));
    expect(imageSlide).toBeNull();
  });

  it('renders rk-nested-slider for multiple media items', () => {
    const fixture = createFixture(multiMedia());
    const nested = fixture.debugElement.query(By.css('rk-nested-slider'));
    expect(nested).toBeTruthy();
  });

  it('does not render rk-image-slide directly for multiple media items', () => {
    const fixture = createFixture(multiMedia());
    const topLevelImgs = fixture.debugElement.queryAll(
      By.css('rk-image-slide'),
    );
    expect(topLevelImgs.length).toBe(0);
  });

  it('renders empty placeholder div for empty media array', () => {
    const content: BaseContentItem = { id: 'empty-1', media: [] };
    const fixture = createFixture(content);
    const empty = fixture.debugElement.query(By.css('.rk-media-slide-empty'));
    expect(empty).toBeTruthy();
  });

  it('empty placeholder has aria-hidden', () => {
    const content: BaseContentItem = { id: 'empty-1', media: [] };
    const fixture = createFixture(content);
    const empty = fixture.debugElement.query(By.css('.rk-media-slide-empty'));
    expect(empty.nativeElement.getAttribute('aria-hidden')).toBe('true');
  });

  it('passes src to rk-image-slide', () => {
    const fixture = createFixture(singleImage());
    const imageSlide = fixture.debugElement.query(By.css('rk-image-slide'));
    expect(imageSlide.componentInstance.src()).toBe(
      'https://example.com/img.jpg',
    );
  });

  it('passes src to rk-video-slide', () => {
    const fixture = createFixture(singleVideo());
    const videoSlide = fixture.debugElement.query(By.css('rk-video-slide'));
    expect(videoSlide.componentInstance.src()).toBe(
      'https://example.com/video.mp4',
    );
  });

  it('emits videoRef when video-slide emits videoRef', () => {
    const fixture = createFixture(singleVideo());
    const emitted: Array<HTMLVideoElement | null> = [];
    fixture.componentInstance.videoRef.subscribe((v) => emitted.push(v));

    const videoSlide = fixture.debugElement.query(By.css('rk-video-slide'));
    videoSlide.componentInstance.videoRef.emit(null);

    expect(emitted).toContain(null);
  });

  // ---------------------------------------------------------------------------
  // Bug 3: Host element display:block
  // ---------------------------------------------------------------------------
  it('host element has display:block style', () => {
    const fixture = createFixture(singleVideo());
    const hostEl: HTMLElement = fixture.nativeElement;
    expect(hostEl.style.display).toBe('block');
  });
});
