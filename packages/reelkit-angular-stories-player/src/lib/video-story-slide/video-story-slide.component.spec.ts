import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoundStateService, createSignal } from '@reelkit/angular';
import {
  RkVideoStorySlideComponent,
  sharedStoryVideo,
} from './video-story-slide.component';

interface SlideSetup {
  fixture: ComponentFixture<RkVideoStorySlideComponent>;
  container: HTMLElement;
  activeStoryIndex: ReturnType<typeof createSignal<number>>;
}

function createSlide(
  inputs: { storyIndex?: number; poster?: string } = {},
): SlideSetup {
  const activeStoryIndex = createSignal(0);
  const fixture = TestBed.createComponent(RkVideoStorySlideComponent);
  fixture.componentRef.setInput('src', '/story.mp4');
  fixture.componentRef.setInput('groupIndex', 0);
  fixture.componentRef.setInput('storyIndex', inputs.storyIndex ?? 0);
  fixture.componentRef.setInput('activeGroupIndex', createSignal(0));
  fixture.componentRef.setInput('activeStoryIndex', activeStoryIndex);
  if (inputs.poster) fixture.componentRef.setInput('poster', inputs.poster);
  fixture.detectChanges();
  const container = fixture.nativeElement.querySelector(
    '.rk-stories-video',
  ) as HTMLElement;
  return { fixture, container, activeStoryIndex };
}

describe('RkVideoStorySlideComponent', () => {
  let play: jest.SpyInstance;
  let pause: jest.SpyInstance;

  beforeEach(() => {
    play = jest
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);
    pause = jest
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => {
        /* noop */
      });
    TestBed.configureTestingModule({
      imports: [RkVideoStorySlideComponent],
      providers: [SoundStateService],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    jest.restoreAllMocks();
    // Every slide shares one element for the whole run, so a property a case
    // pins on it has to come off again before the next case reads it.
    const video = sharedStoryVideo() as unknown as Record<string, unknown>;
    delete video['duration'];
    delete video['error'];
  });

  it('renders the video container', () => {
    const { container } = createSlide();
    expect(container).toBeTruthy();
  });

  // The timer starts on media ready the way the React and Vue slides decide
  // it: a video that reports playing, or enough data to play through, is
  // ready even when no `canplay` came first.
  it.each(['canplay', 'playing', 'canplaythrough'])(
    'reports playback started on %s',
    (event) => {
      const { fixture } = createSlide();
      let started = 0;
      fixture.componentInstance.playbackStarted.subscribe(() => started++);

      sharedStoryVideo().dispatchEvent(new Event(event));

      expect(started).toBeGreaterThan(0);
    },
  );

  it.each([
    ['waiting', 'buffering'],
    ['ended', 'finished'],
  ] as const)('reports the %s event through %s', (event, output) => {
    const { fixture } = createSlide();
    const handler = jest.fn();
    fixture.componentInstance[output].subscribe(handler);

    sharedStoryVideo().dispatchEvent(new Event(event));

    expect(handler).toHaveBeenCalled();
  });

  it('reports a failure when the video emits an error event', () => {
    const { fixture } = createSlide();
    const failed = jest.fn();
    fixture.componentInstance.failed.subscribe(failed);

    Object.defineProperty(sharedStoryVideo(), 'error', {
      value: { code: 4 },
      configurable: true,
    });
    sharedStoryVideo().dispatchEvent(new Event('error'));

    expect(failed).toHaveBeenCalled();
  });

  it('swallows a play() rejection without reporting a failure', async () => {
    play.mockRejectedValueOnce(new Error('AbortError'));
    const { fixture } = createSlide();
    const failed = jest.fn();
    fixture.componentInstance.failed.subscribe(failed);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(failed).not.toHaveBeenCalled();
  });

  it('reports the duration in milliseconds when metadata loads', () => {
    const { fixture } = createSlide();
    const durationReady = jest.fn();
    fixture.componentInstance.durationReady.subscribe(durationReady);

    Object.defineProperty(sharedStoryVideo(), 'duration', {
      value: 10,
      configurable: true,
    });
    sharedStoryVideo().dispatchEvent(new Event('loadedmetadata'));

    expect(durationReady).toHaveBeenCalledWith(10_000);
  });

  it('moves the shared video into the active slide and out when it deactivates', () => {
    const { container, activeStoryIndex } = createSlide();
    expect(container.contains(sharedStoryVideo())).toBe(true);
    expect(play).toHaveBeenCalled();

    activeStoryIndex.value = 1;

    expect(container.contains(sharedStoryVideo())).toBe(false);
    expect(pause).toHaveBeenCalled();
  });

  it('hands the shared video back and stops listening when it is destroyed', () => {
    const { fixture, container } = createSlide();
    const finished = jest.fn();
    fixture.componentInstance.finished.subscribe(finished);

    fixture.destroy();
    sharedStoryVideo().dispatchEvent(new Event('ended'));

    expect(container.contains(sharedStoryVideo())).toBe(false);
    expect(pause).toHaveBeenCalled();
    expect(finished).not.toHaveBeenCalled();
  });

  it('leaves the shared video alone while another story is active', () => {
    const { container } = createSlide({ storyIndex: 1 });
    expect(container.contains(sharedStoryVideo())).toBe(false);
    expect(play).not.toHaveBeenCalled();
  });

  it('shows the poster until the video plays', () => {
    const { fixture } = createSlide({ poster: '/poster.jpg' });
    const poster = (): HTMLImageElement =>
      fixture.nativeElement.querySelector('.rk-stories-video-poster');
    expect(poster().src).toContain('/poster.jpg');
    expect(
      poster().classList.contains('rk-stories-video-poster--visible'),
    ).toBe(true);

    sharedStoryVideo().dispatchEvent(new Event('playing'));
    fixture.detectChanges();

    expect(
      poster().classList.contains('rk-stories-video-poster--visible'),
    ).toBe(false);
  });
});
