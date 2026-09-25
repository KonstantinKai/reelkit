import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { RkTimelineBarComponent } from './timeline-bar.component';
import { TimelineStateService } from '../timeline-state/timeline-state.service';
import { shared } from '../video-slide/video-slide.component';

// The service pauses and resumes the one video every slide shares, so the
// tests drive that element and describe it the way a loaded video looks.
const stubSharedVideo = (overrides: {
  duration: number;
  currentTime?: number;
  paused?: boolean;
}): HTMLVideoElement => {
  const video = shared.getVideo();
  Object.defineProperty(video, 'duration', {
    configurable: true,
    value: overrides.duration,
  });
  Object.defineProperty(video, 'currentTime', {
    configurable: true,
    writable: true,
    value: overrides.currentTime ?? 0,
  });
  Object.defineProperty(video, 'paused', {
    configurable: true,
    writable: true,
    value: overrides.paused ?? true,
  });
  return video;
};

const pointer = (type: string): Event => {
  const event = new MouseEvent(type, { bubbles: true, clientX: 0 });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  return event;
};

describe('RkTimelineBarComponent', () => {
  let fixture: ComponentFixture<RkTimelineBarComponent>;
  let timeline: TimelineStateService;
  let play: jest.SpyInstance;
  let pause: jest.SpyInstance;

  const track = (): HTMLElement =>
    fixture.nativeElement.querySelector('.rk-reel-timeline-track');

  beforeEach(() => {
    play = jest
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);
    pause = jest
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => undefined);

    TestBed.configureTestingModule({
      imports: [RkTimelineBarComponent],
      providers: [TimelineStateService],
    });
    fixture = TestBed.createComponent(RkTimelineBarComponent);
    timeline = TestBed.inject(TimelineStateService);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    const video = shared.getVideo();
    for (const key of ['duration', 'currentTime', 'paused']) {
      delete (video as unknown as Record<string, unknown>)[key];
    }
    jest.restoreAllMocks();
  });

  it('renders a seek slider with empty values before any video attaches', () => {
    expect(track().getAttribute('role')).toBe('slider');
    expect(track().getAttribute('aria-label')).toBe('Seek');
    expect(track().getAttribute('aria-valuemax')).toBe('0');
    expect(track().getAttribute('aria-valuenow')).toBe('0');
    expect(track().getAttribute('aria-valuetext')).toBe('');
  });

  it('reports duration, position and a readable time once a video attaches', () => {
    timeline.attach(stubSharedVideo({ duration: 100, currentTime: 65 }));
    fixture.detectChanges();

    expect(track().getAttribute('aria-valuemax')).toBe('100');
    expect(track().getAttribute('aria-valuenow')).toBe('65');
    expect(track().getAttribute('aria-valuetext')).toBe('1:05');
  });

  it('fills the track up to the current progress', () => {
    timeline.attach(stubSharedVideo({ duration: 200, currentTime: 50 }));
    fixture.detectChanges();

    const fill: HTMLElement = fixture.nativeElement.querySelector(
      '.rk-reel-timeline-fill',
    );
    const cursor: HTMLElement = fixture.nativeElement.querySelector(
      '.rk-reel-timeline-cursor',
    );
    expect(fill.style.width).toBe('25%');
    expect(cursor.style.left).toBe('25%');
  });

  it('reports a live stream with no end as having no maximum', () => {
    timeline.attach(stubSharedVideo({ duration: Infinity }));
    fixture.detectChanges();

    expect(track().getAttribute('aria-valuemax')).toBe('0');
    expect(track().getAttribute('aria-valuetext')).toBe('');
  });

  it('draws one segment per buffered range', () => {
    timeline.controller.bufferedRanges.value = [
      { start: 0, end: 0.25 },
      { start: 0.5, end: 0.75 },
    ];
    fixture.detectChanges();

    const segments: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.rk-reel-timeline-buffered'),
    );
    expect(segments).toHaveLength(2);
    expect(segments[1].style.left).toBe('50%');
    expect(segments[1].style.width).toBe('25%');
  });

  it('seeks through the service and with the arrow keys', () => {
    const video = stubSharedVideo({ duration: 100, currentTime: 20 });
    timeline.attach(video);

    timeline.seek(40);
    expect(video.currentTime).toBe(40);

    track().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    expect(video.currentTime).toBeGreaterThan(40);
  });

  it('pauses a playing video while scrubbing and resumes it afterwards', () => {
    timeline.attach(stubSharedVideo({ duration: 100, paused: false }));

    track().dispatchEvent(pointer('pointerdown'));
    fixture.detectChanges();
    expect(pause).toHaveBeenCalledTimes(1);
    expect(track().hasAttribute('data-scrubbing')).toBe(true);

    track().dispatchEvent(pointer('pointerup'));
    fixture.detectChanges();
    expect(play).toHaveBeenCalledTimes(1);
    expect(track().hasAttribute('data-scrubbing')).toBe(false);
  });

  it('leaves a paused video paused after scrubbing', () => {
    timeline.attach(stubSharedVideo({ duration: 100, paused: true }));

    track().dispatchEvent(pointer('pointerdown'));
    track().dispatchEvent(pointer('pointerup'));

    expect(pause).not.toHaveBeenCalled();
    expect(play).not.toHaveBeenCalled();
  });

  it('clears everything once the video detaches', () => {
    timeline.attach(stubSharedVideo({ duration: 100, currentTime: 30 }));
    fixture.detectChanges();

    timeline.detach();
    fixture.detectChanges();

    expect(track().getAttribute('aria-valuemax')).toBe('0');
    expect(track().getAttribute('aria-valuenow')).toBe('0');
  });

  it('stops listening for scrubbing once it is destroyed', () => {
    timeline.attach(stubSharedVideo({ duration: 100, paused: false }));
    const element = track();

    fixture.destroy();
    element.dispatchEvent(pointer('pointerdown'));

    expect(pause).not.toHaveBeenCalled();
  });
});
