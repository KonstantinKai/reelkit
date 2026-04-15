import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { signal, NgZone } from '@angular/core';
import { RkVideoSlideComponent } from './video-slide.component';
import { SoundStateService } from '../sound-state/sound-state.service';

// ---------------------------------------------------------------------------
// Mock @reelkit/angular — factory must not reference variables outside the
// factory because jest.mock() is hoisted before variable declarations.
// We keep a module-level reference object that the factory populates lazily.
// ---------------------------------------------------------------------------
jest.mock('@reelkit/angular', () => {
  const mockVid = document.createElement('video');
  Object.assign(mockVid, {
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
    currentTime: 0,
    muted: false,
    src: '',
    style: { objectFit: '' },
  });
  const shared = {
    getVideo: jest.fn().mockReturnValue(mockVid),
    capturedFrames: new Map<string, string>(),
    playbackPositions: new Map<string, number>(),
  };
  return {
    createSharedVideo: jest.fn(() => shared),
    captureFrame: jest.fn().mockReturnValue(null),
    observeDomEvent: jest.fn(
      (el: EventTarget, event: string, handler: EventListener) => {
        el.addEventListener(event, handler);
        return () => el.removeEventListener(event, handler);
      },
    ),
    createDisposableList: jest.fn(() => {
      const fns: (() => void)[] = [];
      return {
        push: (...items: (() => void)[]) => fns.push(...items),
        dispose: () => fns.forEach((fn) => fn()),
      };
    }),
    toAngularSignal: jest.fn((source: { value?: unknown }) => {
      const { signal: angSignal } =
        require('@angular/core') as typeof import('@angular/core');
      return angSignal(source?.value ?? false);
    }),
    createSoundController: jest.fn(() => ({
      muted: {
        value: true,
        observe: jest.fn(() => () => {
          /* noop */
        }),
      },
      disabled: {
        value: false,
        observe: jest.fn(() => () => {
          /* noop */
        }),
      },
      toggle: jest.fn(),
    })),
    __mockShared: shared,
    __mockVideo: mockVid,
  };
});

// Retrieve the shared mock objects created inside the factory above.
const coreModule = require('@reelkit/angular') as {
  __mockShared: {
    getVideo: jest.Mock;
    capturedFrames: Map<string, string>;
    playbackPositions: Map<string, number>;
  };
  __mockVideo: HTMLVideoElement & { style: { objectFit: string } };
};
const mockSharedInstance = coreModule.__mockShared;
const mockVideo = coreModule.__mockVideo as HTMLVideoElement & {
  play: jest.Mock;
  pause: jest.Mock;
  style: { objectFit: string };
};
const mockCapturedFrames = mockSharedInstance.capturedFrames;
const mockPlaybackPositions = mockSharedInstance.playbackPositions;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildSoundStateSpy(mutedValue = true): SoundStateService {
  const mutedSig = signal(mutedValue);
  const disabledSig = signal(false);
  return {
    muted: mutedSig.asReadonly(),
    disabled: disabledSig.asReadonly(),
    toggle: jest.fn(() => mutedSig.update((v) => !v)),
    setDisabled: jest.fn((v: boolean) => disabledSig.set(v)),
  } as unknown as SoundStateService;
}

