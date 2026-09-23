import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StoriesPlayerPageComponent } from './stories-player-page.component';

/** The page's own state, which these cases drive directly. */
interface PageInternals {
  isOpen: { set: (open: boolean) => void };
  desktopLayout: {
    (): 'single' | 'carousel';
    set: (layout: 'single' | 'carousel') => void;
  };
  chromePlacement: {
    (): 'overlay' | 'group';
    set: (placement: 'overlay' | 'group') => void;
  };
  rememberSeen: { (): boolean; set: (remember: boolean) => void };
  groups: { (): unknown[] };
}

function createPage(): {
  fixture: ComponentFixture<StoriesPlayerPageComponent>;
  page: PageInternals;
} {
  const fixture = TestBed.createComponent(StoriesPlayerPageComponent);
  fixture.detectChanges();
  return {
    fixture,
    page: fixture.componentInstance as unknown as PageInternals,
  };
}

function loadMore(
  fixture: ComponentFixture<StoriesPlayerPageComponent>,
): HTMLElement | null {
  return (
    fixture.debugElement.query(By.css('.load-more-groups'))?.nativeElement ??
    null
  );
}

describe('StoriesPlayerPageComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [StoriesPlayerPageComponent] });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  // The switches are the page's own state, and a demo is flipped, reloaded
  // and looked at again — the same reason every other switch in this app
  // persists.
  describe('switch state across a reload', () => {
    it('keeps "remember seen" where it was left', () => {
      const first = createPage();
      first.page.rememberSeen.set(false);
      first.fixture.detectChanges();
      first.fixture.destroy();

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [StoriesPlayerPageComponent] });

      expect(createPage().page.rememberSeen()).toBe(false);
    });

    it('keeps the desktop layout where it was left', () => {
      const first = createPage();
      first.page.desktopLayout.set('carousel');
      first.fixture.detectChanges();
      first.fixture.destroy();

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [StoriesPlayerPageComponent] });

      expect(createPage().page.desktopLayout()).toBe('carousel');
    });

    it('keeps where the progress bar and header live where it was left', () => {
      const first = createPage();
      first.page.chromePlacement.set('group');
      first.fixture.detectChanges();
      first.fixture.destroy();

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [StoriesPlayerPageComponent] });

      expect(createPage().page.chromePlacement()).toBe('group');
    });
  });

  // The button belongs to the open player, not to the page under it: it sits
  // in the corner of the carousel beside the cards, the way react's does.
  // By text as well as by class: a page-level "Load more" of any shape is
  // the thing this rules out, not just one wearing the player's class.
  it('offers no load-more while the player is closed', () => {
    const { fixture } = createPage();
    const labels = fixture.debugElement
      .queryAll(By.css('button'))
      .map((button) => (button.nativeElement.textContent as string).trim());

    expect(loadMore(fixture)).toBeNull();
    expect(labels.some((label) => label.startsWith('Load'))).toBe(false);
  });

  it('offers load-more once the player is open on the carousel layout', () => {
    const { fixture, page } = createPage();

    page.desktopLayout.set('carousel');
    page.isOpen.set(true);
    fixture.detectChanges();

    expect(loadMore(fixture)).not.toBeNull();
  });

  // On the single layout the player fills the screen, so there is nowhere for
  // the button to sit without covering the story.
  it('keeps load-more away on the single layout', () => {
    const { fixture, page } = createPage();

    page.desktopLayout.set('single');
    page.isOpen.set(true);
    fixture.detectChanges();

    expect(loadMore(fixture)).toBeNull();
  });

  it('grows the feed when it is pressed', () => {
    const { fixture, page } = createPage();
    page.desktopLayout.set('carousel');
    page.isOpen.set(true);
    fixture.detectChanges();
    const before = page.groups().length;

    loadMore(fixture)!.click();
    fixture.detectChanges();

    expect(page.groups().length).toBeGreaterThan(before);
  });

  // The feed carries promo stories with no media of their own. Left to the
  // built-in image slide they are an <img> with an empty src — a blank story.
  describe('a story with no media of its own', () => {
    it('draws it from the page rather than leaving it blank', () => {
      const { fixture, page } = createPage();
      page.isOpen.set(true);
      fixture.detectChanges();

      const copy = fixture.debugElement
        .queryAll(By.css('app-story-card .copy'))
        .map((element) =>
          (element.nativeElement as HTMLElement).textContent!.replace(
            /\s+/g,
            ' ',
          ),
        )
        .join(' ');

      expect(copy).toContain('Flash Sale');
    });

    it('puts it on its own gradient', () => {
      const { fixture, page } = createPage();
      page.isOpen.set(true);
      fixture.detectChanges();

      const backgrounds = fixture.debugElement
        .queryAll(By.css('app-story-card .slide'))
        .map(
          (element) => (element.nativeElement as HTMLElement).style.background,
        );

      expect(
        backgrounds.some((value) => value.includes('linear-gradient')),
      ).toBe(true);
    });
  });
});
