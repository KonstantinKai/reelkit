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
  createOverlayUrlState,
  cubeTransition,
  fadeTransition,
  slideTransition,
  urlIndexTwoAxisKey,
  type TwoAxisIdentity,
  type TwoAxisPosition,
  type UrlStateController,
} from '@reelkit/angular';
import {
  createFakeStorageAdapter,
  createFakeUrlAdapter,
} from '@reelkit/core/testing';
import {
  createStoriesViewedStateController,
  type StoriesGroup,
  type StoriesViewedStateController,
} from '@reelkit/stories-core';
import type { ChromePlacement, DesktopLayout } from '../types';
import { RkCanvasProgressBarComponent } from '../canvas-progress-bar/canvas-progress-bar.component';
import { RkStoriesOverlayComponent } from './stories-overlay.component';
import { RkStoriesUrlOverlayComponent } from './stories-url-overlay.component';
import { RkStoriesContentComponent } from '../stories-content/stories-content.component';
import {
  RkStoriesErrorDirective,
  RkStoriesFooterDirective,
  RkStoriesGroupPreviewDirective,
  RkStoriesHeaderDirective,
  RkStoriesLoadingDirective,
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
    .queryAll(By.css('.rk-stories-slide-wrapper > rk-reel'))
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
    // As with the react and vue players, the host always says whether the
    // player is open; there is no silent closed default to forget about.
    it('refuses to render without an isOpen binding', () => {
      const fixture = TestBed.createComponent(RkStoriesOverlayComponent);
      fixture.componentRef.setInput('groups', GROUPS);

      expect(() => fixture.detectChanges()).toThrow(/NG0950/);
    });

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
  // The stylesheet and the docs are shared with the react and vue players,
  // so a class only Angular emits is one no theme can rely on.
  it('emits no class the react and vue players do not', () => {
    const fixture = createHost();

    expect(
      fixture.debugElement.query(By.css('.rk-stories-stories')),
    ).toBeNull();
  });

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

      expect(bar.minSegmentWidth()).toBe(8);

      fixture.componentInstance.minSegmentWidth.set(24);
      fixture.detectChanges();

      expect(bar.minSegmentWidth()).toBe(24);
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
        .queryAll(By.css('.rk-stories-slide-wrapper > rk-reel'))
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

    // The react and vue slots name every value they hand over. The implicit
    // value stays too, for templates already written against it.
    it('names the main value of each slot beside the implicit one', () => {
      const overlay = contentOf(createHost()) as unknown as Record<
        string,
        (...indexes: number[]) => Record<string, unknown>
      >;

      const header = overlay['headerContext'](0);
      expect(header['author']).toBe(GROUPS[0].author);
      expect(header['$implicit']).toBe(GROUPS[0].author);

      const footer = overlay['footerContext'](0);
      expect(footer['story']).toBe(GROUPS[0].stories[0]);
      expect(footer['$implicit']).toBe(GROUPS[0].stories[0]);

      const slide = overlay['slideContext'](0, 1);
      expect(slide['story']).toBe(GROUPS[0].stories[1]);
      expect(slide['$implicit']).toBe(GROUPS[0].stories[1]);

      const bar = overlay['progressBarContext'](0);
      expect(bar['group']).toBe(GROUPS[0]);
      expect(bar['$implicit']).toBe(GROUPS[0]);

      const status = overlay['statusContext'](0);
      expect(status['story']).toBe(GROUPS[0].stories[0]);
      expect(status['$implicit']).toBe(GROUPS[0].stories[0]);
    });

    it('hands navigation its moves flat as well as grouped', () => {
      const fixture = createHost();
      const context = (
        contentOf(fixture) as unknown as {
          navigationContext: () => {
            $implicit: { onNextStory: () => void };
            onNextStory: () => void;
            onPrevStory: () => void;
            onPrevGroup: () => void;
            onNextGroup: () => void;
          };
        }
      ).navigationContext();

      expect(typeof context.$implicit.onNextStory).toBe('function');
      context.onNextStory();

      expect(
        internalsOf(fixture).storiesCtrl.state.activeStoryIndex.value,
      ).toBe(1);
      for (const move of [
        context.onPrevStory,
        context.onPrevGroup,
        context.onNextGroup,
      ]) {
        expect(typeof move).toBe('function');
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

describe('RkStoriesOverlayComponent desktop carousel', () => {
  interface StoryPosition {
    groupIndex: number;
    storyIndex: number;
  }

  const original = {
    width: window.innerWidth,
    height: window.innerHeight,
    matchMedia: Object.getOwnPropertyDescriptor(window, 'matchMedia'),
  };

  const setViewport = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: height,
    });
  };

  const threeGroups: StoriesGroup[] = [
    {
      author: { id: '1', name: 'Alice', avatar: '/alice.jpg' },
      stories: [
        { id: 's1', mediaType: 'image', src: '/img1.jpg' },
        { id: 's2', mediaType: 'image', src: '/img2.jpg' },
      ],
    },
    {
      author: { id: '2', name: 'Bob', avatar: '/bob.jpg' },
      stories: [{ id: 's3', mediaType: 'image', src: '/img3.jpg' }],
    },
    {
      author: { id: '3', name: 'Carol', avatar: '/carol.jpg' },
      stories: [
        { id: 's4', mediaType: 'image', src: '/img4.jpg' },
        { id: 's5', mediaType: 'image', src: '/img5.jpg' },
      ],
    },
  ];

  // A feed that loads another page while the player is open.
  const fourGroups: StoriesGroup[] = [
    ...threeGroups,
    {
      author: { id: '4', name: 'Dave', avatar: '/dave.jpg' },
      stories: [{ id: 's6', mediaType: 'image', src: '/img6.jpg' }],
    },
  ];

  // A story with no source starts its timer straight away and runs for the
  // given time; one with a source waits for an image that never loads here.
  const quickStory = (id: string, duration?: number) => ({
    id,
    mediaType: 'image' as const,
    src: '',
    duration,
  });
  const quickGroups = (carolDuration?: number): StoriesGroup[] => [
    threeGroups[0],
    {
      author: { id: '2', name: 'Bob', avatar: '/bob.jpg' },
      stories: [quickStory('quick-bob', 300)],
    },
    {
      author: { id: '3', name: 'Carol', avatar: '/carol.jpg' },
      stories: [quickStory('quick-carol', carolDuration)],
    },
  ];

  @Component({
    template: `
      <rk-stories-overlay
        [isOpen]="isOpen()"
        [groups]="groups()"
        [desktopLayout]="desktopLayout()"
        [initialGroupIndex]="initialGroupIndex"
        [initialStoryIndex]="initialStoryIndex"
        [resumeStoryIndex]="resumeStoryIndex"
        [viewed]="viewed"
        (closed)="closes = closes + 1"
        (groupChanged)="groupChanges.push($event)"
        (storyChanged)="storyChanges.push($event)"
        (storyViewed)="viewedStories.push($event)"
        (storyCompleted)="completedStories.push($event)"
        (apiReady)="api = $event"
      />
    `,
    imports: [RkStoriesOverlayComponent],
  })
  class CarouselHostComponent {
    readonly isOpen = signal(true);
    readonly groups = signal<StoriesGroup[]>(threeGroups);
    readonly desktopLayout = signal<DesktopLayout>('carousel');
    initialGroupIndex = 0;
    initialStoryIndex: number | undefined = undefined;
    resumeStoryIndex: ((groupIndex: number) => number) | undefined = undefined;
    viewed: StoriesViewedStateController | undefined = undefined;
    closes = 0;
    groupChanges: number[] = [];
    storyChanges: StoryPosition[] = [];
    viewedStories: StoryPosition[] = [];
    completedStories: StoryPosition[] = [];
    api: StoriesApi | null = null;
  }

  @Component({
    template: `
      <rk-stories-url-overlay
        [controller]="controller"
        [groups]="groups"
        [desktopLayout]="desktopLayout"
        [viewed]="viewed"
      />
    `,
    imports: [RkStoriesUrlOverlayComponent],
  })
  class UrlHostComponent {
    controller!: UrlStateController<TwoAxisPosition>;
    groups = threeGroups;
    desktopLayout: DesktopLayout = 'carousel';
    viewed: StoriesViewedStateController | undefined = undefined;
  }

  function createCarousel(
    configure?: (host: CarouselHostComponent) => void,
  ): ComponentFixture<CarouselHostComponent> {
    const fixture = TestBed.createComponent(CarouselHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  function createUrlOverlay(
    search: string,
    configure?: (host: UrlHostComponent) => void,
  ): {
    fixture: ComponentFixture<UrlHostComponent>;
    url: ReturnType<typeof createFakeUrlAdapter>;
  } {
    const url = createFakeUrlAdapter(search);
    const controller = TestBed.runInInjectionContext(() =>
      createOverlayUrlState<TwoAxisIdentity<number, number>, TwoAxisPosition>({
        param: 'story',
        adapter: url.adapter,
        ...urlIndexTwoAxisKey({
          outerCount: () => threeGroups.length,
          innerCounts: () => threeGroups.map((group) => group.stories.length),
        }),
      }),
    ) as UrlStateController<TwoAxisPosition>;
    const fixture = TestBed.createComponent(UrlHostComponent);
    fixture.componentInstance.controller = controller;
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return { fixture, url };
  }

  const element = (fixture: ComponentFixture<unknown>): HTMLElement =>
    fixture.nativeElement as HTMLElement;
  const overlayOf = (fixture: ComponentFixture<unknown>) =>
    element(fixture).querySelector('.rk-stories-overlay') as HTMLElement;
  const cardsOf = (fixture: ComponentFixture<unknown>) =>
    element(fixture).querySelectorAll('.rk-stories-card');
  const cardNamesOf = (fixture: ComponentFixture<unknown>) =>
    Array.from(
      element(fixture).querySelectorAll('.rk-stories-card-button'),
      (button) => button.getAttribute('aria-label'),
    );
  const cardButton = (fixture: ComponentFixture<unknown>, name: string) =>
    element(fixture).querySelector(
      `[aria-label="Open stories by ${name}"]`,
    ) as HTMLElement;
  const isSliding = (fixture: ComponentFixture<unknown>) =>
    overlayOf(fixture).classList.contains('rk-stories-overlay--sliding');
  const outerReelIn = (fixture: ComponentFixture<unknown>) =>
    fixture.debugElement.query(By.directive(ReelComponent))
      .componentInstance as ReelComponent;

  const advance = (fixture: ComponentFixture<unknown>, ms: number) => {
    jest.advanceTimersByTime(ms);
    fixture.detectChanges();
  };
  // Two animation frames lay the cards out and then set them moving.
  const nextFrames = (fixture: ComponentFixture<unknown>) =>
    advance(fixture, 40);
  // jsdom reports no transition duration, which leaves the time limit at its
  // margin.
  const endSlideOnTimeLimit = (fixture: ComponentFixture<unknown>) =>
    advance(fixture, 800);

  const openCard = (fixture: ComponentFixture<unknown>, name: string) => {
    cardButton(fixture, name).click();
    fixture.detectChanges();
  };
  const finishSlide = (fixture: ComponentFixture<unknown>, name: string) => {
    const card = cardButton(fixture, name).closest('.rk-stories-card')!;
    const event = new Event('transitionend', { bubbles: true });
    Object.defineProperty(event, 'propertyName', { value: 'transform' });
    card.dispatchEvent(event);
    fixture.detectChanges();
  };
  const pausePlayer = (fixture: ComponentFixture<unknown>) => {
    (
      element(fixture).querySelector('[aria-label="Pause"]') as HTMLElement
    ).click();
    fixture.detectChanges();
  };
  const isPlaying = (fixture: ComponentFixture<unknown>) =>
    element(fixture).querySelector('[aria-label="Pause"]') !== null;

  beforeEach(() => {
    // The story timer measures elapsed time through `performance` and paints
    // on animation frames, so both run on the fake clock with the timeouts.
    jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] });
    setViewport(1440, 900);
    TestBed.configureTestingModule({
      imports: [CarouselHostComponent, UrlHostComponent],
    });
  });

  afterEach(() => {
    // Torn down while the fake timers still stand in for animation frames;
    // the player cancels its pending frames on the way out.
    TestBed.resetTestingModule();
    setViewport(original.width, original.height);
    if (original.matchMedia) {
      Object.defineProperty(window, 'matchMedia', original.matchMedia);
    } else {
      Reflect.deleteProperty(window, 'matchMedia');
    }
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('shows no cards with the default layout', () => {
    const fixture = createCarousel((host) => host.desktopLayout.set('single'));

    expect(cardsOf(fixture)).toHaveLength(0);
    expect(outerReelIn(fixture).transition()).not.toBe(slideTransition);
  });

  it('shows the neighbouring groups beside the player on a desktop screen', () => {
    const fixture = createCarousel((host) => (host.initialGroupIndex = 1));

    expect(cardNamesOf(fixture)).toEqual([
      'Open stories by Alice',
      'Open stories by Carol',
    ]);
    expect(overlayOf(fixture).classList).toContain(
      'rk-stories-overlay--carousel',
    );
  });

  it('keeps the plain player and its group transition on a phone', () => {
    setViewport(768, 1024);
    const fixture = createCarousel();

    expect(cardsOf(fixture)).toHaveLength(0);
    expect(outerReelIn(fixture).transition()).not.toBe(slideTransition);
    expect(overlayOf(fixture).classList).not.toContain(
      'rk-stories-overlay--carousel',
    );
  });

  it('switches layout when the window crosses the phone breakpoint', () => {
    const fixture = createCarousel();
    expect(cardsOf(fixture).length).toBeGreaterThan(0);

    setViewport(600, 900);
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();
    expect(cardsOf(fixture)).toHaveLength(0);

    setViewport(1440, 900);
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();
    expect(cardsOf(fixture).length).toBeGreaterThan(0);
  });

  it('follows the layout input when it changes', () => {
    const fixture = createCarousel((host) => host.desktopLayout.set('single'));
    expect(cardsOf(fixture)).toHaveLength(0);

    fixture.componentInstance.desktopLayout.set('carousel');
    fixture.detectChanges();

    expect(cardsOf(fixture).length).toBeGreaterThan(0);
  });

  it('opens a clicked group once, on the story it resumes from', async () => {
    const fixture = createCarousel(
      (host) =>
        (host.resumeStoryIndex = (groupIndex) => (groupIndex === 2 ? 1 : 0)),
    );
    const host = fixture.componentInstance;
    host.groupChanges = [];
    host.storyChanges = [];
    const content = fixture.debugElement.query(
      By.directive(RkStoriesContentComponent),
    ).componentInstance as unknown as {
      _outerReel: { goTo: (index: number, animate: boolean) => unknown };
    };
    const goTo = jest.spyOn(content._outerReel, 'goTo');

    openCard(fixture, 'Carol');
    await jest.advanceTimersByTimeAsync(0);

    expect(host.groupChanges).toEqual([2]);
    expect(host.storyChanges.at(-1)).toEqual({ groupIndex: 2, storyIndex: 1 });
    // The player jumps straight to the group; the cards carry the motion.
    expect(goTo).toHaveBeenCalledWith(2, false);
  });

  it('writes the clicked group to the url', () => {
    const { fixture, url } = createUrlOverlay('?story=0.0');

    openCard(fixture, 'Bob');

    expect(url.adapter.read()).toBe('?story=1.0');
  });

  it('reports the opened story as viewed only once the slide ends', () => {
    const fixture = createCarousel();
    const host = fixture.componentInstance;
    host.viewedStories = [];

    openCard(fixture, 'Bob');
    nextFrames(fixture);
    expect(isSliding(fixture)).toBe(true);
    expect(host.viewedStories).toEqual([]);

    finishSlide(fixture, 'Bob');
    expect(host.viewedStories).toEqual([{ groupIndex: 1, storyIndex: 0 }]);
    expect(isSliding(fixture)).toBe(false);
  });

  // Leaving from the second story changes the story index on the way to Bob's
  // first; leaving from the first changes only the group, which asks nothing of
  // the timer on its own.
  it.each([
    ['another story index', 1],
    ['the same story index', 0],
  ])('holds the story timer until the slide ends, from %s', (_, from) => {
    // An image with no source starts its timer straight away, so the only
    // thing holding it back is the slide.
    const fixture = createCarousel((host) => {
      host.groups.set([
        threeGroups[0],
        {
          author: { id: '2', name: 'Bob', avatar: '/bob.jpg' },
          stories: [quickStory('quick', 300)],
        },
        threeGroups[2],
      ]);
      host.initialStoryIndex = from;
    });
    const host = fixture.componentInstance;

    // The story lasts 300ms, so without the slide holding the timer it would
    // be over by now.
    openCard(fixture, 'Bob');
    advance(fixture, 600);
    expect(isSliding(fixture)).toBe(true);
    expect(host.completedStories).toEqual([]);

    // No transition event arrives here, so the slide ends on its time limit.
    advance(fixture, 200);
    expect(isSliding(fixture)).toBe(false);
    expect(host.completedStories).toEqual([]);

    advance(fixture, 400);
    expect(host.completedStories).toEqual([{ groupIndex: 1, storyIndex: 0 }]);
  });

  it('leaves the timer stopped after a slide into a story still loading', () => {
    const fixture = createCarousel((host) => (host.initialStoryIndex = 1));

    // Leaving a paused player asks the timer to resume during the slide, and
    // the new story then resets it; the reset has to win.
    pausePlayer(fixture);
    openCard(fixture, 'Bob');
    endSlideOnTimeLimit(fixture);
    advance(fixture, 6000);

    expect(fixture.componentInstance.completedStories).toEqual([]);
  });

  it('drops a timer start asked for during the slide when the story then fails', () => {
    const fixture = createCarousel((host) => {
      host.groups.set(quickGroups());
      host.initialStoryIndex = 1;
    });
    const content = fixture.debugElement.query(
      By.directive(RkStoriesContentComponent),
    ).componentInstance as unknown as {
      onContentError: (groupIndex: number, storyIndex: number) => void;
    };

    openCard(fixture, 'Bob');
    nextFrames(fixture);
    content.onContentError(1, 0);

    endSlideOnTimeLimit(fixture);
    advance(fixture, 1000);

    expect(fixture.componentInstance.completedStories).toEqual([]);
  });

  it('starts the timer for the group opened last when a slide is interrupted', () => {
    const fixture = createCarousel((host) => {
      host.groups.set(quickGroups(5000));
      host.initialStoryIndex = 1;
    });
    const host = fixture.componentInstance;
    host.viewedStories = [];

    openCard(fixture, 'Bob');
    nextFrames(fixture);
    openCard(fixture, 'Carol');
    nextFrames(fixture);
    finishSlide(fixture, 'Carol');

    expect(host.viewedStories).toEqual([{ groupIndex: 2, storyIndex: 0 }]);

    // Bob's 300ms start was asked for first and must not run on Carol's story.
    advance(fixture, 1000);
    expect(host.completedStories).toEqual([]);
    advance(fixture, 4500);
    expect(host.completedStories).toEqual([{ groupIndex: 2, storyIndex: 0 }]);
  });

  it.each([
    ['another story index', 1],
    ['the same story index', 0],
  ])('resumes a paused player on a card click, from %s', (_, from) => {
    const fixture = createCarousel((host) => {
      host.groups.set(quickGroups());
      host.initialStoryIndex = from;
    });

    pausePlayer(fixture);
    openCard(fixture, 'Bob');
    endSlideOnTimeLimit(fixture);
    expect(isPlaying(fixture)).toBe(true);

    advance(fixture, 400);
    expect(fixture.componentInstance.completedStories).toContainEqual({
      groupIndex: 1,
      storyIndex: 0,
    });
  });

  it('resumes a paused player on a group change without the carousel too', () => {
    const fixture = createCarousel((host) => {
      host.groups.set(quickGroups());
      host.desktopLayout.set('single');
    });

    pausePlayer(fixture);
    fixture.componentInstance.api!.goToGroup(1);
    fixture.detectChanges();
    expect(isPlaying(fixture)).toBe(true);

    advance(fixture, 400);
    expect(fixture.componentInstance.completedStories).toContainEqual({
      groupIndex: 1,
      storyIndex: 0,
    });
  });

  // One controller does the whole viewed job for the player: card rings,
  // where a group opens, and recording what was shown.
  describe('given a viewed controller', () => {
    const viewedFor = (stored: string | null = null) => {
      const storage = createFakeStorageAdapter({ initial: stored });
      const viewed = createStoriesViewedStateController({
        storageKey: 'seen',
        storage: storage.adapter,
        groups: () => threeGroups,
      });
      return { storage, viewed };
    };
    const bobRing = (fixture: ComponentFixture<unknown>) =>
      element(fixture).querySelector(
        '[aria-label="Open stories by Bob"] .rk-stories-ring',
      ) as HTMLElement;

    it('draws the card rings from it and repaints them as stories are seen', () => {
      const { viewed } = viewedFor();
      const fixture = createCarousel((host) => (host.viewed = viewed));
      expect(bobRing(fixture).classList).toContain('rk-stories-ring--active');

      // Bob has one story, so one seen is the whole group.
      viewed.markViewed(1, 0);
      fixture.detectChanges();

      expect(bobRing(fixture).classList).not.toContain(
        'rk-stories-ring--active',
      );
    });

    it('records every story shown and still tells the consumer', () => {
      const { viewed, storage } = viewedFor();
      const fixture = createCarousel((host) => {
        host.viewed = viewed;
        host.desktopLayout.set('single');
      });

      expect(storage.stored).toBe('["1.s1"]');
      expect(fixture.componentInstance.viewedStories).toContainEqual({
        groupIndex: 0,
        storyIndex: 0,
      });
    });

    it('opens a group where the controller says it was left', () => {
      const { viewed } = viewedFor('["1.s1"]');
      viewed.attach();
      const fixture = createCarousel((host) => {
        host.viewed = viewed;
        host.desktopLayout.set('single');
      });

      expect(fixture.componentInstance.viewedStories).toContainEqual({
        groupIndex: 0,
        storyIndex: 1,
      });
    });

    it('lets an explicit resumeStoryIndex win over the controller', () => {
      const { viewed } = viewedFor('["1.s1"]');
      viewed.attach();
      const fixture = createCarousel((host) => {
        host.viewed = viewed;
        host.resumeStoryIndex = () => 0;
        host.desktopLayout.set('single');
      });

      expect(fixture.componentInstance.viewedStories).toContainEqual({
        groupIndex: 0,
        storyIndex: 0,
      });
    });

    // The player chooses its opening story while it first renders, so the
    // store has to be read before that: by the overlay, which exists while
    // the player is still closed, not by the player itself.
    it('reads the store while still closed, so the first open resumes', () => {
      const { viewed, storage } = viewedFor('["1.s1"]');
      const fixture = createCarousel((host) => {
        host.viewed = viewed;
        host.desktopLayout.set('single');
        host.isOpen.set(false);
      });
      expect(storage.counts.read).toBeGreaterThan(0);

      fixture.componentInstance.isOpen.set(true);
      fixture.detectChanges();

      expect(fixture.componentInstance.viewedStories).toContainEqual({
        groupIndex: 0,
        storyIndex: 1,
      });
    });

    it('stops following the store when it is destroyed', () => {
      const { viewed, storage } = viewedFor();
      const fixture = createCarousel((host) => {
        host.viewed = viewed;
        host.isOpen.set(false);
      });
      fixture.destroy();

      storage.fireExternalChange('["2.s3"]');

      expect(viewed.viewedState.value.get('2')).toBeUndefined();
    });

    it('is read by the url overlay while its player is closed', () => {
      const { storage, viewed } = viewedFor('["1.s1"]');
      createUrlOverlay('', (host) => (host.viewed = viewed));

      expect(storage.counts.read).toBeGreaterThan(0);
      expect(viewed.viewedState.value.get('1')).toBe(1);
    });
  });

  it('opens a group that arrived after the player did, from its card', () => {
    const fixture = createCarousel((host) => (host.initialGroupIndex = 2));
    const host = fixture.componentInstance;
    host.groups.set(fourGroups);
    fixture.detectChanges();
    host.viewedStories = [];

    openCard(fixture, 'Dave');
    nextFrames(fixture);
    finishSlide(fixture, 'Dave');

    expect(host.groupChanges).toEqual([3]);
    expect(host.viewedStories).toContainEqual({ groupIndex: 3, storyIndex: 0 });
  });

  it('moves on to a group that arrived late instead of closing, without the carousel too', () => {
    const fixture = createCarousel((host) => {
      host.initialGroupIndex = 2;
      host.desktopLayout.set('single');
    });
    const host = fixture.componentInstance;
    host.groups.set(fourGroups);
    fixture.detectChanges();

    host.api!.nextGroup();

    expect(host.closes).toBe(0);
    expect(host.groupChanges).toContain(3);
  });

  // The story a late group opens on has no source, so its timer starts at
  // once. It can only do that when the player reads the groups it has now.
  it('times the story of a group that arrived late', () => {
    const fixture = createCarousel((host) => {
      host.initialGroupIndex = 2;
      host.desktopLayout.set('single');
    });
    const host = fixture.componentInstance;
    host.groups.set([
      ...threeGroups,
      {
        author: { id: '4', name: 'Dave', avatar: '/dave.jpg' },
        stories: [quickStory('quick-dave', 300)],
      },
    ]);
    fixture.detectChanges();

    host.api!.goToGroup(3);
    advance(fixture, 400);

    expect(host.completedStories).toContainEqual({
      groupIndex: 3,
      storyIndex: 0,
    });
  });

  // jsdom resolves no stylesheet, so the duration a theme would give the cards
  // is reported by hand. The time limit has to wait for it, not cut it short.
  it('lets a slide themed longer than a second run to its end', () => {
    const computed = window.getComputedStyle.bind(window);
    jest
      .spyOn(window, 'getComputedStyle')
      .mockImplementation((target, pseudo) => {
        const style = computed(target, pseudo);
        return target.classList?.contains('rk-stories-card')
          ? Object.assign(Object.create(style), {
              transitionDuration: '1.5s, 1.5s',
            })
          : style;
      });
    const fixture = createCarousel();

    openCard(fixture, 'Bob');
    advance(fixture, 1400);
    expect(isSliding(fixture)).toBe(true);

    // Still no transition event: the limit ends the slide once the themed
    // duration has passed.
    advance(fixture, 1500);
    expect(isSliding(fixture)).toBe(false);
  });

  // The opened group's card leaves the page when the slide ends. Focus left on
  // it would fall to the document body, outside the dialog.
  it('keeps focus in the dialog after opening a group from a focused card', () => {
    const fixture = createCarousel();
    cardButton(fixture, 'Bob').focus();

    openCard(fixture, 'Bob');
    nextFrames(fixture);
    finishSlide(fixture, 'Bob');

    expect(document.activeElement).toBe(overlayOf(fixture));
  });

  it('leaves focus alone after a slide when it was not on a card', () => {
    const fixture = createCarousel();
    const close = element(fixture).querySelector(
      '[aria-label="Close"]',
    ) as HTMLElement;
    close.focus();

    openCard(fixture, 'Bob');
    nextFrames(fixture);
    finishSlide(fixture, 'Bob');

    expect(document.activeElement).toBe(close);
  });

  it('does not count a window resize as a slide', () => {
    const fixture = createCarousel();

    setViewport(1920, 1080);
    window.dispatchEvent(new Event('resize'));
    nextFrames(fixture);

    expect(isSliding(fixture)).toBe(false);
  });

  // Deliberate: the carousel slide ignores prefers-reduced-motion. Do not
  // add the check.
  it('slides even when the viewer prefers less motion', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    });
    const fixture = createCarousel();
    fixture.componentInstance.viewedStories = [];

    openCard(fixture, 'Bob');
    nextFrames(fixture);

    expect(isSliding(fixture)).toBe(true);
    expect(fixture.componentInstance.viewedStories).toEqual([]);
  });

  it('does not slide after a touch swipe has already moved the player', () => {
    const fixture = createCarousel();
    const host = fixture.componentInstance;
    host.viewedStories = [];

    outerReelIn(fixture).afterChange.emit({ index: 1, indexInRange: 1 });
    nextFrames(fixture);

    expect(isSliding(fixture)).toBe(false);
    expect(host.viewedStories).toContainEqual({ groupIndex: 1, storyIndex: 0 });
    expect(cardNamesOf(fixture)).toEqual([
      'Open stories by Alice',
      'Open stories by Carol',
    ]);
  });

  it('previews a custom story with no image through the slide template, inactive', () => {
    @Component({
      template: `
        <rk-stories-overlay
          [isOpen]="true"
          [groups]="groups"
          desktopLayout="carousel"
        >
          <ng-template
            rkStoriesSlide
            let-story
            let-isActive="isActive"
            let-size="size"
          >
            <div
              class="custom-slide"
              [attr.data-story]="story.id"
              [attr.data-active]="isActive"
              [attr.data-size]="size.join('x')"
            ></div>
          </ng-template>
        </rk-stories-overlay>
      `,
      imports: [RkStoriesOverlayComponent, RkStoriesSlideDirective],
    })
    class SlideHostComponent {
      groups: StoriesGroup[] = [
        threeGroups[0],
        {
          author: { id: '2', name: 'Bob', avatar: '/bob.jpg' },
          stories: [{ id: 'tip', mediaType: 'image', src: '' }],
        },
      ];
    }

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [SlideHostComponent] });
    const fixture = TestBed.createComponent(SlideHostComponent);
    fixture.detectChanges();

    const slide = element(fixture).querySelector(
      '.rk-stories-card [data-story="tip"]',
    ) as HTMLElement;
    expect(slide).not.toBeNull();
    expect(slide.dataset['active']).toBe('false');
    expect(slide.dataset['size']).toBe(outerReelIn(fixture).size()?.join('x'));
  });

  it('puts the cards after the player controls in the tab order', () => {
    const fixture = createCarousel();

    const isCard = Array.from(
      overlayOf(fixture).querySelectorAll('button'),
      (button) => button.classList.contains('rk-stories-card-button'),
    );

    expect(isCard).toContain(false);
    expect(isCard.indexOf(true)).toBe(isCard.lastIndexOf(false) + 1);
  });

  it('still closes on Escape', () => {
    const fixture = createCarousel();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(fixture.componentInstance.closes).toBe(1);
  });
});

