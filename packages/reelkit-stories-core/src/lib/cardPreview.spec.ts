import { describe, it, expect } from 'vitest';
import { getPreviewSource } from './cardPreview';
import type { StoryItem } from './types';

describe('getPreviewSource', () => {
  const story = (item: Partial<StoryItem>): StoryItem => ({
    id: 's1',
    src: 'story.mp4',
    mediaType: 'video',
    ...item,
  });

  it('prefers the poster whatever the media is', () => {
    expect(getPreviewSource(story({ poster: 'poster.jpg' }))).toBe(
      'poster.jpg',
    );
    expect(
      getPreviewSource(
        story({ mediaType: 'image', src: 'photo.jpg', poster: 'poster.jpg' }),
      ),
    ).toBe('poster.jpg');
  });

  it('falls back to the image itself', () => {
    expect(
      getPreviewSource(story({ mediaType: 'image', src: 'photo.jpg' })),
    ).toBe('photo.jpg');
  });

  it('has nothing to show for a video without a poster', () => {
    expect(getPreviewSource(story({}))).toBeUndefined();
  });

  it('has nothing to show for a story that is not there', () => {
    expect(getPreviewSource(undefined)).toBeUndefined();
  });
});
