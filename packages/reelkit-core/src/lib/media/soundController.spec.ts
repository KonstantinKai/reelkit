import { describe, it, expect, vi } from 'vitest';
import { createSoundController, syncMutedToVideo } from './soundController';

describe('createSoundController', () => {
  it('defaults to muted=true, disabled=false', () => {
    const ctrl = createSoundController();
    expect(ctrl.muted.value).toBe(true);
    expect(ctrl.disabled.value).toBe(false);
  });

  it('accepts custom initial muted state', () => {
    const ctrl = createSoundController(false);
    expect(ctrl.muted.value).toBe(false);
  });

  it('toggle flips muted', () => {
    const ctrl = createSoundController();
    expect(ctrl.muted.value).toBe(true);

    ctrl.toggle();
    expect(ctrl.muted.value).toBe(false);

    ctrl.toggle();
    expect(ctrl.muted.value).toBe(true);
  });

  it('toggle does not affect disabled', () => {
    const ctrl = createSoundController();
    ctrl.toggle();
    expect(ctrl.disabled.value).toBe(false);
  });

  it('setting disabled does not affect muted', () => {
    const ctrl = createSoundController();
    ctrl.disabled.value = true;
    expect(ctrl.muted.value).toBe(true);
  });

  it('notifies observers on toggle', () => {
    const ctrl = createSoundController();
    const listener = vi.fn();
    ctrl.muted.observe(listener);

    ctrl.toggle();

    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('syncMutedToVideo', () => {
  const createMockVideo = () =>
    ({ muted: true }) as unknown as HTMLVideoElement;

  it('sets initial video.muted to match signal', () => {
    const ctrl = createSoundController(false);
    const video = createMockVideo();

    syncMutedToVideo(ctrl, video);

    expect(video.muted).toBe(false);
  });

  it('updates video.muted on toggle', () => {
    const ctrl = createSoundController();
    const video = createMockVideo();

    syncMutedToVideo(ctrl, video);
    expect(video.muted).toBe(true);

    ctrl.toggle();
    expect(video.muted).toBe(false);

    ctrl.toggle();
    expect(video.muted).toBe(true);
  });

  it('stops syncing after dispose', () => {
    const ctrl = createSoundController();
    const video = createMockVideo();

    const dispose = syncMutedToVideo(ctrl, video);
    dispose();

    ctrl.toggle();
    expect(video.muted).toBe(true);
  });
});