// The cases the react and vue overlay specs prove about their inputs and
// outputs, proved here for the angular player.
describe('RkStoriesOverlayComponent inputs and outputs', () => {
  interface StoryPosition {
    groupIndex: number;
    storyIndex: number;
  }

  // Sources no other case in this file loads or fails, so the shared
  // preloader holds nothing about them and every story here is still loading.
  const groups: StoriesGroup[] = [
    {
      author: { id: 'io-1', name: 'Ann', avatar: '/io-ann.jpg' },
      stories: [
        { id: 'io-1-1', src: '/io-1-1.jpg', mediaType: 'image' },
        { id: 'io-1-2', src: '/io-1-2.jpg', mediaType: 'image' },
      ],
    },
    {
      author: { id: 'io-2', name: 'Ben', avatar: '/io-ben.jpg' },
      stories: [{ id: 'io-2-1', src: '/io-2-1.jpg', mediaType: 'image' }],
    },
    {
      author: { id: 'io-3', name: 'Cat', avatar: '/io-cat.jpg' },
      stories: [{ id: 'io-3-1', src: '/io-3-1.jpg', mediaType: 'image' }],
    },
  ];

  @Component({
    template: `
      <rk-stories-overlay
        [isOpen]="isOpen()"
        [groups]="groups()"
        [initialGroupIndex]="initialGroupIndex"
        [initialStoryIndex]="initialStoryIndex"
        [resumeStoryIndex]="resumeStoryIndex()"
        [ariaLabel]="ariaLabel"
        [enableKeyboard]="enableKeyboard()"
        [hideUIOnPause]="hideUIOnPause"
        (closed)="closes = closes + 1"
        (paused)="events.push('paused')"
        (resumed)="events.push('resumed')"
        (storyChanged)="storyChanges.push($event)"
        (groupChanged)="groupChanges.push($event)"
        (storyViewed)="viewedStories.push($event)"
        (storyCompleted)="completedStories.push($event)"
        (apiReady)="api = $event"
      />
    `,
    imports: [RkStoriesOverlayComponent],
  })
  class FullHostComponent {
    readonly isOpen = signal(true);
    readonly groups = signal<StoriesGroup[]>(groups);
    readonly resumeStoryIndex = signal<
      ((groupIndex: number) => number) | undefined
    >(undefined);
    readonly enableKeyboard = signal(true);
    initialGroupIndex = 0;
    initialStoryIndex: number | undefined = undefined;
    ariaLabel = 'Stories player';
    hideUIOnPause = true;
    closes = 0;
    events: string[] = [];
    storyChanges: StoryPosition[] = [];
    groupChanges: number[] = [];
    viewedStories: StoryPosition[] = [];
    completedStories: StoryPosition[] = [];
    api: StoriesApi | null = null;
  }

  function create(
    configure?: (host: FullHostComponent) => void,
  ): ComponentFixture<FullHostComponent> {
    const fixture = TestBed.createComponent(FullHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  const element = (fixture: ComponentFixture<unknown>): HTMLElement =>
    fixture.nativeElement as HTMLElement;
  const dialogOf = (fixture: ComponentFixture<unknown>) =>
    element(fixture).querySelector('.rk-stories-overlay') as HTMLElement;
  const contentIn = (fixture: ComponentFixture<unknown>) =>
    fixture.debugElement.query(By.directive(RkStoriesContentComponent))
      .componentInstance as unknown as OverlayInternals & {
      storiesCtrl: { onStoryTimerComplete: () => void };
      onContentError: (groupIndex: number, storyIndex: number) => void;
    };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [FullHostComponent] });
  });

  afterEach(() => TestBed.resetTestingModule());

  describe('remembering where a viewer got to', () => {
    it('reports the story it opened on as viewed', () => {
      const fixture = create((host) => (host.initialGroupIndex = 1));

      expect(fixture.componentInstance.viewedStories).toEqual([
        { groupIndex: 1, storyIndex: 0 },
      ]);
    });

    it('reports the opening story once, not again on the first navigation', () => {
      const fixture = create();

      fixture.componentInstance.api!.nextStory();

      expect(fixture.componentInstance.viewedStories).toEqual([
        { groupIndex: 0, storyIndex: 0 },
        { groupIndex: 0, storyIndex: 1 },
      ]);
    });

    it('opens the group it was given on the resumed story', () => {
      const fixture = create((host) => host.resumeStoryIndex.set(() => 1));

      expect(fixture.componentInstance.viewedStories).toEqual([
        { groupIndex: 0, storyIndex: 1 },
      ]);
    });

    // The timer is armed from the story the player actually opens on. Read
    // from the raw input instead, it would be handed no story, fall through to
    // the branch for a story with no media and count down over an image that
    // has not loaded; the header spinner, which follows that wait, tells the
    // two apart.
    it('arms the timer against the resumed story, not an absent one', () => {
      const fixture = create((host) => host.resumeStoryIndex.set(() => 1));

      expect(
        element(fixture).querySelector('.rk-stories-header-spinner'),
      ).not.toBeNull();
    });

    it('lets an explicit opening story beat the resume callback', () => {
      const fixture = create((host) => {
        host.initialStoryIndex = 0;
        host.resumeStoryIndex.set(() => 1);
      });

      expect(fixture.componentInstance.viewedStories).toEqual([
        { groupIndex: 0, storyIndex: 0 },
      ]);
    });

    it('opens an unvisited group where the resume callback points', () => {
      const fixture = create((host) => {
        host.initialGroupIndex = 1;
        host.resumeStoryIndex.set((groupIndex) => (groupIndex === 0 ? 1 : 0));
      });

      fixture.componentInstance.api!.prevGroup();

      expect(fixture.componentInstance.storyChanges).toContainEqual({
        groupIndex: 0,
        storyIndex: 1,
      });
    });

    it('honours a resume callback swapped in after it opened', () => {
      const fixture = create((host) => {
        host.initialGroupIndex = 1;
        host.resumeStoryIndex.set(() => 0);
      });

      fixture.componentInstance.resumeStoryIndex.set(() => 1);
      fixture.detectChanges();
      fixture.componentInstance.api!.prevGroup();

      expect(fixture.componentInstance.storyChanges).toContainEqual({
        groupIndex: 0,
        storyIndex: 1,
      });
    });

    it('leaves every group on its first story when no resume is given', () => {
      const fixture = create((host) => (host.initialGroupIndex = 1));

      fixture.componentInstance.api!.prevGroup();

      expect(fixture.componentInstance.storyChanges).toContainEqual({
        groupIndex: 0,
        storyIndex: 0,
      });
    });
  });

  describe('size', () => {
    const original = { width: window.innerWidth, height: window.innerHeight };
    const setViewport = (width: number, height: number) => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: width,
      });
      Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        value: height,
      });
    };
    const sizeOf = (fixture: ComponentFixture<unknown>): [number, number] =>
      (
        fixture.debugElement.query(By.directive(ReelComponent))
          .componentInstance as ReelComponent
      ).size() as [number, number];
    const openAt = (width: number, height: number) => {
      setViewport(width, height);
      return create();
    };

    afterEach(() => setViewport(original.width, original.height));

    it.each([
      [1280, 720, 387, 688],
      [1440, 900, 488, 868],
      [1920, 1080, 589, 1048],
      [2560, 1440, 792, 1408],
    ])(
      'fills the height of a %ix%i desktop window at 9:16',
      (width, height, expectedWidth, expectedHeight) => {
        const [actualWidth, actualHeight] = sizeOf(openAt(width, height));

        expect(Math.abs(actualWidth - expectedWidth)).toBeLessThanOrEqual(1);
        expect(Math.abs(actualHeight - expectedHeight)).toBeLessThanOrEqual(1);
      },
    );

    it('narrows to the room beside the arrows in a tall, narrow window', () => {
      const [width, height] = sizeOf(openAt(800, 1400));

      expect(width).toBe(648);
      expect(height).toBeCloseTo(1152, 5);
    });

    it.each([
      [768, 1024],
      [390, 844],
    ])('fills a %ix%i mobile screen', (width, height) => {
      expect(sizeOf(openAt(width, height))).toEqual([width, height]);
    });

    it('follows the window when it is resized', () => {
      const fixture = openAt(1440, 900);

      setViewport(1440, 1100);
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();

      const [width, height] = sizeOf(fixture);
      expect(height).toBe(1068);
      expect(width).toBeCloseTo(1068 * (9 / 16), 5);
    });
  });

  describe('keyboard', () => {
    const pressEscape = () =>
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    const navKeysOf = (fixture: ComponentFixture<unknown>) =>
      (
        fixture.debugElement.query(By.directive(ReelComponent))
          .componentInstance as ReelComponent
      ).enableNavKeys();

    it('handles the arrow keys and Escape by default', () => {
      const fixture = create();

      pressEscape();

      expect(navKeysOf(fixture)).toBe(true);
      expect(fixture.componentInstance.closes).toBe(1);
    });

    it('leaves the arrow keys and Escape alone when turned off', () => {
      const fixture = create((host) => host.enableKeyboard.set(false));

      pressEscape();

      expect(navKeysOf(fixture)).toBe(false);
      expect(fixture.componentInstance.closes).toBe(0);
    });

    it('follows the input when it changes while open', () => {
      const fixture = create();

      fixture.componentInstance.enableKeyboard.set(false);
      fixture.detectChanges();
      pressEscape();

      expect(navKeysOf(fixture)).toBe(false);
      expect(fixture.componentInstance.closes).toBe(0);
    });
  });

  describe('accessibility', () => {
    it('takes its label from ariaLabel', () => {
      const fixture = create((host) => (host.ariaLabel = 'Friend stories'));

      expect(dialogOf(fixture).getAttribute('aria-label')).toBe(
        'Friend stories',
      );
      expect(dialogOf(fixture).getAttribute('tabindex')).toBe('-1');
    });

    it('labels the arrows', () => {
      const fixture = create();

      expect(
        element(fixture).querySelector('[aria-label="Previous story"]'),
      ).not.toBeNull();
      expect(
        element(fixture).querySelector('[aria-label="Next story"]'),
      ).not.toBeNull();
    });

    it('takes focus when it opens and gives it back when it closes', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      trigger.focus();

      const fixture = create();
      expect(document.activeElement).toBe(dialogOf(fixture));

      fixture.componentInstance.isOpen.set(false);
      fixture.detectChanges();
      expect(document.activeElement).toBe(trigger);
      trigger.remove();
    });
  });

  describe('outputs', () => {
    it('reports a pause and a resume from the header button', () => {
      const fixture = create();
      const button = (label: string) =>
        element(fixture).querySelector(
          `[aria-label="${label}"]`,
        ) as HTMLElement;

      button('Pause').click();
      fixture.detectChanges();
      button('Play').click();

      expect(fixture.componentInstance.events).toEqual(['paused', 'resumed']);
    });

    it('closes after the last story of the last group completes', () => {
      const fixture = create((host) => (host.initialGroupIndex = 2));

      contentIn(fixture).storiesCtrl.onStoryTimerComplete();

      expect(fixture.componentInstance.completedStories).toEqual([
        { groupIndex: 2, storyIndex: 0 },
      ]);
      expect(fixture.componentInstance.closes).toBe(1);
    });
  });

  describe('interface', () => {
    it('keeps the interface on screen during a long press with hideUIOnPause off', () => {
      const fixture = create((host) => (host.hideUIOnPause = false));

      contentIn(fixture).onLongPressStart();
      fixture.detectChanges();

      expect(
        element(fixture).querySelector('.rk-stories-ui-layer')!.classList,
      ).not.toContain('rk-stories-ui-layer--hidden');
    });

    it('moves a story on a click and a group on a long press of an arrow', fakeAsync(() => {
      const fixture = create();
      const next = element(fixture).querySelector(
        '[aria-label="Next story"]',
      ) as HTMLElement;

      next.dispatchEvent(new Event('pointerdown'));
      next.dispatchEvent(new Event('pointerup'));
      expect(fixture.componentInstance.storyChanges).toContainEqual({
        groupIndex: 0,
        storyIndex: 1,
      });

      next.dispatchEvent(new Event('pointerdown'));
      tick(500);
      next.dispatchEvent(new Event('pointerup'));
      expect(fixture.componentInstance.groupChanges).toEqual([1]);

      fixture.destroy();
      tick(1000);
    }));

    // Angular inputs follow a new array rather than a mutated one, so a feed
    // that grows a group hands the player a copy with the story added.
    it('reaches a story added to a group it already has', () => {
      const fixture = create((host) => (host.initialGroupIndex = 1));

      fixture.componentInstance.groups.set(
        groups.map((group, index) =>
          index === 1
            ? {
                ...group,
                stories: [
                  ...group.stories,
                  { id: 'io-2-2', src: '/io-2-2.jpg', mediaType: 'image' },
                ],
              }
            : group,
        ),
      );
      fixture.detectChanges();
      fixture.componentInstance.api!.nextStory();

      expect(fixture.componentInstance.closes).toBe(0);
      expect(fixture.componentInstance.storyChanges).toEqual([
        { groupIndex: 1, storyIndex: 1 },
      ]);
    });
  });

  describe('template slots', () => {
    function createSlotted<T>(component: new () => T): ComponentFixture<T> {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [component] });
      const fixture = TestBed.createComponent(component);
      fixture.detectChanges();
      return fixture;
    }

    it('shows the loading template while the active story loads', () => {
      @Component({
        template: `
          <rk-stories-overlay [isOpen]="true" [groups]="groups">
            <ng-template rkStoriesLoading let-story="story">
              <p class="custom-loading">{{ story.id }}</p>
            </ng-template>
          </rk-stories-overlay>
        `,
        imports: [RkStoriesOverlayComponent, RkStoriesLoadingDirective],
      })
      class LoadingHostComponent {
        groups = groups;
      }

      const fixture = createSlotted(LoadingHostComponent);

      const loading = element(fixture).querySelectorAll('.custom-loading');
      expect(loading).toHaveLength(1);
      expect(loading[0].textContent?.trim()).toBe('io-1-1');
    });

    it('shows the error template once the active story fails', () => {
      @Component({
        template: `
          <rk-stories-overlay [isOpen]="true" [groups]="groups">
            <ng-template rkStoriesError let-story="story">
              <p class="custom-error">{{ story.id }}</p>
            </ng-template>
          </rk-stories-overlay>
        `,
        imports: [RkStoriesOverlayComponent, RkStoriesErrorDirective],
      })
      class ErrorHostComponent {
        groups = [
          {
            author: { id: 'io-e', name: 'Eve', avatar: '/io-eve.jpg' },
            stories: [{ id: 'io-e-1', src: '/io-e-1.jpg', mediaType: 'image' }],
          },
        ] as StoriesGroup[];
      }

      const fixture = createSlotted(ErrorHostComponent);
      expect(element(fixture).querySelector('.custom-error')).toBeNull();

      contentIn(fixture).onContentError(0, 0);
      fixture.detectChanges();

      expect(
        element(fixture).querySelector('.custom-error')?.textContent?.trim(),
      ).toBe('io-e-1');
      expect(element(fixture).querySelector('.rk-stories-error')).toBeNull();
    });

    it('draws the carousel cards from the group preview template', () => {
      @Component({
        template: `
          <rk-stories-overlay
            [isOpen]="true"
            [groups]="groups"
            desktopLayout="carousel"
          >
            <ng-template rkStoriesGroupPreview let-group="group">
              <span class="custom-card">{{ group.author.name }}</span>
            </ng-template>
          </rk-stories-overlay>
        `,
        imports: [RkStoriesOverlayComponent, RkStoriesGroupPreviewDirective],
      })
      class PreviewHostComponent {
        groups = groups;
      }

      const fixture = createSlotted(PreviewHostComponent);

      expect(
        Array.from(element(fixture).querySelectorAll('.custom-card'), (card) =>
          card.textContent?.trim(),
        ),
      ).toEqual(['Ben', 'Cat']);
      expect(
        element(fixture).querySelector('.rk-stories-card-button'),
      ).toBeNull();
    });

    it('tells a header and a bar above the player which group they draw, as active', () => {
      @Component({
        template: `
          <rk-stories-overlay [isOpen]="true" [groups]="groups">
            <ng-template
              rkStoriesHeader
              let-groupIndex="groupIndex"
              let-isActive="isActive"
            >
              <p class="custom-header">{{ groupIndex }} {{ isActive }}</p>
            </ng-template>
            <ng-template
              rkStoriesProgressBar
              let-groupIndex="groupIndex"
              let-isActive="isActive"
            >
              <p class="custom-bar">{{ groupIndex }} {{ isActive }}</p>
            </ng-template>
          </rk-stories-overlay>
        `,
        imports: [
          RkStoriesOverlayComponent,
          RkStoriesHeaderDirective,
          RkStoriesProgressBarDirective,
        ],
      })
      class FlagHostComponent {
        groups = groups;
      }

      const fixture = createSlotted(FlagHostComponent);
      const texts = (selector: string) =>
        Array.from(element(fixture).querySelectorAll(selector), (node) =>
          node.textContent?.trim(),
        );

      expect(texts('.custom-header')).toEqual(['0 true']);
      expect(texts('.custom-bar')).toEqual(['0 true']);
    });
  });
});
