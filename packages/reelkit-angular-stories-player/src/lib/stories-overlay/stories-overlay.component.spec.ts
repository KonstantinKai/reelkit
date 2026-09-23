import { Component, signal, type WritableSignal } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ReelComponent,
  SoundStateService,
  cubeTransition,
  fadeTransition,
  slideTransition,
} from '@reelkit/angular';
import type { StoriesGroup } from '@reelkit/stories-core';
import type { ChromePlacement, DesktopLayout } from '../types';
import { RkCanvasProgressBarComponent } from '../canvas-progress-bar/canvas-progress-bar.component';
import { RkStoriesOverlayComponent } from './stories-overlay.component';
import { RkStoriesContentComponent } from '../stories-content/stories-content.component';
import {
  RkStoriesFooterDirective,
  RkStoriesHeaderDirective,
  RkStoriesNavigationDirective,
  RkStoriesProgressBarDirective,
  RkStoriesSlideDirective,
} from '../template-slots/stories-template-slots';
import {
  RkVideoStorySlideComponent,
  sharedStoryVideo,
} from '../video-story-slide/video-story-slide.component';
import type { StoriesApi } from '../types';

/**
 * The player's own surface, which the specs drive directly. Going through the
 * rendered slider instead would test Angular's event plumbing rather than the
 * engine the player runs on.
 */
interface OverlayInternals {
  storiesCtrl: {
    state: {
      activeGroupIndex: { value: number };
      activeStoryIndex: { value: number };
      isPaused: { value: boolean };
    };
    goToGroup: (index: number) => void;
  };
  sizeSignal: { value: [number, number] };
  closed: { emit: () => void };
  activeStoryIndex: () => number;
  chromeVisible: () => boolean;
  onTap: (event: { localPosition: [number, number] }) => void;
  onDoubleTap: () => void;
  onLongPressStart: () => void;
  onLongPressEnd: () => void;
  onNavKey: (increment: -1 | 1) => void;
}

/**
 * The engine lives in the child the overlay creates while it is open, so that
 * is what these cases drive.
 */
function internalsOf(
  fixture: ComponentFixture<HostComponent>,
): OverlayInternals {
  return contentOf(fixture) as unknown as OverlayInternals;
}

function contentOf(
  fixture: ComponentFixture<HostComponent>,
): RkStoriesContentComponent {
  return fixture.debugElement.query(By.directive(RkStoriesContentComponent))
    .componentInstance as RkStoriesContentComponent;
}

const GROUPS: StoriesGroup[] = [
  {
    author: { id: 'a1', name: 'Alice', avatar: '/alice.jpg' },
    stories: [
      { id: 's1', src: '/1.jpg', mediaType: 'image' },
      { id: 's2', src: '/2.jpg', mediaType: 'image' },
      { id: 's3', src: '/3.jpg', mediaType: 'image' },
      { id: 's4', src: '/4.jpg', mediaType: 'image' },
    ],
  },
  {
    author: { id: 'a2', name: 'Bo', avatar: '/bo.jpg' },
    stories: [{ id: 's3', src: '/3.mp4', mediaType: 'video' }],
  },
];

@Component({
  template: `
    <rk-stories-overlay
      [isOpen]="isOpen()"
      [groups]="groups()"
      [desktopLayout]="desktopLayout()"
      [chromePlacement]="chromePlacement()"
      [minSegmentWidth]="minSegmentWidth()"
      (closed)="closed = closed + 1"
      (paused)="events.push('paused')"
      (resumed)="events.push('resumed')"
      (doubleTapped)="doubleTaps = doubleTaps + 1"
      (storyViewed)="viewedStories.push($event)"
      (apiReady)="api = $event"
    />
  `,
  imports: [RkStoriesOverlayComponent],
})
class HostComponent {
  viewedStories: { groupIndex: number; storyIndex: number }[] = [];
  isOpen: WritableSignal<boolean> = signal(true);
  groups: WritableSignal<StoriesGroup[]> = signal(GROUPS);
  desktopLayout: WritableSignal<DesktopLayout> = signal('single');
  chromePlacement: WritableSignal<ChromePlacement> = signal('overlay');
  minSegmentWidth: WritableSignal<number> = signal(8);
  closed = 0;
  doubleTaps = 0;
  events: string[] = [];
  api: StoriesApi | null = null;
}

function createHost(): ComponentFixture<HostComponent> {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture;
}

/** The group slider: the first reel the player renders. */
function outerReelOf(fixture: ComponentFixture<HostComponent>): ReelComponent {
  return fixture.debugElement.query(By.directive(ReelComponent))
    .componentInstance as ReelComponent;
}

/** Where the first group's story slider actually sits. */
function renderedStoryIndex(
  fixture: ComponentFixture<HostComponent>,
): number | undefined {
  const reel = innerReelsOf(fixture)[0] as unknown as {
    _controller: { state: { index: { value: number } } };
  };
  return reel?._controller.state.index.value;
}

