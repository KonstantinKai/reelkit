import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createSignal } from '@reelkit/react';
import type { StoriesGroup } from '@reelkit/stories-core';
import { StoriesCarousel, type StoriesCarouselProps } from './StoriesCarousel';
import type { GroupPreviewRenderProps } from './types';

// Read from disk: the test run swaps every imported stylesheet for an empty one.
const carouselStyles = readFileSync(
  resolve(__dirname, 'StoriesCarousel.css'),
  'utf8',
);

const makeGroups = (count: number): StoriesGroup[] =>
  Array.from({ length: count }, (_, index) => ({
    author: {
      id: `a${index}`,
      name: `Author ${index}`,
      avatar: `${index}.jpg`,
    },
    stories: [
      { id: `s${index}-0`, mediaType: 'image', src: `image-${index}.jpg` },
      { id: `s${index}-1`, mediaType: 'image', src: `image-${index}-1.jpg` },
    ],
  }));

const renderCarousel = (props: Partial<StoriesCarouselProps> = {}) => {
  const allProps: StoriesCarouselProps = {
    groups: makeGroups(5),
    activeGroupIndex: 2,
    slide: null,
    activeSize: [488, 868],
    storyIndexFor: () => 0,
    onOpen: vi.fn(),
    onSlideEnd: vi.fn(),
    ...props,
  };
  const result = render(<StoriesCarousel {...allProps} />);
  return {
    ...result,
    props: allProps,
    rerenderWith: (next: Partial<StoriesCarouselProps>) =>
      result.rerender(<StoriesCarousel {...allProps} {...next} />),
  };
};

const cardNames = () =>
  screen
    .queryAllByRole('button')
    .map((button) => button.getAttribute('aria-label'));

// jsdom has no TransitionEvent, so React listens for the prefixed name instead;
// sending both reaches the handler whichever one React picked.
const endTransition = (element: Element, propertyName: string) => {
  for (const type of ['transitionend', 'webkitTransitionEnd']) {
    const event = new Event(type, { bubbles: true });
    Object.defineProperty(event, 'propertyName', { value: propertyName });
    act(() => {
      element.dispatchEvent(event);
    });
  }
};

const ringOf = (name: string) =>
  screen
    .getByRole('button', { name: `Open stories by ${name}` })
    .querySelector('.rk-stories-ring') as HTMLElement;

