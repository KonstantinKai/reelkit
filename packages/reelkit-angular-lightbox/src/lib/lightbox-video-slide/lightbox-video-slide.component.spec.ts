import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoundStateService } from '@reelkit/angular';

import {
  RkLightboxVideoSlideComponent,
  setLightboxVideoMuted,
} from './lightbox-video-slide.component';

// Mock @reelkit/angular so the slide talks to a plain <video> we can read,
// while the sound service and the muted-sync helper stay real — they are what
// these cases are about.
jest.mock('@reelkit/angular', () => {
  const video = Object.assign(document.createElement('video'), {
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
  });

  const shared = {
    getVideo: jest.fn(() => video),
    capturedFrames: new Map<string, string>(),
    playbackPositions: new Map<string, number>(),
  };

  const core = jest.requireActual(
    '../../../../reelkit-core/src/index.ts',
  ) as typeof import('@reelkit/core');

  const { SoundStateService } = jest.requireActual(
    '../../../../reelkit-angular/src/lib/sound-state/sound-state.service',
  ) as typeof import('@reelkit/angular');

  return {
    SoundStateService,
    syncMutedToVideo: core.syncMutedToVideo,
    createSharedVideo: jest.fn(() => shared),
    captureFrame: jest.fn(() => null),
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
  };
});

function sharedVideo(): HTMLVideoElement {
  const { createSharedVideo } = jest.requireMock('@reelkit/angular') as {
    createSharedVideo: () => { getVideo: () => HTMLVideoElement };
  };
  return createSharedVideo().getVideo();
}

async function createFixture(
  providers: unknown[] = [],
): Promise<ComponentFixture<RkLightboxVideoSlideComponent>> {
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [RkLightboxVideoSlideComponent],
    providers: providers as never,
  }).compileComponents();

  const fixture = TestBed.createComponent(RkLightboxVideoSlideComponent);
  fixture.componentRef.setInput('src', 'https://example.com/a.mp4');
  fixture.componentRef.setInput('isActive', true);
  fixture.componentRef.setInput('size', [640, 480]);
  fixture.componentRef.setInput('slideKey', 'slide-0');
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('RkLightboxVideoSlideComponent', () => {
  afterEach(() => {
    setLightboxVideoMuted(true);
  });

  it('starts the shared video muted when nothing provides sound state', async () => {
    await createFixture();
    expect(sharedVideo().muted).toBe(true);
  });

  it('follows a provided sound state onto the shared video', async () => {
    const fixture = await createFixture([SoundStateService]);
    const soundState = TestBed.inject(SoundStateService);
    expect(sharedVideo().muted).toBe(true);

    soundState.toggle();

    expect(sharedVideo().muted).toBe(false);
    fixture.destroy();
  });

  it('unmutes the shared video directly when nothing provides sound state', async () => {
    await createFixture();

    setLightboxVideoMuted(false);

    expect(sharedVideo().muted).toBe(false);
  });

  // A toggle must change one property on the element, nothing else. Reading
  // muted inside the activation effect subscribes it, so every toggle tears
  // the slide down and builds it again — the poster flashes back in.
  it('does not restart playback when the muted state changes', async () => {
    const fixture = await createFixture([SoundStateService]);
    const soundState = TestBed.inject(SoundStateService);
    const play = sharedVideo().play as unknown as jest.Mock;
    const playsAfterActivation = play.mock.calls.length;

    soundState.toggle();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(play.mock.calls.length).toBe(playsAfterActivation);
    expect(sharedVideo().muted).toBe(false);
  });

  // Two writers to one element: without this the service still holds `muted`
  // and its next change would revert the consumer's direct write.
  it('carries a direct muted write into the provided sound state', async () => {
    await createFixture([SoundStateService]);
    const soundState = TestBed.inject(SoundStateService);

    setLightboxVideoMuted(false);

    expect(soundState.muted()).toBe(false);
    expect(sharedVideo().muted).toBe(false);
  });
});