/** One story slider per rendered group. */
function innerReelsOf(
  fixture: ComponentFixture<HostComponent>,
): ReelComponent[] {
  return fixture.debugElement
    .queryAll(By.css('rk-reel.rk-stories-stories'))
    .map((element) => element.componentInstance as ReelComponent);
}

/** Long enough for a queued slider move and its transition to finish. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 600));

describe('RkStoriesOverlayComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  afterEach(() => TestBed.resetTestingModule());

  describe('open state', () => {
    it('renders nothing while closed', () => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.componentInstance.isOpen.set(false);
      fixture.detectChanges();

      expect(
        fixture.debugElement.query(By.css('.rk-stories-overlay')),
      ).toBeNull();
    });

    it('is a labelled modal dialog when open', () => {
      const dialog = createHost().debugElement.query(
        By.css('.rk-stories-overlay'),
      ).nativeElement as HTMLElement;

      expect(dialog.getAttribute('role')).toBe('dialog');
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.getAttribute('aria-label')).toBe('Stories player');
    });

    // Closing is the consumer's to do: the player reports and stays put, so a
    // host that keeps it open sees no flicker.
    it('reports a close instead of closing itself', () => {
      const fixture = createHost();

      internalsOf(fixture).closed.emit();
      fixture.detectChanges();

      expect(fixture.componentInstance.closed).toBe(1);
      expect(
        fixture.debugElement.query(By.css('.rk-stories-overlay')),
      ).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it('hands over an imperative api once it is ready', () => {
      const api = createHost().componentInstance.api;
      expect(api).toBeTruthy();
      expect(typeof api?.nextStory).toBe('function');
      expect(typeof api?.goToGroup).toBe('function');
    });

    it('moves within a group and across groups through that api', () => {
      const fixture = createHost();
      const overlay = internalsOf(fixture);
      const api = fixture.componentInstance.api!;

      api.nextStory();
      expect(overlay.storiesCtrl.state.activeStoryIndex.value).toBe(1);

      api.nextGroup();
      expect(overlay.storiesCtrl.state.activeGroupIndex.value).toBe(1);
    });

    // The engine decides where the viewer is; the sliders follow it. A tap and
    // the timer would otherwise be able to disagree.
    it('follows the engine rather than the slider', () => {
      const fixture = createHost();
      const overlay = internalsOf(fixture);

      fixture.componentInstance.api!.nextStory();
      fixture.detectChanges();

      expect(overlay.activeStoryIndex()).toBe(1);
    });

    it('takes on groups that arrive while it is open', () => {
      const fixture = createHost();
      const overlay = internalsOf(fixture);

      fixture.componentInstance.groups.set([
        ...GROUPS,
        {
          author: { id: 'a3', name: 'Cy', avatar: '/cy.jpg' },
          stories: [{ id: 's4', src: '/4.jpg', mediaType: 'image' }],
        },
      ]);
      fixture.detectChanges();

      overlay.storiesCtrl.goToGroup(2);
      expect(overlay.storiesCtrl.state.activeGroupIndex.value).toBe(2);
    });
  });

  // The engine decides where the viewer is, but the viewer only sees what the
  // sliders show. Asserting the engine alone let the two drift apart.
  describe('the sliders follow the engine', () => {
    function innerIndexes(fixture: ComponentFixture<HostComponent>): number[] {
      return fixture.debugElement
        .queryAll(By.css('.rk-stories-slide-wrapper rk-reel'))
        .map(
          (reel) =>
            (
              reel.componentInstance as unknown as {
                _controller: { state: { index: { value: number } } };
              }
            )._controller.state.index.value,
        );
    }

    function outerIndex(fixture: ComponentFixture<HostComponent>): number {
      const outer = fixture.debugElement.query(
        By.css('.rk-stories-container rk-reel'),
      );
      return (
        outer.componentInstance as unknown as {
          _controller: { state: { index: { value: number } } };
        }
      )._controller.state.index.value;
    }

    /** Lets an in-flight slider transition finish before reading its index. */

    it("moves the active group's slider to the story the engine is on", async () => {
      const fixture = createHost();
      fixture.componentInstance.api!.nextStory();
      await settle();
      fixture.detectChanges();

      expect(
        internalsOf(fixture).storiesCtrl.state.activeStoryIndex.value,
      ).toBe(1);
      expect(innerIndexes(fixture)[0]).toBe(1);
    });

    it('moves the outer slider to the group the engine is on', async () => {
      const fixture = createHost();
      fixture.componentInstance.api!.nextGroup();
      await settle();
      fixture.detectChanges();

      expect(
        internalsOf(fixture).storiesCtrl.state.activeGroupIndex.value,
      ).toBe(1);
      expect(outerIndex(fixture)).toBe(1);
    });

    // The defect this suite was blind to: a slider ignores a move while it is
    // animating, so a viewer tapping faster than a transition left the slider
    // behind the engine for good — and a story it never reached never rendered.
    it('catches up when moves arrive faster than the transition', async () => {
      const fixture = createHost();
      fixture.componentInstance.api!.nextStory();
      fixture.componentInstance.api!.nextStory();
      fixture.componentInstance.api!.nextStory();
      await settle();
      await settle();
      fixture.detectChanges();

      const engine =
        internalsOf(fixture).storiesCtrl.state.activeStoryIndex.value;
      expect(engine).toBe(3);
      expect(innerIndexes(fixture)[0]).toBe(engine);
    });
  });

  describe('gestures', () => {
    it('leaves a heart and reports the reaction on a double tap', () => {
      const fixture = createHost();
      const overlay = internalsOf(fixture);

      overlay.onDoubleTap();
      fixture.detectChanges();

      expect(fixture.componentInstance.doubleTaps).toBe(1);
      expect(
        fixture.debugElement.queryAll(By.css('rk-heart-animation')),
      ).toHaveLength(1);
    });

    it('takes the heart away once its animation ends', () => {
      const fixture = createHost();
      const overlay = internalsOf(fixture);
      overlay.onDoubleTap();
      fixture.detectChanges();

      fixture.debugElement
        .query(By.css('.rk-stories-heart'))
        .nativeElement.dispatchEvent(new Event('animationend'));
      fixture.detectChanges();

      expect(
        fixture.debugElement.queryAll(By.css('rk-heart-animation')),
      ).toHaveLength(0);
    });

    it('pauses while a press is held and resumes when it goes', () => {
      const fixture = createHost();
      const overlay = internalsOf(fixture);

      overlay.onLongPressStart();
      expect(overlay.storiesCtrl.state.isPaused.value).toBe(true);
      expect(fixture.componentInstance.events).toContain('paused');

      overlay.onLongPressEnd();
      expect(overlay.storiesCtrl.state.isPaused.value).toBe(false);
      expect(fixture.componentInstance.events).toContain('resumed');
    });

    // Asserted on the rendered layer, not on the signal behind it: the signal
    // was already right while the bar stayed on screen.
    it('hides the interface while the press lasts, and not otherwise', () => {
      const fixture = createHost();
      const overlay = internalsOf(fixture);
      const hidden = () =>
        (
          fixture.debugElement.query(By.css('.rk-stories-ui-layer'))
            .nativeElement as HTMLElement
        ).classList.contains('rk-stories-ui-layer--hidden');

      expect(overlay.chromeVisible()).toBe(true);
      expect(hidden()).toBe(false);

      overlay.onLongPressStart();
      fixture.detectChanges();
      expect(overlay.chromeVisible()).toBe(false);
      expect(hidden()).toBe(true);

      overlay.onLongPressEnd();
      fixture.detectChanges();
      expect(overlay.chromeVisible()).toBe(true);
      expect(hidden()).toBe(false);
    });

    it('moves back on a tap in the left zone and on in the right', () => {
      const fixture = createHost();
      const overlay = internalsOf(fixture);
      overlay.sizeSignal.value = [400, 800];

      overlay.onTap({ localPosition: [380, 100] });
      expect(overlay.storiesCtrl.state.activeStoryIndex.value).toBe(1);

      overlay.onTap({ localPosition: [20, 100] });
      expect(overlay.storiesCtrl.state.activeStoryIndex.value).toBe(0);
    });
  });

  describe('keyboard', () => {
    it('closes on Escape', () => {
      const fixture = createHost();

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(fixture.componentInstance.closed).toBe(1);
    });

    it('moves through stories on the arrow keys', () => {
      const fixture = createHost();
      const overlay = internalsOf(fixture);

      overlay.onNavKey(1);
      expect(overlay.storiesCtrl.state.activeStoryIndex.value).toBe(1);

      overlay.onNavKey(-1);
      expect(overlay.storiesCtrl.state.activeStoryIndex.value).toBe(0);
    });
  });

  describe('template slots', () => {
    @Component({
      template: `
        <rk-stories-overlay [isOpen]="true" [groups]="groups">
          <ng-template rkStoriesHeader let-author let-story="story">
            <p class="custom-header">{{ author.name }} · {{ story.id }}</p>
          </ng-template>
          <ng-template rkStoriesNavigation let-nav>
            <button class="custom-next" (click)="nav.onNextStory()">on</button>
          </ng-template>
          <ng-template rkStoriesProgressBar let-group let-total="totalStories">
            <p class="custom-progress">
              {{ group.author.name }} of {{ total }}
            </p>
          </ng-template>
        </rk-stories-overlay>
      `,
      imports: [
        RkStoriesOverlayComponent,
        RkStoriesHeaderDirective,
        RkStoriesNavigationDirective,
        RkStoriesProgressBarDirective,
      ],
    })
    class SlottedHostComponent {
      groups = GROUPS;
    }

    function createSlotted(): ComponentFixture<SlottedHostComponent> {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [SlottedHostComponent] });
      const fixture = TestBed.createComponent(SlottedHostComponent);
      fixture.detectChanges();
      return fixture;
    }

    it('replaces the header and hands it the story on screen', () => {
      const header = createSlotted().debugElement.query(
        By.css('.custom-header'),
      ).nativeElement as HTMLElement;

      expect(header.textContent).toContain('Alice');
      expect(header.textContent).toContain('s1');
    });

    it('drops the built-in header once one is supplied', () => {
      expect(
        createSlotted().debugElement.query(By.css('rk-story-header')),
      ).toBeNull();
    });

    it('replaces both arrows and hands over the navigation callbacks', () => {
      const fixture = createSlotted();
      const overlay = fixture.debugElement.query(
        By.directive(RkStoriesContentComponent),
      ).componentInstance as unknown as OverlayInternals;

      expect(
        fixture.debugElement.query(By.css('.rk-stories-nav-btn')),
      ).toBeNull();

      fixture.debugElement.query(By.css('.custom-next')).nativeElement.click();

      expect(overlay.storiesCtrl.state.activeStoryIndex.value).toBe(1);
    });

    it('replaces the progress bar and hands over the group', () => {
      const fixture = createSlotted();
      const progress = fixture.debugElement.query(By.css('.custom-progress'))
        .nativeElement as HTMLElement;

      expect(progress.textContent).toContain('Alice of 4');
      expect(
        fixture.debugElement.query(By.css('rk-canvas-progress-bar')),
      ).toBeNull();
    });
  });

  // Three groups render at a time. Chrome built inside a group slide is drawn
  // once per rendered group and turns with the group transition.
  describe('where the chrome lives', () => {
    it('draws one interface layer for the whole player', () => {
      const layers = createHost().debugElement.queryAll(
        By.css('.rk-stories-ui-layer'),
      );

      expect(layers.length).toBe(1);
    });

    it('keeps it out of the sliding group, beside the slider', () => {
      const fixture = createHost();

      expect(
        fixture.debugElement.queryAll(
          By.css('.rk-stories-slide-wrapper .rk-stories-ui-layer'),
        ).length,
      ).toBe(0);
      expect(
        fixture.debugElement.queryAll(
          By.css('.rk-stories-ui-layer rk-canvas-progress-bar'),
        ).length,
      ).toBe(1);
      expect(
        fixture.debugElement.queryAll(
          By.css('.rk-stories-ui-layer rk-story-header'),
        ).length,
      ).toBe(1);
    });

    // A group of forty stories makes forty segments; below this width the bar
    // scrolls a window of them instead. Unreachable, it cannot be tuned.
    it('hands the progress bar its narrowest segment', () => {
      const fixture = createHost();
      const bar = fixture.debugElement.query(
        By.directive(RkCanvasProgressBarComponent),
      ).componentInstance as RkCanvasProgressBarComponent;

      expect(bar.config().minSegmentWidth).toBe(8);

      fixture.componentInstance.minSegmentWidth.set(24);
      fixture.detectChanges();

      expect(bar.config().minSegmentWidth).toBe(24);
    });

    it('follows the group the viewer moves to', () => {
      const fixture = createHost();
      fixture.componentInstance.api!.nextGroup();
      fixture.detectChanges();

      const header = fixture.debugElement.query(
        By.css('.rk-stories-ui-layer rk-story-header'),
      ).nativeElement as HTMLElement;

      expect(header.textContent).toContain('Bo');
    });
  });

  describe('a story that will not load', () => {
    function failActiveStory(
      fixture: ComponentFixture<HostComponent>,
    ): ComponentFixture<HostComponent> {
      const overlay = contentOf(fixture) as unknown as {
        onContentError: (groupIndex: number, storyIndex: number) => void;
      };
      overlay.onContentError(0, 0);
      fixture.detectChanges();
      return fixture;
    }

    // The controller reports one loading state for the player, so an error
    // drawn per group appears on every rendered group at once.
    it('reports it once, on the story that failed', () => {
      const fixture = failActiveStory(createHost());

      expect(
        fixture.debugElement.queryAll(By.css('.rk-stories-error')).length,
      ).toBe(1);
    });

    it('says what went wrong, not only the icon', () => {
      const error = failActiveStory(createHost()).debugElement.query(
        By.css('.rk-stories-error'),
      ).nativeElement as HTMLElement;

      expect(error.getAttribute('aria-label')).toBe('Content unavailable');
      expect(error.textContent).toContain('Content unavailable');
    });
  });

  // A slot template is declared in the consumer's component, so anything it
  // renders resolves services against the consumer's injector — the player's
  // own providers are not in it. Injecting one there fails the whole block,
  // and Angular drops it without a word: the region renders empty and the
  // loading state it would have cleared spins on.
  describe('a video story drawn from a slide template', () => {
    @Component({
      template: `
        <rk-stories-overlay [isOpen]="true" [groups]="groups">
          <ng-template
            rkStoriesSlide
            let-story
            let-groupIndex="groupIndex"
            let-index="index"
            let-activeGroupIndex="activeGroupIndex"
            let-activeStoryIndex="activeStoryIndex"
          >
            <rk-video-story-slide
              [src]="story.src"
              [groupIndex]="groupIndex"
              [storyIndex]="index"
              [activeGroupIndex]="activeGroupIndex"
              [activeStoryIndex]="activeStoryIndex"
            />
          </ng-template>
        </rk-stories-overlay>
      `,
      imports: [
        RkStoriesOverlayComponent,
        RkStoriesSlideDirective,
        RkVideoStorySlideComponent,
      ],
    })
    class VideoSlotHostComponent {
      groups: StoriesGroup[] = [
        {
          author: { id: 'a1', name: 'Alice', avatar: '/alice.jpg' },
          stories: [{ id: 'v1', src: '/1.mp4', mediaType: 'video' }],
        },
      ];
    }

    function createVideoHost(): ComponentFixture<VideoSlotHostComponent> {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [VideoSlotHostComponent] });
      const fixture = TestBed.createComponent(VideoSlotHostComponent);
      fixture.detectChanges();
      return fixture;
    }

    it('renders instead of being dropped', () => {
      expect(
        createVideoHost().debugElement.query(
          By.directive(RkVideoStorySlideComponent),
        ),
      ).not.toBeNull();
    });

    // The reason it renders: the slot is drawn through the player's own
    // injector, so the slide finds the player's sound state exactly as it
    // would from the player's own template.
    it('reaches the player sound state, so the header button still works', () => {
      const fixture = createVideoHost();
      const slide = fixture.debugElement.query(
        By.directive(RkVideoStorySlideComponent),
      );
      const content = fixture.debugElement.query(
        By.directive(RkStoriesContentComponent),
      );

      expect(slide.injector.get(SoundStateService)).toBe(
        content.injector.get(SoundStateService),
      );
    });
  });

  // Three groups are rendered at a time, so a group the viewer walks away from
  // is destroyed and built again on the way back. It has to be born where it
  // was left, or its first story shows for a frame before the slider moves.
  describe('a group the viewer returns to', () => {
    @Component({
      template: `<rk-stories-overlay [isOpen]="true" [groups]="groups" />`,
      imports: [RkStoriesOverlayComponent],
    })
    class ManyGroupsHostComponent {
      // A story count per group, so a rendered slider can be told apart from
      // its neighbours: virtualization reuses slots and does not keep them in
      // group order.
      groups: StoriesGroup[] = [3, 1, 2, 2].map((count, group) => ({
        author: { id: `a${group}`, name: `A${group}`, avatar: '/a.jpg' },
        stories: Array.from({ length: count }, (__, story) => ({
          id: `g${group}s${story}`,
          src: `/${group}-${story}.jpg`,
          mediaType: 'image' as const,
        })),
      }));
    }

    async function walkAwayAndBack(): Promise<
      ComponentFixture<ManyGroupsHostComponent>
    > {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [ManyGroupsHostComponent] });
      const fixture = TestBed.createComponent(ManyGroupsHostComponent);
      fixture.detectChanges();

      const content = fixture.debugElement.query(
        By.directive(RkStoriesContentComponent),
      ).componentInstance as unknown as OverlayInternals & {
        storiesCtrl: { nextStory: () => void };
      };

      // Every move is waited out: the sliders follow the engine through a
      // queue, so a step not given its transition leaves them all where they
      // started and the walk proves nothing.
      const step = async (move: () => void) => {
        move();
        await settle();
        fixture.detectChanges();
      };

      // Leave the first group from its last story, the way tapping on does.
      await step(() => content.storiesCtrl.nextStory());
      await step(() => content.storiesCtrl.nextStory());

      // Far enough that the first group leaves the window and is destroyed,
      // then back beside it so it is built again as a neighbour.
      await step(() => content.storiesCtrl.goToGroup(3));
      await step(() => content.storiesCtrl.goToGroup(1));

      return fixture;
    }

    it('is born on the story it was left on', async () => {
      const fixture = await walkAwayAndBack();
      const reel = fixture.debugElement
        .queryAll(By.css('rk-reel.rk-stories-stories'))
        .map(
          (element) =>
            element.componentInstance as unknown as {
              _controller: { state: { index: { value: number } } };
              count: () => number;
            },
        )
        .find((candidate) => candidate.count() === 3);

      expect(reel).toBeTruthy();
      expect(reel!._controller.state.index.value).toBe(2);
    });
  });

  // React and vue tear the player down when it closes, so their engine never
  // sees a second opening. This component stays alive, so reopening has to be
  // made to look like opening.
  describe('closing the player and opening it again', () => {
    function reopen(fixture: ComponentFixture<HostComponent>): void {
      fixture.componentInstance.isOpen.set(false);
      fixture.detectChanges();
      fixture.componentInstance.isOpen.set(true);
      fixture.detectChanges();
    }

    it('starts the group at its beginning, not where it was left', () => {
      const fixture = createHost();
      const overlay = internalsOf(fixture);

      fixture.componentInstance.api!.nextStory();
      fixture.componentInstance.api!.nextStory();
      fixture.detectChanges();
      expect(overlay.storiesCtrl.state.activeStoryIndex.value).toBe(2);

      reopen(fixture);

      expect(
        internalsOf(fixture).storiesCtrl.state.activeStoryIndex.value,
      ).toBe(0);
    });

    // The engine being right is half of it: the viewer sees the slider.
    it('renders that first story rather than the one left behind', () => {
      const fixture = createHost();
      fixture.componentInstance.api!.nextStory();
      fixture.componentInstance.api!.nextStory();
      fixture.detectChanges();

      reopen(fixture);

      expect(renderedStoryIndex(fixture)).toBe(0);
    });

    it('forgets where another group was left too', () => {
      const fixture = createHost();
      const overlay = internalsOf(fixture);

      overlay.storiesCtrl.goToGroup(1);
      fixture.detectChanges();
      reopen(fixture);

      expect(
        internalsOf(fixture).storiesCtrl.state.activeGroupIndex.value,
      ).toBe(0);
    });
  });

  // A slot exists so a consumer can rebuild a region out of the package's own
  // components. Handing it Angular signals leaves those components unable to
  // take them, which is what a template drawing a video story needs.
  describe('what the slots are handed', () => {
    it('gives a slide template the signals the video slide takes', () => {
      const overlay = contentOf(createHost()) as unknown as {
        slideContext: (
          groupIndex: number,
          storyIndex: number,
        ) => { activeGroupIndex: unknown; activeStoryIndex: unknown };
      };
      const context = overlay.slideContext(0, 0);

      for (const signal of [
        context.activeGroupIndex,
        context.activeStoryIndex,
      ]) {
        expect(typeof (signal as { value: number }).value).toBe('number');
      }
    });

    it('gives a progress bar template the signals the canvas bar takes', () => {
      const overlay = contentOf(createHost()) as unknown as {
        progressBarContext: (groupIndex: number) => {
          activeIndex: unknown;
          progress: unknown;
        };
      };
      const context = overlay.progressBarContext(0);

      expect(typeof (context.activeIndex as { value: number }).value).toBe(
        'number',
      );
      expect(typeof (context.progress as { value: number }).value).toBe(
        'number',
      );
    });
  });

  describe('which transition each axis runs', () => {
    it('cross-fades between the stories of one group', () => {
      const fixture = createHost();

      for (const reel of innerReelsOf(fixture)) {
        expect(reel.transition()).toBe(fadeTransition);
      }
    });

    it('gives whole groups the configured transition', () => {
      expect(outerReelOf(createHost()).transition()).toBe(cubeTransition);
    });

    // The cards beside the player travel with the outer slider, so a
    // three-dimensional transition would turn them on the way across.
    it('slides instead of turning once the carousel is the layout', () => {
      const fixture = createHost();
      fixture.componentInstance.desktopLayout.set('carousel');
      fixture.detectChanges();

      expect(outerReelOf(fixture).transition()).toBe(slideTransition);
    });
  });

  describe('with the progress bar and header in each group', () => {
    interface ChromeContext {
      groupIndex: number;
      isActive: boolean;
      storyIndex: number;
      isPaused: boolean;
      activeIndex: { value: number };
      progress: { value: number };
    }

    interface GroupChromeInternals {
      timerCtrl: { progress: { value: number } };
      progressBarContext: (groupIndex: number) => ChromeContext;
      headerContext: (groupIndex: number) => ChromeContext;
    }

    function createGroupHost(): ComponentFixture<HostComponent> {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.componentInstance.chromePlacement.set('group');
      fixture.detectChanges();
      return fixture;
    }

    function chromeOf(
      fixture: ComponentFixture<HostComponent>,
    ): GroupChromeInternals {
      return contentOf(fixture) as unknown as GroupChromeInternals;
    }

    function slides(fixture: ComponentFixture<HostComponent>): HTMLElement[] {
      return fixture.debugElement
        .queryAll(By.css('.rk-stories-slide-wrapper'))
        .map((slide) => slide.nativeElement as HTMLElement);
    }

    it('draws a progress bar and header inside every group slide', () => {
      const fixture = createGroupHost();

      expect(
        fixture.debugElement.queryAll(
          By.css('.rk-stories-container > .rk-stories-ui-layer'),
        ).length,
      ).toBe(0);
      const rendered = slides(fixture);
      expect(rendered.length).toBe(GROUPS.length);
      rendered.forEach((slide, groupIndex) => {
        expect(slide.querySelectorAll('rk-canvas-progress-bar').length).toBe(1);
        expect(
          slide.querySelector('.rk-stories-header-name')?.textContent,
        ).toContain(GROUPS[groupIndex].author.name);
      });
    });

    it('still leaves a heart on a double tap', () => {
      const fixture = createGroupHost();
      internalsOf(fixture).onDoubleTap();
      fixture.detectChanges();

      expect(
        fixture.debugElement.queryAll(By.css('rk-heart-animation')).length,
      ).toBe(1);
    });

    it('shows a neighbouring group where it will resume, with nothing played', () => {
      const fixture = createGroupHost();
      const bar = chromeOf(fixture).progressBarContext(1);
      const header = chromeOf(fixture).headerContext(1);

      expect(bar.isActive).toBe(false);
      expect(bar.groupIndex).toBe(1);
      expect(bar.activeIndex.value).toBe(0);
      expect(bar.progress.value).toBe(0);
      expect(header).toMatchObject({
        isActive: false,
        storyIndex: 0,
        isPaused: false,
      });
    });

    // A template calls these on every change detection. A neighbour handed
    // new signals each time would make its bar start over on every pass.
    it('hands a neighbouring bar the same signals until its state changes', () => {
      const fixture = createGroupHost();
      const first = chromeOf(fixture).progressBarContext(1);
      fixture.detectChanges();
      const second = chromeOf(fixture).progressBarContext(1);

      expect(second.activeIndex).toBe(first.activeIndex);
      expect(second.progress).toBe(first.progress);
    });

    it('follows the running story in the active group', () => {
      const fixture = createGroupHost();
      const chrome = chromeOf(fixture);

      expect(chrome.progressBarContext(0).isActive).toBe(true);
      expect(chrome.progressBarContext(0).progress).toBe(
        chrome.timerCtrl.progress,
      );

      fixture.componentInstance.api!.nextStory();
      fixture.detectChanges();
      expect(chrome.headerContext(0).storyIndex).toBe(1);

      fixture.componentInstance.api!.pause();
      fixture.detectChanges();
      expect(chrome.headerContext(0).isPaused).toBe(true);
    });

    it('hides the chrome of the active group during a long press', () => {
      const fixture = createGroupHost();
      const layer = () =>
        slides(fixture)[0].querySelector('.rk-stories-ui-layer')!;

      internalsOf(fixture).onLongPressStart();
      fixture.detectChanges();
      expect(layer().classList).toContain('rk-stories-ui-layer--hidden');

      internalsOf(fixture).onLongPressEnd();
      fixture.detectChanges();
      expect(layer().classList).not.toContain('rk-stories-ui-layer--hidden');
    });

    it('hands the new group the running bar once the group changes', () => {
      const fixture = createGroupHost();
      const chrome = chromeOf(fixture);

      fixture.componentInstance.api!.nextGroup();
      fixture.detectChanges();

      expect(chrome.progressBarContext(1).isActive).toBe(true);
      expect(chrome.progressBarContext(1).progress).toBe(
        chrome.timerCtrl.progress,
      );
      expect(chrome.progressBarContext(0).isActive).toBe(false);
      expect(chrome.progressBarContext(0).progress).not.toBe(
        chrome.timerCtrl.progress,
      );
    });

    it('keeps the group being left as it was while the player turns away from it', async () => {
      const fixture = createGroupHost();
      const chrome = chromeOf(fixture);
      fixture.componentInstance.api!.nextStory();
      fixture.detectChanges();
      chrome.timerCtrl.progress.value = 0.4;

      fixture.componentInstance.api!.nextGroup();
      fixture.detectChanges();

      const turning = chrome.progressBarContext(0);
      expect(turning.activeIndex.value).toBe(1);
      expect(turning.progress.value).toBeCloseTo(0.4);
      expect(chrome.headerContext(0).storyIndex).toBe(1);

      await settle();
      fixture.detectChanges();

      const resting = chrome.progressBarContext(0);
      expect(resting.activeIndex.value).toBe(1);
      expect(resting.progress.value).toBe(0);
    });

    it('shows a group that played to its end as complete while the player turns away', () => {
      const fixture = createGroupHost();
      const chrome = chromeOf(fixture);
      chrome.timerCtrl.progress.value = 1;

      fixture.componentInstance.api!.nextGroup();
      fixture.detectChanges();

      expect(chrome.progressBarContext(0).progress.value).toBe(1);
    });

    // A tap on a button inside the swipe area never reaches the tap zones; the
    // gesture controller in the core package ignores interactive elements.
    it('closes and pauses from the default header inside a group slide', () => {
      const fixture = createGroupHost();
      const slide = slides(fixture)[0];

      (slide.querySelector('[aria-label="Pause"]') as HTMLElement).click();
      expect(fixture.componentInstance.events).toContain('paused');

      (slide.querySelector('[aria-label="Close"]') as HTMLElement).click();
      expect(fixture.componentInstance.closed).toBe(1);
    });
  });

  describe('behaving like the react and vue players', () => {
    interface SlideInternals {
      timerCtrl: { start: (duration?: number) => void };
      _pendingTimerAction: (() => void) | null;
      slide: () => unknown;
      endSlide: () => void;
      onDurationReady: (
        groupIndex: number,
        storyIndex: number,
        durationMs: number,
      ) => void;
    }

    function slideInternalsOf(
      fixture: ComponentFixture<HostComponent>,
    ): SlideInternals {
      return contentOf(fixture) as unknown as SlideInternals;
    }

    function createCarouselHost(): ComponentFixture<HostComponent> {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.componentInstance.desktopLayout.set('carousel');
      fixture.detectChanges();
      fixture.componentInstance.viewedStories = [];
      return fixture;
    }

    it('plays the next story after a pause rather than keeping the header paused', () => {
      const fixture = createHost();
      fixture.componentInstance.api!.pause();
      fixture.detectChanges();

      fixture.componentInstance.api!.nextStory();
      fixture.detectChanges();

      expect(internalsOf(fixture).storiesCtrl.state.isPaused.value).toBe(false);
      expect(
        fixture.debugElement.query(By.css('[aria-label="Pause"]')),
      ).not.toBeNull();
    });

    // Watched on the player itself: by the time it closes, the overlay that
    // would pass the report on is already gone, but the viewed controller
    // would still have recorded the story.
    it('reports no story as viewed when it closes during a slide', () => {
      const fixture = createCarouselHost();
      const content = contentOf(fixture) as unknown as {
        storyViewed: { emit: (value: unknown) => void };
      };
      const reported = jest.spyOn(content.storyViewed, 'emit');
      internalsOf(fixture).storiesCtrl.goToGroup(1);
      fixture.detectChanges();

      fixture.componentInstance.isOpen.set(false);
      fixture.detectChanges();

      expect(reported).not.toHaveBeenCalled();
    });

    it('lets a slide started during another one run to its own end', fakeAsync(() => {
      const fixture = createCarouselHost();
      const content = slideInternalsOf(fixture);
      internalsOf(fixture).storiesCtrl.goToGroup(1);
      tick(500);
      internalsOf(fixture).storiesCtrl.goToGroup(0);
      tick(300);

      expect(content.slide()).not.toBeNull();

      tick(1000);
      expect(content.slide()).toBeNull();
      fixture.destroy();
      tick(100);
    }));

    it('keeps a paused player paused when a slide ends', () => {
      const fixture = createCarouselHost();
      const content = slideInternalsOf(fixture);
      internalsOf(fixture).storiesCtrl.goToGroup(1);
      const waiting = jest.fn();
      content._pendingTimerAction = waiting;
      fixture.componentInstance.api!.pause();

      content.endSlide();

      expect(waiting).not.toHaveBeenCalled();
    });

    it('moves focus into the player when a card it came from slides away', () => {
      const fixture = createCarouselHost();
      const card = fixture.debugElement.query(
        By.css('[aria-label="Open stories by Bo"]'),
      ).nativeElement as HTMLElement;
      card.focus();
      card.click();
      fixture.detectChanges();

      slideInternalsOf(fixture).endSlide();

      expect(document.activeElement?.classList).toContain('rk-stories-overlay');
    });

    it('draws a footer for the active group only', () => {
      @Component({
        template: `
          <rk-stories-overlay [isOpen]="true" [groups]="groups">
            <ng-template rkStoriesFooter let-story>
              <p class="custom-footer">{{ story.id }}</p>
            </ng-template>
          </rk-stories-overlay>
        `,
        imports: [RkStoriesOverlayComponent, RkStoriesFooterDirective],
      })
      class FooterHostComponent {
        groups = GROUPS;
      }

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [FooterHostComponent] });
      const fixture = TestBed.createComponent(FooterHostComponent);
      fixture.detectChanges();

      expect(
        fixture.debugElement.queryAll(By.css('.rk-stories-slide-wrapper'))
          .length,
      ).toBe(GROUPS.length);
      expect(
        fixture.debugElement.queryAll(By.css('.custom-footer')).length,
      ).toBe(1);
    });

    it('pauses and resumes a playing video along with a drag', () => {
      const fixture = createHost();
      internalsOf(fixture).storiesCtrl.goToGroup(1);
      fixture.detectChanges();
      const video = sharedStoryVideo();
      const pause = jest.spyOn(video, 'pause').mockImplementation(() => {
        /* noop */
      });
      const play = jest.spyOn(video, 'play').mockResolvedValue(undefined);
      const reel = outerReelOf(fixture) as unknown as {
        slideDragStart: { emit: () => void };
        slideDragEnd: { emit: () => void };
      };

      reel.slideDragStart.emit();
      expect(pause).toHaveBeenCalled();

      reel.slideDragEnd.emit();
      expect(play).toHaveBeenCalled();
    });

    it('lets a story duration win over the one the video reports', () => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.componentInstance.groups.set([
        {
          author: { id: 'a1', name: 'Alice', avatar: '/alice.jpg' },
          stories: [
            { id: 'v1', src: '/v1.mp4', mediaType: 'video', duration: 3000 },
            { id: 'v2', src: '/v2.mp4', mediaType: 'video' },
          ],
        },
      ]);
      fixture.detectChanges();
      const content = slideInternalsOf(fixture);
      content.timerCtrl.start(3000);
      const start = jest.spyOn(content.timerCtrl, 'start');

      content.onDurationReady(0, 0, 9000);
      content.onDurationReady(0, 1, 9000);

      expect(start).not.toHaveBeenCalled();
    });
  });
});