describe('StoriesCarousel', () => {
  it('shows up to two groups on each side of the active one', () => {
    renderCarousel();
    expect(cardNames()).toEqual([
      'Open stories by Author 0',
      'Open stories by Author 1',
      'Open stories by Author 3',
      'Open stories by Author 4',
    ]);
  });

  it('shows no cards before the first group or after the last', () => {
    const { rerenderWith } = renderCarousel({ activeGroupIndex: 0 });
    expect(cardNames()).toEqual([
      'Open stories by Author 1',
      'Open stories by Author 2',
    ]);

    rerenderWith({ activeGroupIndex: 4 });
    expect(cardNames()).toEqual([
      'Open stories by Author 2',
      'Open stories by Author 3',
    ]);
  });

  it('shows no cards for a single group', () => {
    renderCarousel({ groups: makeGroups(1), activeGroupIndex: 0 });
    expect(document.querySelectorAll('.rk-stories-card')).toHaveLength(0);
  });

  it('previews the story each group would open on', () => {
    const storyIndexFor = vi.fn((groupIndex: number) =>
      groupIndex === 3 ? 1 : 0,
    );
    renderCarousel({ storyIndexFor });
    const image = screen
      .getByRole('button', { name: 'Open stories by Author 3' })
      .querySelector('.rk-stories-card-image');
    expect(image?.getAttribute('src')).toBe('image-3-1.jpg');
  });

  it('uses the video poster, and no frame for a video without one', () => {
    const groups: StoriesGroup[] = [
      makeGroups(1)[0],
      {
        author: { id: 'p', name: 'Poster', avatar: 'p.jpg' },
        stories: [
          { id: 'v1', mediaType: 'video', src: 'v1.mp4', poster: 'v1.jpg' },
        ],
      },
      {
        author: { id: 'n', name: 'Plain', avatar: 'n.jpg' },
        stories: [{ id: 'v2', mediaType: 'video', src: 'v2.mp4' }],
      },
    ];
    renderCarousel({ groups, activeGroupIndex: 0 });

    const frame = (name: string) =>
      screen
        .getByRole('button', { name: `Open stories by ${name}` })
        .querySelector('.rk-stories-card-image');
    expect(frame('Poster')?.getAttribute('src')).toBe('v1.jpg');
    expect(frame('Plain')).toBeNull();
    expect(document.querySelector('video')).toBeNull();
  });

  it('draws a story with nothing to show through the slide renderer, scaled to the card', () => {
    const groups: StoriesGroup[] = [
      makeGroups(1)[0],
      {
        author: { id: 't', name: 'Text', avatar: 't.jpg' },
        stories: [{ id: 'text', mediaType: 'image', src: '' }],
      },
      {
        author: { id: 'v', name: 'Video', avatar: 'v.jpg' },
        stories: [{ id: 'video', mediaType: 'video', src: 'v.mp4' }],
      },
      makeGroups(4)[3],
    ];
    const renderFrame = vi.fn((story: { id: string }) => (
      <span data-testid={`frame-${story.id}`} />
    ));
    renderCarousel({ groups, activeGroupIndex: 0, renderFrame });

    const frame = screen
      .getByTestId('frame-text')
      .closest('.rk-stories-card-frame') as HTMLElement;
    // A card is 0.4 of the player's height.
    const scale = Number(frame.style.transform.match(/scale\(([\d.]+)\)/)?.[1]);
    expect(scale).toBeCloseTo(0.4, 5);
    expect(frame.getAttribute('aria-hidden')).toBe('true');
    // Videos play through one shared element, and an image already has a frame.
    expect(screen.queryByTestId('frame-video')).toBeNull();
    expect(renderFrame).toHaveBeenCalledTimes(1);
  });

  // A custom slide can hold its own buttons and links. Drawn inside the card's
  // button they would nest one control in another and stay reachable by Tab
  // while invisible, so the preview sits under the button and is inert.
  it('keeps the controls of a previewed slide out of the card button and out of reach', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {
      /* collected below */
    });
    const groups: StoriesGroup[] = [
      makeGroups(1)[0],
      {
        author: { id: 't', name: 'Text', avatar: 't.jpg' },
        stories: [{ id: 'text', mediaType: 'image', src: '' }],
      },
    ];
    renderCarousel({
      groups,
      activeGroupIndex: 0,
      renderFrame: () => (
        <div>
          <button type="button">Vote</button>
          <a href="https://example.com">Link</a>
        </div>
      ),
    });

    const cardButton = screen.getByRole('button', {
      name: 'Open stories by Text',
    });
    const frame = document.querySelector(
      '.rk-stories-card-frame',
    ) as HTMLElement;
    expect(frame).not.toBeNull();
    expect(cardButton.contains(frame)).toBe(false);
    expect(frame.closest('.rk-stories-card')).toBe(
      cardButton.closest('.rk-stories-card'),
    );
    expect(frame.hasAttribute('inert')).toBe(true);
    expect(
      errors.mock.calls.some((call) =>
        /validateDOMNesting|cannot be a descendant|cannot contain/.test(
          String(call[0]),
        ),
      ),
    ).toBe(false);
    errors.mockRestore();
  });

  it('opens the group of a clicked card', () => {
    const { props } = renderCarousel();
    fireEvent.click(
      screen.getByRole('button', { name: 'Open stories by Author 4' }),
    );
    expect(props.onOpen).toHaveBeenCalledWith(4);
  });

  // The viewed map arrives as a signal and the cards follow it by themselves,
  // so marking a story seen repaints them without whoever renders the carousel
  // taking part: nothing is re-rendered from outside in this test.
  it('mutes the ring of a group watched to the end, and follows the signal', () => {
    const viewedState = createSignal(
      new Map([
        ['a1', 2],
        ['a3', 1],
      ]),
    );
    renderCarousel({ viewedState });
    expect(ringOf('Author 1').classList).not.toContain(
      'rk-stories-ring--active',
    );
    expect(ringOf('Author 3').classList).toContain('rk-stories-ring--active');
    expect(ringOf('Author 4').classList).toContain('rk-stories-ring--active');

    act(() => {
      viewedState.value = new Map([['a3', 2]]);
    });
    expect(ringOf('Author 1').classList).toContain('rk-stories-ring--active');
    expect(ringOf('Author 3').classList).not.toContain(
      'rk-stories-ring--active',
    );
  });

  it('follows a signal that replaced the one it was given first', () => {
    const first = createSignal(new Map<string, number>());
    const second = createSignal(new Map<string, number>());
    const { rerenderWith } = renderCarousel({ viewedState: first });
    rerenderWith({ viewedState: second });

    act(() => {
      second.value = new Map([['a1', 2]]);
    });
    expect(ringOf('Author 1').classList).not.toContain(
      'rk-stories-ring--active',
    );
  });

  it('draws every ring unwatched without a viewed map', () => {
    renderCarousel();
    for (const ring of Array.from(
      document.querySelectorAll('.rk-stories-ring'),
    )) {
      expect(ring.classList).toContain('rk-stories-ring--active');
    }
  });

  it('hands a custom card renderer everything it needs', () => {
    const renderGroupPreview = vi.fn(
      ({ group, onOpen }: GroupPreviewRenderProps) => (
        <button type="button" onClick={onOpen}>
          custom {group.author.name}
        </button>
      ),
    );
    const { props } = renderCarousel({
      renderGroupPreview,
      storyIndexFor: () => 1,
      viewedState: createSignal(new Map([['a1', 1]])),
    });

    expect(document.querySelector('.rk-stories-card-button')).toBeNull();
    const call = renderGroupPreview.mock.calls.find(
      ([preview]) => preview.groupIndex === 1,
    )?.[0];
    expect(call).toMatchObject({
      groupIndex: 1,
      offset: -1,
      viewedCount: 1,
      story: { id: 's1-1' },
    });
    expect(call?.group.author.id).toBe('a1');

    fireEvent.click(screen.getByRole('button', { name: 'custom Author 1' }));
    expect(props.onOpen).toHaveBeenCalledWith(1);
  });

  it('names the author on each card and keeps them in the tab order', () => {
    renderCarousel();
    for (const button of screen.getAllByRole('button')) {
      expect(button.getAttribute('aria-label')).toMatch(/^Open stories by /);
      expect(button.tabIndex).toBe(0);
    }
  });

  describe('sliding to another group', () => {
    const slideProps = (phase: 'start' | 'run') => ({
      activeGroupIndex: 3,
      slide: { from: 2, to: 3, phase },
    });

    const cardOf = (name: string) =>
      screen
        .getByRole('button', { name: `Open stories by ${name}` })
        .closest('.rk-stories-card') as HTMLElement;

    it('lays the cards out around the group being left, without a transition', () => {
      renderCarousel(slideProps('start'));
      expect(
        document.querySelector('.rk-stories-carousel')?.classList,
      ).toContain('rk-stories-carousel--instant');
      expect(cardOf('Author 2').classList).toContain('rk-stories-card--center');
      expect(cardOf('Author 3').classList).not.toContain(
        'rk-stories-card--center',
      );
    });

    it('moves the opened group into the center', () => {
      renderCarousel(slideProps('run'));
      expect(
        document.querySelector('.rk-stories-carousel')?.classList,
      ).not.toContain('rk-stories-carousel--instant');
      expect(cardOf('Author 3').classList).toContain('rk-stories-card--center');
      // Three places left of the opened group, past the two a side shows.
      expect(cardOf('Author 0').classList).toContain('rk-stories-card--hidden');
      expect(cardOf('Author 1').classList).not.toContain(
        'rk-stories-card--hidden',
      );
    });

    it('takes the cards out of the tab order while they move', () => {
      renderCarousel(slideProps('run'));
      for (const button of screen.getAllByRole('button')) {
        expect(button.tabIndex).toBe(-1);
      }
    });

    it('draws only the cards around both ends of a far jump', () => {
      renderCarousel({
        groups: makeGroups(200),
        activeGroupIndex: 150,
        slide: { from: 0, to: 150, phase: 'run' },
      });
      expect(cardNames()).toEqual(
        [0, 1, 2, 148, 149, 150, 151, 152].map(
          (index) => `Open stories by Author ${index}`,
        ),
      );
    });

    // jsdom loads no stylesheet, so the rule itself is read: a card may only
    // animate while the overlay is sliding. Anything else would ease the cards
    // after a window resize or a touch swipe, behind a player that does not.
    it('animates the cards only while the overlay slides', () => {
      const rules = carouselStyles
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('}')
        // The property itself, not the `--rk-stories-card-transition` token.
        .filter((rule) => /(?<![\w-])transition\s*:(?!\s*none)/.test(rule));

      expect(rules.length).toBeGreaterThan(0);
      for (const rule of rules) {
        const selectors = rule.slice(0, rule.indexOf('{')).split(',');
        for (const selector of selectors) {
          expect(selector).toContain('.rk-stories-overlay--sliding');
        }
      }
    });

    it('ends when the opened card finishes moving', () => {
      const { props } = renderCarousel(slideProps('run'));

      endTransition(cardOf('Author 2'), 'transform');
      endTransition(cardOf('Author 3'), 'opacity');
      expect(props.onSlideEnd).not.toHaveBeenCalled();

      endTransition(cardOf('Author 3'), 'transform');
      expect(props.onSlideEnd).toHaveBeenCalledOnce();
    });
  });
  // A card whose picture will not load otherwise shows the browser's broken
  // image mark, which is what a viewer sees on a dead link.
  describe('a card whose picture will not load', () => {
    const cardImages = () =>
      Array.from(
        document.querySelectorAll<HTMLImageElement>('.rk-stories-card-image'),
      );

    it('drops the picture rather than showing a broken one', () => {
      renderCarousel();
      const image = cardImages()[0];
      expect(image).toBeTruthy();

      act(() => {
        fireEvent.error(image);
      });

      expect(
        cardImages().map((each) => each.getAttribute('src')),
      ).not.toContain(image.getAttribute('src'));
    });

    // What is left is the card drawn for a story with nothing to preview: the
    // author, still reachable.
    it('keeps the author and the card itself', () => {
      const { props } = renderCarousel();
      act(() => {
        fireEvent.error(cardImages()[0]);
      });

      expect(
        screen.getByLabelText(`Open stories by ${props.groups[0].author.name}`),
      ).toBeTruthy();
    });
  });
});
