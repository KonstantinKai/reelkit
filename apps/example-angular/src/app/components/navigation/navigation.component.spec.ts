import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { NavigationComponent } from './navigation.component';
import { appRoutes } from '../../app.routes';

function navPaths(): string[] {
  const fixture = TestBed.createComponent(NavigationComponent);
  fixture.detectChanges();
  return fixture.debugElement
    .queryAll(By.css('a'))
    .map((link) => link.attributes['href'] ?? '');
}

describe('NavigationComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NavigationComponent],
      providers: [provideRouter(appRoutes)],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  // Every family reads plain, then URL, then custom — the order the React and
  // Vue demos use, so the three menus can be read against each other.
  it('lists each family as plain, then URL, then custom', () => {
    const paths = navPaths();
    const order = (path: string) => paths.indexOf(path);

    expect(order('/stories-player')).toBeGreaterThanOrEqual(0);
    expect(order('/stories-player-url')).toBeGreaterThan(
      order('/stories-player'),
    );
    expect(order('/stories-player-custom')).toBeGreaterThan(
      order('/stories-player-url'),
    );
  });

  it('points every link at a route the app knows', () => {
    const known = new Set(
      appRoutes
        .map((route) => route.path)
        .filter((path): path is string => path !== undefined && path !== '**')
        .map((path) => (path === '' ? '/' : `/${path}`)),
    );

    for (const path of navPaths()) {
      expect(known.has(path)).toBe(true);
    }
  });
});
