import type { StoryItem } from './types';

/**
 * Picture a carousel card previews for a story: the poster when the story
 * carries one, the image itself when it is an image, and nothing otherwise.
 *
 * A video without a poster has no still to show, and a card with no picture
 * falls back to the plain card the player draws for a story with nothing to
 * preview. Shared by every binding, so the three carousels answer alike.
 */
export const getPreviewSource = (
  story: StoryItem | undefined,
): string | undefined =>
  story?.poster ?? (story?.mediaType === 'image' ? story.src : undefined);
