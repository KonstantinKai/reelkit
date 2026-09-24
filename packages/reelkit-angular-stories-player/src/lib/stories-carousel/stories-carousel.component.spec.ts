import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Component, type DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { createSignal } from '@reelkit/angular';
import type { StoriesGroup } from '@reelkit/stories-core';
import {
  RkStoriesCarouselComponent,
  type CarouselSlide,
} from './stories-carousel.component';

const GROUPS: StoriesGroup[] = ['Alice', 'Bo', 'Cy', 'Dee'].map(
  (name, index) => ({
    author: { id: `a${index}`, name, avatar: `/${name}.jpg` },
    stories: [
      { id: `${index}-1`, src: `/${index}-1.jpg`, mediaType: 'image' as const },
      { id: `${index}-2`, src: `/${index}-2.jpg`, mediaType: 'image' as const },
    ],
  }),
);

function createCarousel(
  inputs: Record<string, unknown> = {},
): ComponentFixture<RkStoriesCarouselComponent> {
  const fixture = TestBed.createComponent(RkStoriesCarouselComponent);
  fixture.componentRef.setInput('groups', GROUPS);
  fixture.componentRef.setInput('activeGroupIndex', 1);
  fixture.componentRef.setInput('activeSize', [400, 800]);
  fixture.componentRef.setInput('storyIndexFor', () => 0);
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
  fixture.detectChanges();
  return fixture;
}

function cards(
  fixture: ComponentFixture<RkStoriesCarouselComponent>,
): HTMLElement[] {
  return fixture.debugElement
    .queryAll(By.css('.rk-stories-card'))
    .map((card) => card.nativeElement as HTMLElement);
}

