import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StoriesPlayerCustomPageComponent } from './stories-player-custom-page.component';
import { customDemos } from './custom-stories-feed';

/** The page's own state, which these cases drive directly. */
interface PageInternals {
  activeDemo: {
    (): string | null;
    set: (demo: string | null) => void;
  };
}

function createPage(): {
  fixture: ComponentFixture<StoriesPlayerCustomPageComponent>;
  page: PageInternals;
} {
  const fixture = TestBed.createComponent(StoriesPlayerCustomPageComponent);
  fixture.detectChanges();
  return {
    fixture,
    page: fixture.componentInstance as unknown as PageInternals,
  };
}

describe('StoriesPlayerCustomPageComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoriesPlayerCustomPageComponent],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  // The page exists to show what a slot can replace. One card per slot, the
  // same seven the react and vue pages carry, so the three read alike.
  it('offers a card for every slot demo', () => {
    const { fixture } = createPage();
    const titles = fixture.debugElement
      .queryAll(By.css('.demo-card h2'))
      .map((title) => (title.nativeElement.textContent as string).trim());

    expect(titles).toEqual(customDemos.map((demo) => demo.title));
  });

  it('describes each one rather than only naming it', () => {
    const { fixture } = createPage();
    const descriptions = fixture.debugElement
      .queryAll(By.css('.demo-card p'))
      .map((text) => (text.nativeElement.textContent as string).trim());

    expect(descriptions).toEqual(customDemos.map((demo) => demo.description));
  });

  it('keeps every player shut until a card is opened', () => {
    const { fixture } = createPage();

    expect(
      fixture.debugElement.queryAll(By.css('.rk-stories-overlay')),
    ).toHaveLength(0);
  });

  // One card opens one player: two at once would stack two dialogs over each
  // other, and only the demo that was asked for should be running.
  it('opens one player at a time', () => {
    const { fixture, page } = createPage();

    for (const demo of customDemos) {
      page.activeDemo.set(demo.id);
      fixture.detectChanges();

      expect(
        fixture.debugElement.queryAll(By.css('.rk-stories-overlay')),
      ).toHaveLength(1);
    }
  });

  it('shuts the player again when it reports a close', () => {
    const { fixture, page } = createPage();
    page.activeDemo.set('custom-header');
    fixture.detectChanges();

    const overlay = fixture.debugElement.query(By.css('rk-stories-overlay'))
      .componentInstance as { closed: { emit: () => void } };
    overlay.closed.emit();
    fixture.detectChanges();

    expect(page.activeDemo()).toBeNull();
    expect(
      fixture.debugElement.queryAll(By.css('.rk-stories-overlay')),
    ).toHaveLength(0);
  });

  describe('what each demo replaces', () => {
    function open(
      demo: string,
    ): ComponentFixture<StoriesPlayerCustomPageComponent> {
      const { fixture, page } = createPage();
      page.activeDemo.set(demo);
      fixture.detectChanges();
      return fixture;
    }

    it('draws the page header in place of the built-in one', () => {
      const fixture = open('custom-header');

      expect(
        fixture.debugElement.query(By.css('.custom-header')),
      ).not.toBeNull();
      expect(fixture.debugElement.query(By.css('rk-story-header'))).toBeNull();
    });

    it('draws a footer the player has none of its own', () => {
      expect(
        open('custom-footer').debugElement.query(
          By.css('.custom-footer input'),
        ),
      ).not.toBeNull();
    });

    it('replaces both arrows with the page buttons', () => {
      const fixture = open('custom-navigation');

      expect(
        fixture.debugElement.queryAll(By.css('.nav-column .pill')).length,
      ).toBe(4);
      expect(
        fixture.debugElement.query(By.css('.rk-stories-nav-btn')),
      ).toBeNull();
    });

    it('draws the bar in plain elements rather than canvas', () => {
      const fixture = open('custom-progress');

      expect(
        fixture.debugElement.query(By.css('app-html-progress-bar')),
      ).not.toBeNull();
      expect(
        fixture.debugElement.query(By.css('rk-canvas-progress-bar')),
      ).toBeNull();
    });

    // The test window is wider than the phone breakpoint, so the carousel is
    // the layout in use and its cards are drawn from the page's template.
    it('draws the carousel cards from the page template', () => {
      const fixture = open('custom-group-preview');

      expect(
        fixture.debugElement.queryAll(By.css('.rk-stories-card .preview-card'))
          .length,
      ).toBeGreaterThan(0);
      expect(
        fixture.debugElement.query(By.css('.rk-stories-card-button')),
      ).toBeNull();
    });

    // The theming demo changes nothing but custom properties, so the player
    // it opens is the built-in one, under an element carrying the tokens.
    it('themes the built-in player without replacing a region', () => {
      const fixture = open('theming');
      const themed = fixture.debugElement.query(By.css('.themed'));

      expect(themed.query(By.css('.rk-stories-overlay'))).not.toBeNull();
      expect(fixture.debugElement.query(By.css('.custom-header'))).toBeNull();
    });
  });
});