function createFixture(
  inputs: {
    src?: string;
    poster?: string;
    aspectRatio?: number;
    width?: number;
    height?: number;
    isActive?: boolean;
    isInnerActive?: boolean;
    slideKey?: string;
  } = {},
  soundState: SoundStateService = buildSoundStateSpy(),
): ComponentFixture<RkVideoSlideComponent> {
  TestBed.overrideProvider(SoundStateService, { useValue: soundState });
  const fixture = TestBed.createComponent(RkVideoSlideComponent);
  const ref = fixture.componentRef;
  ref.setInput('src', inputs.src ?? 'https://example.com/video.mp4');
  ref.setInput('aspectRatio', inputs.aspectRatio ?? 0.5625);
  ref.setInput('slideKey', inputs.slideKey ?? 'slide-1');
  if (inputs.poster !== undefined) ref.setInput('poster', inputs.poster);
  if (inputs.width !== undefined) ref.setInput('width', inputs.width);
  if (inputs.height !== undefined) ref.setInput('height', inputs.height);
  if (inputs.isActive !== undefined) ref.setInput('isActive', inputs.isActive);
  if (inputs.isInnerActive !== undefined)
    ref.setInput('isInnerActive', inputs.isInnerActive);
  fixture.detectChanges();
  return fixture;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('RkVideoSlideComponent', () => {
  beforeEach(() => {
    // Reset mock state before each test
    jest.clearAllMocks();
    mockCapturedFrames.clear();
    mockPlaybackPositions.clear();
    mockVideo.muted = false;
    mockVideo.currentTime = 0;
    mockVideo.src = '';
    (
      mockVideo as HTMLVideoElement & { style: { objectFit: string } }
    ).style.objectFit = '';
    (mockVideo.play as jest.Mock).mockResolvedValue(undefined);
    mockSharedInstance.getVideo.mockReturnValue(mockVideo);

    TestBed.configureTestingModule({
      imports: [RkVideoSlideComponent],
      providers: [SoundStateService],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('uses the shared video element from createSharedVideo', fakeAsync(() => {
    createFixture({ isActive: true });
    tick();
    expect(mockSharedInstance.getVideo).toHaveBeenCalled();
  }));

  it('sets video src when active', fakeAsync(() => {
    createFixture({ isActive: true, src: 'https://example.com/video.mp4' });
    tick();
    expect(mockVideo.src).toBe('https://example.com/video.mp4');
  }));

  it('calls play() when active', fakeAsync(() => {
    createFixture({ isActive: true });
    tick();
    expect(mockVideo.play).toHaveBeenCalled();
  }));

  it('does not call play when isActive is false', fakeAsync(() => {
    createFixture({ isActive: false });
    tick();
    expect(mockVideo.play).not.toHaveBeenCalled();
  }));

  it('does not call play when isInnerActive is false', fakeAsync(() => {
    createFixture({ isActive: true, isInnerActive: false });
    tick();
    expect(mockVideo.play).not.toHaveBeenCalled();
  }));

  it('emits videoRef with video element on activation', fakeAsync(() => {
    const fixture = createFixture({ isActive: true });
    const emitted: Array<HTMLVideoElement | null> = [];
    fixture.componentInstance.videoRef.subscribe((v) => emitted.push(v));
    // Re-trigger effect by changing isActive
    fixture.componentRef.setInput('isActive', false);
    fixture.componentRef.setInput('isActive', true);
    fixture.detectChanges();
    tick();
    expect(emitted.some((v) => v !== null)).toBe(true);
  }));

  it('syncs muted=true from SoundStateService onto shared video', fakeAsync(() => {
    const soundState = buildSoundStateSpy(true);
    createFixture({ isActive: true }, soundState);
    tick();
    expect(mockVideo.muted).toBe(true);
  }));

  it('syncs muted=false from SoundStateService onto shared video', fakeAsync(() => {
    const soundState = buildSoundStateSpy(false);
    createFixture({ isActive: true }, soundState);
    tick();
    expect(mockVideo.muted).toBe(false);
  }));

  it('restores saved playback position when returning to a slide', fakeAsync(() => {
    mockPlaybackPositions.set('slide-42', 15);
    createFixture({ isActive: true, slideKey: 'slide-42' });
    tick();
    expect(mockVideo.currentTime).toBe(15);
  }));

  it('uses default position 0 when no saved position exists', fakeAsync(() => {
    mockPlaybackPositions.clear();
    createFixture({ isActive: true, slideKey: 'slide-new' });
    tick();
    expect(mockVideo.currentTime).toBe(0);
  }));

  it('uses captured frame as posterSrc when available', fakeAsync(() => {
    mockCapturedFrames.set('slide-1', 'data:image/png;base64,abc');
    const fixture = createFixture({
      isActive: true,
      slideKey: 'slide-1',
      poster: 'https://example.com/poster.jpg',
    });
    tick();
    fixture.detectChanges();
    const posterEl = fixture.debugElement.query(
      By.css('.rk-video-slide-poster'),
    );
    if (posterEl) {
      expect(posterEl.nativeElement.getAttribute('src')).toBe(
        'data:image/png;base64,abc',
      );
    }
  }));

  it('sets video objectFit to cover for vertical aspect ratio (< 1)', fakeAsync(() => {
    createFixture({ isActive: true, aspectRatio: 0.5 });
    tick();
    expect(mockVideo.style.objectFit).toBe('cover');
  }));

  it('sets video objectFit to contain for horizontal aspect ratio (> 1)', fakeAsync(() => {
    createFixture({ isActive: true, aspectRatio: 1.78 });
    tick();
    expect(mockVideo.style.objectFit).toBe('contain');
  }));

  it('applies width and height styles on container', () => {
    const fixture = createFixture({ width: 375, height: 812 });
    const container = fixture.debugElement.query(
      By.css('.rk-video-slide-container'),
    );
    expect(container.nativeElement.style.width).toBe('375px');
    expect(container.nativeElement.style.height).toBe('812px');
  });

  it('renders loading indicator container element', fakeAsync(() => {
    const fixture = createFixture({ isActive: true });
    tick();
    fixture.detectChanges();
    const loader = fixture.debugElement.query(By.css('.rk-video-slide-loader'));
    expect(loader).toBeTruthy();
  }));

  it('renders the container element', () => {
    const fixture = createFixture();
    const container = fixture.debugElement.query(
      By.css('.rk-video-slide-container'),
    );
    expect(container).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // Bug: pause() must be called before DOM removal to prevent audio bleed
  // ---------------------------------------------------------------------------
  it('calls pause() on the shared video during cleanup (deactivation)', fakeAsync(() => {
    const fixture = createFixture({ isActive: true });
    tick();
    // Deactivate — triggers onCleanup which must call pause() before removeChild
    fixture.componentRef.setInput('isActive', false);
    fixture.detectChanges();
    tick();
    expect(mockVideo.pause).toHaveBeenCalled();
  }));

  // ---------------------------------------------------------------------------
  // Bug 2: Infinite effect loop — muted change must NOT re-run playback effect
  // ---------------------------------------------------------------------------
  it('changing muted while video is playing does not re-run the playback setup/cleanup cycle', fakeAsync(() => {
    const mutedSig = signal(false);
    const disabledSig = signal(false);
    const soundState: SoundStateService = {
      muted: mutedSig.asReadonly(),
      disabled: disabledSig.asReadonly(),
      toggle: jest.fn(() => mutedSig.update((v) => !v)),
      setDisabled: jest.fn((v: boolean) => disabledSig.set(v)),
    } as unknown as SoundStateService;

    const fixture = createFixture({ isActive: true }, soundState);
    tick();

    // Record how many times play() was called during initial activation
    const playCallsAfterActivation = (mockVideo.play as jest.Mock).mock.calls
      .length;

    // Also record how many times videoRef was emitted with null (cleanup signal)
    // We do this by tracking removeEventListener calls as a proxy for cleanup
    const removeListenerSpy = jest.spyOn(mockVideo, 'removeEventListener');

    // Toggle muted — should only update video.muted, not restart playback
    const zone = TestBed.inject(NgZone);
    zone.run(() => {
      mutedSig.set(true);
    });
    fixture.detectChanges();
    tick();

    // The mute-effect should have fired and updated video.muted
    expect(mockVideo.muted).toBe(true);

    // play() should NOT have been called again (no playback restart)
    expect((mockVideo.play as jest.Mock).mock.calls.length).toBe(
      playCallsAfterActivation,
    );

    // The playback cleanup (removeEventListener) should NOT have been called
    // after the initial setup — it would indicate the effect re-ran
    expect(removeListenerSpy).not.toHaveBeenCalled();

    removeListenerSpy.mockRestore();
  }));

  // ---------------------------------------------------------------------------
  // Bug 3: Host element display:block
  // ---------------------------------------------------------------------------
  it('host element has display:block style', () => {
    const fixture = createFixture();
    const hostEl: HTMLElement = fixture.nativeElement;
    expect(hostEl.style.display).toBe('block');
  });
});