describe('RkStoriesCarouselComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RkStoriesCarouselComponent] });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('draws the groups around the active one', () => {
    const names = createCarousel()
      .debugElement.queryAll(By.css('.rk-stories-card-name'))
      .map((name) => (name.nativeElement.textContent as string).trim());

    expect(names).toContain('Alice');
    expect(names).toContain('Cy');
  });

  it('places every card with a transform rather than layout', () => {
    for (const card of cards(createCarousel())) {
      expect(card.style.transform).toContain('translate(-50%, -50%)');
      expect(card.style.transform).toContain('scale(');
    }
  });

  // At rest the player itself fills the centre, so the carousel draws only
  // the groups either side of it. A card reaches the centre only mid-slide.
  it('leaves the centre to the player while the cards are at rest', () => {
    const centred = cards(createCarousel()).filter((card) =>
      card.className.includes('rk-stories-card--center'),
    );
    expect(centred).toHaveLength(0);
  });

  it('puts one card in the centre while a slide runs', () => {
    const centred = cards(
      createCarousel({ slide: { from: 1, to: 2, phase: 'run' } }),
    ).filter((card) => card.className.includes('rk-stories-card--center'));
    expect(centred).toHaveLength(1);
  });

  // During a slide the cards lay out around the group being left, then move
  // to their places around the one being opened.
  it('lays out around the group being left on the first frame', () => {
    const slide: CarouselSlide = { from: 1, to: 2, phase: 'start' };
    const fixture = createCarousel({ slide });

    const carousel = fixture.debugElement.query(By.css('.rk-stories-carousel'))
      .nativeElement as HTMLElement;
    expect(carousel.className).toContain('rk-stories-carousel--instant');
  });

  it('drops the instant flag once the cards are moving', () => {
    const slide: CarouselSlide = { from: 1, to: 2, phase: 'run' };
    const carousel = createCarousel({ slide }).debugElement.query(
      By.css('.rk-stories-carousel'),
    ).nativeElement as HTMLElement;

    expect(carousel.className).not.toContain('rk-stories-carousel--instant');
  });

  it('reports the click instead of opening the group itself', () => {
    const fixture = createCarousel();
    const opened: number[] = [];
    fixture.componentInstance.opened.subscribe((index) => opened.push(index));

    fixture.debugElement
      .queryAll(By.css('.rk-stories-card-button'))[0]
      .nativeElement.click();

    expect(opened).toHaveLength(1);
  });

  // A card's children animate too, so anything but the centre card's own
  // transform would end the slide before the cards had arrived.
  it('ends the slide only on the centre card finishing its own move', () => {
    const slide: CarouselSlide = { from: 1, to: 2, phase: 'run' };
    const fixture = createCarousel({ slide });
    let ended = 0;
    fixture.componentInstance.slideEnded.subscribe(() => ended++);

    const target = cards(fixture).find((card) =>
      card.className.includes('rk-stories-card--center'),
    )!;

    target.dispatchEvent(
      Object.assign(new Event('transitionend'), { propertyName: 'opacity' }),
    );
    expect(ended).toBe(0);

    target.dispatchEvent(
      Object.assign(new Event('transitionend'), { propertyName: 'transform' }),
    );
    expect(ended).toBe(1);
  });

  it('takes a card out of the focus order while the cards slide', () => {
    const atRest = createCarousel();
    const sliding = createCarousel({
      slide: { from: 1, to: 2, phase: 'run' } as CarouselSlide,
    });

    const tabindexes = (
      fixture: ComponentFixture<RkStoriesCarouselComponent>,
    ) =>
      fixture.debugElement
        .queryAll(By.css('.rk-stories-card-button'))
        .map((button) => button.nativeElement.getAttribute('tabindex'));

    expect(tabindexes(atRest)).toContain('0');
    expect(tabindexes(sliding).every((value) => value === '-1')).toBe(true);
  });

  // A card whose picture will not load otherwise shows the browser's broken
  // image mark, which is what a viewer sees on a dead CDN link.
  describe('a card whose picture will not load', () => {
    function failFirstCardImage(
      fixture: ComponentFixture<RkStoriesCarouselComponent>,
    ): void {
      const image = fixture.debugElement.query(
        By.css('.rk-stories-card-image'),
      );
      image.triggerEventHandler('error', new Event('error'));
      fixture.detectChanges();
    }

    it('drops the picture rather than showing a broken one', () => {
      const fixture = createCarousel();
      expect(
        fixture.debugElement.queryAll(By.css('.rk-stories-card-image')).length,
      ).toBeGreaterThan(0);

      failFirstCardImage(fixture);

      const remaining = fixture.debugElement
        .queryAll(By.css('.rk-stories-card-image'))
        .map((image) => (image.nativeElement as HTMLImageElement).src);

      expect(remaining.some((src) => src.endsWith('/0-1.jpg'))).toBe(false);
    });

    // The frame is for a story with no picture of its own. Drawing it here
    // would paint the card in whatever the consumer's slide paints a story
    // that has media — solid black, in the demo — over the plain card.
    it('falls back to the plain card, not to the slide template', () => {
      const fixture = TestBed.createComponent(FailingFrameHostComponent);
      fixture.detectChanges();

      const card = () =>
        fixture.debugElement.queryAll(By.css('.rk-stories-card'))[0];
      const image = card().query(By.css('.rk-stories-card-image'));
      expect(image).not.toBeNull();

      image.triggerEventHandler('error', new Event('error'));
      fixture.detectChanges();

      expect(card().query(By.css('.rk-stories-card-image'))).toBeNull();
      expect(card().query(By.css('.rk-stories-card-frame'))).toBeNull();
      expect(card().query(By.css('.rk-stories-card-name'))).not.toBeNull();
    });

    @Component({
      template: `
        <rk-stories-carousel
          [groups]="groups"
          [activeGroupIndex]="1"
          [activeSize]="[400, 800]"
          [storyIndexFor]="storyIndexFor"
          [frameTemplate]="frame"
          [frameContext]="frameContext"
        />
        <ng-template #frame><p class="drawn-slide">a slide</p></ng-template>
      `,
      imports: [RkStoriesCarouselComponent],
    })
    class FailingFrameHostComponent {
      groups = GROUPS;
      storyIndexFor = () => 0;
      frameContext = (groupIndex: number) =>
        ({ $implicit: GROUPS[groupIndex].stories[0] }) as never;
    }

    // A broken image and a video with no poster are both "nothing to show",
    // and a viewer sees them side by side. They have to look the same.
    it('looks the same as a card previewing a video', () => {
      const mixed: StoriesGroup[] = [
        {
          author: { id: 'a0', name: 'Alice', avatar: '/alice.jpg' },
          stories: [{ id: 'i', src: '/broken.jpg', mediaType: 'image' }],
        },
        GROUPS[1],
        {
          author: { id: 'a2', name: 'Bo', avatar: '/bo.jpg' },
          stories: [{ id: 'v', src: '/clip.mp4', mediaType: 'video' }],
        },
      ];
      const fixture = createCarousel({ groups: mixed });
      const shapeOf = (card: DebugElement) => ({
        image: card.query(By.css('.rk-stories-card-image')) !== null,
        frame: card.query(By.css('.rk-stories-card-frame')) !== null,
        named: card.query(By.css('.rk-stories-card-name')) !== null,
      });

      const broken = fixture.debugElement.queryAll(
        By.css('.rk-stories-card'),
      )[0];
      broken
        .query(By.css('.rk-stories-card-image'))
        .triggerEventHandler('error', new Event('error'));
      fixture.detectChanges();

      const [brokenCard, videoCard] = fixture.debugElement.queryAll(
        By.css('.rk-stories-card'),
      );

      expect(shapeOf(brokenCard)).toEqual(shapeOf(videoCard));
      expect(shapeOf(brokenCard)).toEqual({
        image: false,
        frame: false,
        named: true,
      });
    });

    // What is left is the card the player already draws for a story with
    // nothing to preview: the author, still reachable.
    it('keeps the author and the card itself', () => {
      const fixture = createCarousel();
      failFirstCardImage(fixture);

      expect(
        fixture.debugElement.queryAll(By.css('.rk-stories-card-name')).length,
      ).toBeGreaterThan(0);
      expect(
        fixture.debugElement.query(By.css('.rk-stories-card-button')),
      ).not.toBeNull();
    });
  });

  // The card ring is a fixed size the copied stylesheet lays the card out
  // around, and it is the same number in react and vue. Reading it off the
  // rendered element rather than the constant: a card draws the ring through
  // `getRingPresentation`, so only the element says what the viewer sees.
  // The react and vue previews name the group; the implicit value stays for
  // templates already written against it.
  it('names the group a preview template receives', () => {
    const carousel = createCarousel().componentInstance as unknown as {
      cards: () => unknown[];
      previewContext: (card: unknown) => Record<string, unknown>;
    };
    const context = carousel.previewContext(carousel.cards()[0]);

    expect(context['group']).toBe(context['$implicit']);
    expect(context['group']).toBeDefined();
  });

  // The viewed controller hands over a plain subscribable, the same shape the
  // react and vue carousels take, not necessarily a core signal.
  it('draws rings from any subscribable viewed state', () => {
    const viewedState = {
      value: new Map([['a0', 2]]),
      observe: () => () => undefined,
    };
    const fixture = createCarousel({ activeGroupIndex: 1, viewedState });
    const ring = (name: string) =>
      fixture.debugElement.query(
        By.css(
          `[aria-label="Open stories by ${name}"] [class*="rk-stories-ring"]`,
        ),
      ).nativeElement as HTMLElement;

    expect(ring('Alice').classList).not.toContain('rk-stories-ring--active');
    expect(ring('Cy').classList).toContain('rk-stories-ring--active');
  });

  it('draws the card ring at the size the other players use', () => {
    const ring = createCarousel().debugElement.query(
      By.css('.rk-stories-card-info [class*="rk-stories-ring"]'),
    ).nativeElement as HTMLElement;

    expect(ring.style.width).toBe('52px');
    expect(ring.style.height).toBe('52px');
  });

  // The layout, previews and rings the react and vue carousels draw, on a
  // feed long enough to fill both sides.
  describe('laying out a feed', () => {
    const makeGroups = (count: number): StoriesGroup[] =>
      Array.from({ length: count }, (_, index) => ({
        author: {
          id: `g${index}`,
          name: `Author ${index}`,
          avatar: `/${index}.jpg`,
        },
        stories: [
          {
            id: `s${index}-0`,
            mediaType: 'image' as const,
            src: `/image-${index}.jpg`,
          },
          {
            id: `s${index}-1`,
            mediaType: 'image' as const,
            src: `/image-${index}-1.jpg`,
          },
        ],
      }));

    const createFeed = (inputs: Record<string, unknown> = {}) =>
      createCarousel({ groups: makeGroups(5), activeGroupIndex: 2, ...inputs });

    type Fixture = ComponentFixture<RkStoriesCarouselComponent>;

    const cardNames = (fixture: Fixture) =>
      fixture.debugElement
        .queryAll(By.css('.rk-stories-card-button'))
        .map((button) => button.nativeElement.getAttribute('aria-label'));
    const buttonOf = (fixture: Fixture, name: string) =>
      fixture.debugElement.query(
        By.css(`[aria-label="Open stories by ${name}"]`),
      ).nativeElement as HTMLElement;
    const ringOf = (fixture: Fixture, name: string) =>
      buttonOf(fixture, name).querySelector(
        '[class*="rk-stories-ring"]',
      ) as HTMLElement;
    const cardOf = (fixture: Fixture, name: string) =>
      buttonOf(fixture, name).closest('.rk-stories-card') as HTMLElement;

    it('shows up to two groups on each side of the active one', () => {
      expect(cardNames(createFeed())).toEqual([
        'Open stories by Author 0',
        'Open stories by Author 1',
        'Open stories by Author 3',
        'Open stories by Author 4',
      ]);
    });

    it('shows no cards before the first group or after the last', () => {
      const fixture = createFeed({ activeGroupIndex: 0 });
      expect(cardNames(fixture)).toEqual([
        'Open stories by Author 1',
        'Open stories by Author 2',
      ]);

      fixture.componentRef.setInput('activeGroupIndex', 4);
      fixture.detectChanges();
      expect(cardNames(fixture)).toEqual([
        'Open stories by Author 2',
        'Open stories by Author 3',
      ]);
    });

    it('shows no cards for a single group', () => {
      expect(
        cards(createFeed({ groups: makeGroups(1), activeGroupIndex: 0 })),
      ).toHaveLength(0);
    });

    it('previews the story each group would open on', () => {
      const fixture = createFeed({
        storyIndexFor: (groupIndex: number) => (groupIndex === 3 ? 1 : 0),
      });
      const image = buttonOf(fixture, 'Author 3').querySelector(
        '.rk-stories-card-image',
      );

      expect(image?.getAttribute('src')).toBe('/image-3-1.jpg');
    });

    // Every video plays through one shared element that belongs to the story
    // on screen, so a card never draws a video of its own.
    it('uses the video poster, and no frame for a video without one', () => {
      const groups: StoriesGroup[] = [
        makeGroups(1)[0],
        {
          author: { id: 'p', name: 'Poster', avatar: '/p.jpg' },
          stories: [
            {
              id: 'v1',
              mediaType: 'video',
              src: '/v1.mp4',
              poster: '/v1.jpg',
            },
          ],
        },
        {
          author: { id: 'n', name: 'Plain', avatar: '/n.jpg' },
          stories: [{ id: 'v2', mediaType: 'video', src: '/v2.mp4' }],
        },
      ];
      const fixture = createFeed({ groups, activeGroupIndex: 0 });
      const frame = (name: string) =>
        buttonOf(fixture, name).querySelector('.rk-stories-card-image');

      expect(frame('Poster')?.getAttribute('src')).toBe('/v1.jpg');
      expect(frame('Plain')).toBeNull();
      expect(fixture.nativeElement.querySelector('video')).toBeNull();
    });

    it('mutes the ring of a group watched to the end, and follows the signal', () => {
      const viewedState = createSignal(
        new Map([
          ['g1', 2],
          ['g3', 1],
        ]),
      );
      const fixture = createFeed({ viewedState });
      expect(ringOf(fixture, 'Author 1').classList).not.toContain(
        'rk-stories-ring--active',
      );
      expect(ringOf(fixture, 'Author 3').classList).toContain(
        'rk-stories-ring--active',
      );
      expect(ringOf(fixture, 'Author 4').classList).toContain(
        'rk-stories-ring--active',
      );

      viewedState.value = new Map([['g3', 2]]);
      fixture.detectChanges();

      expect(ringOf(fixture, 'Author 1').classList).toContain(
        'rk-stories-ring--active',
      );
      expect(ringOf(fixture, 'Author 3').classList).not.toContain(
        'rk-stories-ring--active',
      );
    });

    it('follows a signal that replaced the one it was given first', () => {
      const second = createSignal(new Map<string, number>());
      const fixture = createFeed({
        viewedState: createSignal(new Map<string, number>()),
      });
      fixture.componentRef.setInput('viewedState', second);
      fixture.detectChanges();

      second.value = new Map([['g1', 2]]);
      fixture.detectChanges();

      expect(ringOf(fixture, 'Author 1').classList).not.toContain(
        'rk-stories-ring--active',
      );
    });

    it('draws every ring unwatched without a viewed state', () => {
      const rings = (
        createFeed().nativeElement as HTMLElement
      ).querySelectorAll('.rk-stories-card-info .rk-stories-ring');

      expect(rings.length).toBeGreaterThan(0);
      for (const ring of Array.from(rings)) {
        expect(ring.classList).toContain('rk-stories-ring--active');
      }
    });

    it('hands a preview template everything it needs', () => {
      const fixture = createFeed({
        storyIndexFor: () => 1,
        viewedState: createSignal(new Map([['g1', 1]])),
      });
      const carousel = fixture.componentInstance as unknown as {
        cards: () => { groupIndex: number }[];
        previewContext: (card: unknown) => Record<string, unknown> & {
          onOpen: () => void;
        };
      };
      const opened: number[] = [];
      fixture.componentInstance.opened.subscribe((index) => opened.push(index));
      const context = carousel.previewContext(
        carousel.cards().find((card) => card.groupIndex === 1),
      );

      expect(context).toMatchObject({
        groupIndex: 1,
        offset: -1,
        viewedCount: 1,
        story: { id: 's1-1' },
      });
      expect((context['group'] as StoriesGroup).author.id).toBe('g1');

      context.onOpen();
      expect(opened).toEqual([1]);
    });

    it('names the author on each card and keeps them in the tab order', () => {
      const buttons = createFeed().debugElement.queryAll(
        By.css('.rk-stories-card-button'),
      );

      expect(buttons.length).toBeGreaterThan(0);
      for (const button of buttons) {
        const element = button.nativeElement as HTMLElement;
        expect(element.getAttribute('aria-label')).toMatch(/^Open stories by /);
        expect(element.tabIndex).toBe(0);
      }
    });

    it('moves the opened group into the centre', () => {
      const fixture = createFeed({
        activeGroupIndex: 3,
        slide: { from: 2, to: 3, phase: 'run' } as CarouselSlide,
      });

      expect(cardOf(fixture, 'Author 3').classList).toContain(
        'rk-stories-card--center',
      );
      // Three places left of the opened group, past the two a side shows.
      expect(cardOf(fixture, 'Author 0').classList).toContain(
        'rk-stories-card--hidden',
      );
      expect(cardOf(fixture, 'Author 1').classList).not.toContain(
        'rk-stories-card--hidden',
      );
    });

    it('draws only the cards around both ends of a far jump', () => {
      const fixture = createFeed({
        groups: makeGroups(200),
        activeGroupIndex: 150,
        slide: { from: 0, to: 150, phase: 'run' } as CarouselSlide,
      });

      expect(cardNames(fixture)).toEqual(
        [0, 1, 2, 148, 149, 150, 151, 152].map(
          (index) => `Open stories by Author ${index}`,
        ),
      );
    });

    // jsdom loads no stylesheet, so the rule itself is read: a card may only
    // animate while the overlay is sliding. Anything else would ease the cards
    // after a window resize or a touch swipe, behind a player that does not.
    it('animates the cards only while the overlay slides', () => {
      const carouselStyles = readFileSync(
        join(__dirname, '..', 'styles', 'stories-carousel.css'),
        'utf8',
      );
      const rules = carouselStyles
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('}')
        // The property itself, not the `--rk-stories-card-transition` token.
        .filter((rule) => /(?<![\w-])transition\s*:(?!\s*none)/.test(rule));

      expect(rules.length).toBeGreaterThan(0);
      for (const rule of rules) {
        for (const selector of rule.slice(0, rule.indexOf('{')).split(',')) {
          expect(selector).toContain('.rk-stories-overlay--sliding');
        }
      }
    });
  });

  // A story with nothing to preview — text on a gradient — leaves the card
  // blank unless the player's own slide template draws it.
  describe('a card with no picture to show', () => {
    const TEXT_GROUPS: StoriesGroup[] = GROUPS.map((group, index) => ({
      ...group,
      stories: [{ id: `t${index}`, src: '', mediaType: 'image' as const }],
    }));

    function createFramed(): ComponentFixture<FrameHostComponent> {
      const fixture = TestBed.createComponent(FrameHostComponent);
      fixture.detectChanges();
      return fixture;
    }

    it('draws it with the slide template instead', () => {
      const frames = createFramed().debugElement.queryAll(
        By.css('.rk-stories-card-frame'),
      );

      expect(frames.length).toBeGreaterThan(0);
      expect((frames[0].nativeElement as HTMLElement).textContent).toContain(
        'a text story',
      );
    });

    it('draws it at the player size, scaled to the card', () => {
      const frame = createFramed().debugElement.query(
        By.css('.rk-stories-card-frame'),
      ).nativeElement as HTMLElement;

      expect(frame.style.width).toBe('400px');
      expect(frame.style.height).toBe('800px');
      expect(frame.style.transform).toContain('scale(');
    });

    // It is a picture of the story: nothing in it is for reading or clicking.
    it('keeps it out of reach', () => {
      const frame = createFramed().debugElement.query(
        By.css('.rk-stories-card-frame'),
      ).nativeElement as HTMLElement;

      expect(frame.getAttribute('aria-hidden')).toBe('true');
      expect(frame.hasAttribute('inert')).toBe(true);
    });

    // A slide template can hold buttons and links of its own, and a control
    // cannot sit inside another one.
    it('draws it beside the card button, never inside it', () => {
      const frame = createFramed().debugElement.query(
        By.css('.rk-stories-card-frame'),
      ).nativeElement as HTMLElement;

      expect(frame.closest('button')).toBeNull();
      expect(frame.parentElement?.classList).toContain('rk-stories-card');
    });

    @Component({
      template: `
        <rk-stories-carousel
          [groups]="groups"
          [activeGroupIndex]="1"
          [activeSize]="[400, 800]"
          [storyIndexFor]="storyIndexFor"
          [frameTemplate]="frame"
          [frameContext]="frameContext"
        />
        <ng-template #frame let-story>
          <p>a text story {{ story.id }}</p>
        </ng-template>
      `,
      imports: [RkStoriesCarouselComponent],
    })
    class FrameHostComponent {
      groups = TEXT_GROUPS;
      storyIndexFor = () => 0;
      frameContext = (groupIndex: number) =>
        ({ $implicit: TEXT_GROUPS[groupIndex].stories[0] }) as never;
    }
  });
});
