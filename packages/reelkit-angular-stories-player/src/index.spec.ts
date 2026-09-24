import * as entry from './index';

// What a consumer imports comes from this one entry point, so anything the
// package documents has to be reachable from it.
describe('package entry point', () => {
  // A slide drawn outside the player, or a page with its own mute control,
  // provides the sound state the player's video slide reads.
  it('exports the sound state service the video slide reads', () => {
    expect(entry.SoundStateService).toBeDefined();
  });

  it('exports the helper that reads the viewed store for a whole component', () => {
    expect(entry.attachViewedState).toBeInstanceOf(Function);
  });
});
