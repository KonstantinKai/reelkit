import { describe, expect, expectTypeOf, it } from 'vitest';
import * as entry from './index';
import type {
  CanvasProgressBarProps,
  HeartAnimationProps,
  ImageStorySlideProps,
  OverlayUrlStateOptions,
  StoriesRingListProps,
  StoriesRingProps,
  StoryHeaderProps,
  VideoStorySlideProps,
} from './index';

// What a consumer imports comes from this one entry point, so anything the
// package documents has to be reachable from it.
describe('package entry point', () => {
  it('exports the hook that reads the viewed store before the player opens', () => {
    expect(entry.useAttachViewedState).toBeTypeOf('function');
  });

  // Checked by the type checker: an import of a type the entry point does not
  // export fails the build rather than this run.
  it('exports the props type of every component', () => {
    expectTypeOf<CanvasProgressBarProps>().not.toBeAny();
    expectTypeOf<HeartAnimationProps>().not.toBeAny();
    expectTypeOf<ImageStorySlideProps>().not.toBeAny();
    expectTypeOf<StoriesRingProps>().not.toBeAny();
    expectTypeOf<StoriesRingListProps>().not.toBeAny();
    expectTypeOf<StoryHeaderProps>().not.toBeAny();
    expectTypeOf<VideoStorySlideProps>().not.toBeAny();
  });

  it('exports the options type of the url state hook', () => {
    expectTypeOf<OverlayUrlStateOptions>().toHaveProperty('param');
  });
});
