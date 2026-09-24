import { Component, signal, type WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  createOverlayUrlState,
  cubeTransition,
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
import { RkStoriesUrlOverlayComponent } from './stories-url-overlay.component';
import type { ChromePlacement, StoriesApi } from '../types';

const GROUPS: StoriesGroup[] = [
  {
    author: { id: 'a1', name: 'Alice', avatar: '/alice.jpg' },
    stories: [
      { id: 's1', src: '/1.jpg', mediaType: 'image' },
      { id: 's2', src: '/2.jpg', mediaType: 'image' },
    ],
  },
  {
    author: { id: 'a2', name: 'Bo', avatar: '/bo.jpg' },
    stories: [{ id: 's3', src: '/3.jpg', mediaType: 'image' }],
  },
];

/**
 * The real URL controller over an in-memory history stack, so these cases
 * exercise the parameter round trip rather than a stub of it. The stack is
 * also what makes the entry cost of opening assertable.
 */
function createUrlState(initialSearch = ''): {
  controller: UrlStateController<TwoAxisPosition>;
  url: ReturnType<typeof createFakeUrlAdapter>;
} {
  const url = createFakeUrlAdapter(initialSearch);
  const controller = TestBed.runInInjectionContext(() =>
    createOverlayUrlState<TwoAxisIdentity<number, number>, TwoAxisPosition>({
      param: 'story',
      adapter: url.adapter,
      ...urlIndexTwoAxisKey({
        outerCount: () => GROUPS.length,
        innerCounts: () => GROUPS.map((group) => group.stories.length),
      }),
    }),
  ) as UrlStateController<TwoAxisPosition>;

  return { controller, url };
}

@Component({
  template: `
    <rk-stories-url-overlay
      [controller]="controller()"
      [groups]="groups"
      [chromePlacement]="chromePlacement"
      (closed)="closes = closes + 1"
      (apiReady)="api = $event"
    />
  `,
  imports: [RkStoriesUrlOverlayComponent],
})
class HostComponent {
  controller!: WritableSignal<UrlStateController<TwoAxisPosition>>;
  groups = GROUPS;
  chromePlacement: ChromePlacement = 'overlay';
  closes = 0;
  api: StoriesApi | null = null;
}

/** The overlay with the inputs that decide where a group opens. */
@Component({
  template: `
    <rk-stories-url-overlay
      [controller]="controller"
      [groups]="groups"
      [resumeStoryIndex]="resumeStoryIndex"
      [viewed]="viewed"
      (storyViewed)="viewedStories.push($event)"
    />
  `,
  imports: [RkStoriesUrlOverlayComponent],
})
class ResumeHostComponent {
  controller!: UrlStateController<TwoAxisPosition>;
  groups = GROUPS;
  resumeStoryIndex: ((groupIndex: number) => number) | undefined = undefined;
  viewed: StoriesViewedStateController | undefined = undefined;
  viewedStories: { groupIndex: number; storyIndex: number }[] = [];
}

function createResumeHost(
  initialSearch: string,
  configure: (host: ResumeHostComponent) => void,
): ComponentFixture<ResumeHostComponent> {
  const { controller } = createUrlState(initialSearch);
  const fixture = TestBed.createComponent(ResumeHostComponent);
  fixture.componentInstance.controller = controller;
  configure(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

function createHost(initialSearch = ''): {
  fixture: ComponentFixture<HostComponent>;
  url: ReturnType<typeof createFakeUrlAdapter>;
  controller: UrlStateController<TwoAxisPosition>;
} {
  const { controller, url } = createUrlState(initialSearch);
  const fixture = TestBed.createComponent(HostComponent);
  fixture.componentInstance.controller = signal(controller);
  fixture.detectChanges();
  return { fixture, url, controller };
}

describe('RkStoriesUrlOverlayComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent, ResumeHostComponent],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  // The same declared default as the plain overlay, so the input reads alike
  // in both places and in the generated reference.
  it('declares the cube as its default group transition', () => {
    const { fixture } = createHost();
    const overlay = fixture.debugElement.query(
      By.directive(RkStoriesUrlOverlayComponent),
    ).componentInstance as RkStoriesUrlOverlayComponent;

    expect(overlay.groupTransition()).toBe(cubeTransition);
  });

  it('stays closed while the parameter names nothing', () => {
    const { fixture } = createHost();
    expect(
      fixture.debugElement.query(By.css('.rk-stories-overlay')),
    ).toBeNull();
  });

  // This overlay hands its inputs to the player one by one, so a new one
  // reaches the player only if it is bound here too.
  it('draws the progress bar and header inside each group when asked', () => {
    const { controller } = createUrlState('?story=0.0');
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.controller = signal(controller);
    fixture.componentInstance.chromePlacement = 'group';
    fixture.detectChanges();

    expect(
      fixture.debugElement.queryAll(
        By.css('.rk-stories-slide-wrapper .rk-stories-ui-layer'),
      ).length,
    ).toBe(GROUPS.length);
  });

  it('opens on the story the parameter names', () => {
    const { fixture } = createHost('?story=1.0');

    expect(
      fixture.debugElement.query(By.css('.rk-stories-overlay')),
    ).toBeTruthy();
  });

  it('opens when the parameter arrives later, as a link does', () => {
    const { fixture, controller } = createHost();

    controller.set({ outer: 0, inner: 1 });
    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.css('.rk-stories-overlay')),
    ).toBeTruthy();
  });

  // The URL owns the open state, so closing clears the parameter; one back
  // step then leaves the player rather than the page.
  it('clears the parameter on close and reports it', () => {
    const { fixture, controller } = createHost('?story=0.0');

    fixture.debugElement
      .query(By.css('rk-stories-url-overlay'))
      .componentInstance['handleClosed']();
    fixture.detectChanges();

    expect(controller.position.value).toBeNull();
    expect(fixture.componentInstance.closes).toBe(1);
    expect(
      fixture.debugElement.query(By.css('.rk-stories-overlay')),
    ).toBeNull();
  });

  it('closes by clearing the parameter on Escape', () => {
    const { fixture, controller, url } = createHost('?story=0.0');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(controller.position.value).toBeNull();
    expect(fixture.componentInstance.closes).toBe(1);
    expect(url.adapter.read()).not.toContain('story');
    expect(
      fixture.debugElement.query(By.css('.rk-stories-overlay')),
    ).toBeNull();
  });

  // A shared link names the exact story; a remembered resume point must not
  // move the viewer off it.
  it('opens where the link points, whatever a resume callback suggests', () => {
    const fixture = createResumeHost('?story=0.0', (host) => {
      host.resumeStoryIndex = () => 1;
    });

    expect(fixture.componentInstance.viewedStories).toEqual([
      { groupIndex: 0, storyIndex: 0 },
    ]);
  });

  // The player picks its opening story while it first renders, so the store
  // has to be read before a link opens it: by the overlay while it is closed.
  it('reads the viewed store while its player is closed', () => {
    const storage = createFakeStorageAdapter({ initial: '["a1.s1"]' });
    const viewed = createStoriesViewedStateController({
      storageKey: 'seen',
      storage: storage.adapter,
      groups: () => GROUPS,
    });
    const fixture = createResumeHost('', (host) => {
      host.viewed = viewed;
    });

    expect(
      fixture.debugElement.query(By.css('.rk-stories-overlay')),
    ).toBeNull();
    expect(storage.counts.read).toBeGreaterThan(0);
    expect(viewed.viewedState.value.get('a1')).toBe(1);
  });

  // While the player is open it owns the position and the URL trails it, so
  // what landed in the address is the thing to read.
  it('writes both axes back as the viewer moves', () => {
    const { fixture, url } = createHost('?story=0.0');

    fixture.componentInstance.api!.nextStory();
    fixture.detectChanges();
    expect(url.entries[url.cursor].search).toContain('story=0.1');

    fixture.componentInstance.api!.nextGroup();
    fixture.detectChanges();
    expect(url.entries[url.cursor].search).toContain('story=1.');
  });

  // Opening costs one entry and every story after it replaces, so paging
  // through a feed never buries the back button.
  it('pushes once to open and replaces from then on', () => {
    const { fixture, url, controller } = createHost();

    controller.set({ outer: 0, inner: 0 });
    fixture.detectChanges();
    expect(url.counts.push).toBe(1);

    fixture.componentInstance.api!.nextStory();
    fixture.detectChanges();

    expect(url.counts.push).toBe(1);
    expect(url.counts.replace).toBeGreaterThan(0);
  });

  it('follows a controller swapped for another', () => {
    const { fixture } = createHost();
    const replacement = createUrlState('?story=1.0');

    fixture.componentInstance.controller.set(replacement.controller);
    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.css('.rk-stories-overlay')),
    ).toBeTruthy();
  });

  // Swapping controllers drops the old subscription: a position written to
  // the controller the component let go of must not reopen the player.
  it('stops following a controller it let go of', () => {
    const { fixture, controller } = createHost();
    const replacement = createUrlState();

    fixture.componentInstance.controller.set(replacement.controller);
    fixture.detectChanges();

    controller.set({ outer: 0, inner: 0 });
    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.css('.rk-stories-overlay')),
    ).toBeNull();
  });
});
