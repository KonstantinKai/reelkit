import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoundStateService, createSignal } from '@reelkit/angular';
import {
  RkVideoStorySlideComponent,
  sharedStoryVideo,
} from './video-story-slide.component';

function createSlide(): ComponentFixture<RkVideoStorySlideComponent> {
  const fixture = TestBed.createComponent(RkVideoStorySlideComponent);
  fixture.componentRef.setInput('src', '/story.mp4');
  fixture.componentRef.setInput('groupIndex', 0);
  fixture.componentRef.setInput('storyIndex', 0);
  fixture.componentRef.setInput('activeGroupIndex', createSignal(0));
  fixture.componentRef.setInput('activeStoryIndex', createSignal(0));
  fixture.detectChanges();
  return fixture;
}

describe('RkVideoStorySlideComponent', () => {
  beforeEach(() => {
    jest.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {
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
  });

  // The timer starts on media ready the way the react and vue slides decide
  // it: a video that reports playing, or enough data to play through, is
  // ready even when no `canplay` came first.
  it.each(['canplay', 'playing', 'canplaythrough'])(
    'reports playback started on %s',
    (event) => {
      const fixture = createSlide();
      let started = 0;
      fixture.componentInstance.playbackStarted.subscribe(() => started++);

      sharedStoryVideo().dispatchEvent(new Event(event));

      expect(started).toBeGreaterThan(0);
    },
  );
});
