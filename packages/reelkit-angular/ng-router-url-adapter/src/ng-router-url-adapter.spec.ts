import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import {
  Component,
  EnvironmentInjector,
  createEnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  Router,
  provideRouter,
  type ActivatedRouteSnapshot,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
  createUrlStateController,
  urlIndexKey,
  type UrlAdapter,
  type UrlChange,
} from '@reelkit/core';
import { createRouterUrlAdapter } from './ng-router-url-adapter';

// A real Angular Router over the testing location, so every notification,
// every state round trip, and every back step is the router's own doing
// rather than a mock's.
@Component({ template: '' })
class Page {}

/** The adapter, subscribed, plus the harness and router that drive it. */
const setUp = async (url: string) => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: 'gallery', component: Page },
        { path: 'home', component: Page },
      ]),
      provideLocationMocks(),
    ],
  });
  const harness = await RouterTestingHarness.create();
  const router = TestBed.inject(Router);
  const location = TestBed.inject(Location);
  // A bootstrapped application wires the router to the browser's back and
  // forward steps; the test bed leaves that to the test.
  router.setUpLocationChangeListener();

  // Created before the first navigation, the way an application does it.
  const adapter: UrlAdapter = TestBed.runInInjectionContext(
    createRouterUrlAdapter,
  );
  await harness.navigateByUrl(url);

  const changes: Array<UrlChange | undefined> = [];
  adapter.subscribe((change) => changes.push(change));

  return { adapter, changes, router, location, harness, settle };
};

/**
 * Lets a navigation run to completion. A back step reaches the router
 * through a timer it schedules outside the fixture's view, so the timer is
 * awaited first.
 */
const settle = async () => {
  await new Promise((done) => setTimeout(done, 0));
  await new Promise((done) => setTimeout(done, 0));
};

describe('createRouterUrlAdapter', () => {
  it('reads the query without the fragment', async () => {
    const { adapter } = await setUp('/gallery?photo=2#details');
    expect(adapter.read()).toBe('?photo=2');
  });

  it('reads no query when the question mark sits inside the fragment', async () => {
    const { adapter } = await setUp('/gallery#details?photo=2');
    expect(adapter.read()).toBe('');
  });

  it('reports a same-page push made through the router as push evidence', async () => {
    const { adapter, changes, harness } = await setUp('/gallery');

    await harness.navigateByUrl('/gallery?photo=2');

    expect(adapter.read()).toBe('?photo=2');
    expect(changes).toEqual([{ kind: 'push' }]);
  });

  it('reports a replace and a back step as such', async () => {
    const { adapter, changes, router, location, settle } =
      await setUp('/gallery');

    await router.navigateByUrl('/gallery?photo=2');
    await router.navigateByUrl('/gallery?photo=3', { replaceUrl: true });
    location.back();
    await settle();

    expect(changes).toEqual([
      { kind: 'push' },
      { kind: 'replace' },
      { kind: 'pop' },
    ]);
    expect(adapter.read()).toBe('');
  });

  it('reports no evidence for a push that arrived from another page', async () => {
    const { adapter, changes, harness } = await setUp('/home');

    await harness.navigateByUrl('/gallery?photo=2');

    expect(adapter.read()).toBe('?photo=2');
    expect(changes).toEqual([undefined]);
  });

  it('stops notifying after unsubscribe', async () => {
    const { adapter, harness } = await setUp('/gallery');
    const listener = jest.fn();
    adapter.subscribe(listener)();

    await harness.navigateByUrl('/gallery?photo=2');

    expect(listener).not.toHaveBeenCalled();
  });

  it('releases the router subscription when the injection context is destroyed', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideLocationMocks()],
    });
    // The router's events are a Subject underneath; `observed` is what shows
    // whether anyone still listens.
    const events = TestBed.inject(Router).events as unknown as {
      observed: boolean;
    };
    const injector = createEnvironmentInjector(
      [],
      TestBed.inject(EnvironmentInjector),
    );
    expect(events.observed).toBe(false);

    runInInjectionContext(injector, createRouterUrlAdapter);
    expect(events.observed).toBe(true);

    injector.destroy();

    expect(events.observed).toBe(false);
  });

  it('keeps the path, fragment, and the rest of the query through push, replace, and removal', async () => {
    const { adapter, router, settle } = await setUp(
      '/gallery?tag=a&tag=b&empty=&label=a%26b#details',
    );
    const search = () =>
      new URLSearchParams(
        router.parseUrl(router.url).queryParams as Record<string, string>,
      );
    const searchOf = (url: string) =>
      new URLSearchParams(url.slice(url.indexOf('?'), url.indexOf('#')));

    adapter.push('?tag=a&tag=b&empty=&label=a%26b&photo=2');
    await settle();
    expect(router.url.startsWith('/gallery?')).toBe(true);
    expect(router.url.endsWith('#details')).toBe(true);
    expect(searchOf(router.url).getAll('tag')).toEqual(['a', 'b']);
    expect(searchOf(router.url).get('empty')).toBe('');
    expect(searchOf(router.url).get('label')).toBe('a&b');
    expect(searchOf(router.url).get('photo')).toBe('2');

    adapter.replace('?tag=a&tag=b&empty=&label=a%26b&photo=3');
    await settle();
    expect(searchOf(router.url).get('photo')).toBe('3');
    expect(searchOf(router.url).getAll('tag')).toEqual(['a', 'b']);
    expect(router.url.endsWith('#details')).toBe(true);

    adapter.replace('?tag=a&tag=b&empty=&label=a%26b');
    await settle();
    expect(searchOf(router.url).has('photo')).toBe(false);
    expect(searchOf(router.url).getAll('tag')).toEqual(['a', 'b']);
    expect(searchOf(router.url).get('empty')).toBe('');
    expect(searchOf(router.url).get('label')).toBe('a&b');
    expect(router.url.endsWith('#details')).toBe(true);
    expect(search).toBeDefined();
  });

  it('starts a pushed entry from the given state and merges on replace', async () => {
    const { adapter, settle } = await setUp('/gallery');

    adapter.push('?photo=2', { open: true });
    await settle();
    expect(adapter.getState()).toMatchObject({ open: true });

    adapter.replace('?photo=3', { seen: 1 });
    await settle();
    expect(adapter.getState()).toMatchObject({ open: true, seen: 1 });
  });

  it('steps back one entry through the location service', async () => {
    const { adapter, router, settle } = await setUp('/gallery');
    await router.navigateByUrl('/gallery?photo=2');

    adapter.goBack();
    await settle();

    expect(adapter.read()).toBe('');
  });
});

describe('createRouterUrlAdapter driving a controller', () => {
  const setUpController = async (url: string) => {
    const context = await setUp(url);
    const controller = createUrlStateController({
      param: 'photo',
      adapter: context.adapter,
      ...urlIndexKey(() => 5),
    });
    controller.attach();
    return { ...context, controller };
  };

  it('closes a link-opened overlay with one back step and keeps the fragment', async () => {
    const { controller, router, location, adapter, changes, settle } =
      await setUpController('/gallery#details');
    const opened = location.path(true);

    await router.navigateByUrl('/gallery?photo=2#details');
    expect(controller.position.value).toBe(2);
    // The claim the controller makes on the way in is a router replace of
    // its own, to the URL the Router is already on; it has to land before
    // the entry reads as owned.
    await settle();
    expect(adapter.getState()).toMatchObject({ __rk_url_owner: 'photo' });

    controller.set(null);
    await settle();

    expect(location.path(true)).toBe(opened);
    expect(controller.position.value).toBeNull();
    // A pop, not an in-place clear: the same path reads back either way, so
    // the evidence is what tells the two apart.
    expect(changes.at(-1)).toEqual({ kind: 'pop' });
  });

  it('clears a cold deep link in place', async () => {
    const { controller, router, settle } = await setUpController(
      '/gallery?photo=2#details',
    );
    expect(controller.position.value).toBe(2);

    controller.set(null);
    await settle();

    expect(router.url).toBe('/gallery#details');
    expect(controller.position.value).toBeNull();
  });

  it('opens from a controller write and closes with one back step', async () => {
    const { controller, router, settle } = await setUpController('/gallery');

    controller.set(1);
    await settle();
    expect(controller.position.value).toBe(1);
    expect(router.url).toBe('/gallery?photo=1');

    controller.set(3);
    await settle();
    expect(router.url).toBe('/gallery?photo=3');

    controller.set(null);
    await settle();

    expect(router.url).toBe('/gallery');
    expect(controller.position.value).toBeNull();
  });

  it('closes locally when a guard refuses the opening navigation', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'gallery',
            component: Page,
            // A query change alone does not re-run guards by default.
            runGuardsAndResolvers: 'paramsOrQueryParamsChange',
            canActivate: [
              (route: ActivatedRouteSnapshot) =>
                !('photo' in route.queryParams),
            ],
          },
        ]),
        provideLocationMocks(),
      ],
    });
    const harness = await RouterTestingHarness.create();
    const router = TestBed.inject(Router);
    router.setUpLocationChangeListener();
    const adapter = TestBed.runInInjectionContext(createRouterUrlAdapter);
    await harness.navigateByUrl('/gallery');
    const controller = createUrlStateController({
      param: 'photo',
      adapter,
      ...urlIndexKey(() => 5),
    });
    controller.attach();

    controller.set(1);
    expect(controller.position.value).toBe(1);
    await harness.fixture.whenStable();
    expect(router.url).toBe('/gallery');

    controller.set(null);
    await harness.fixture.whenStable();

    expect(controller.position.value).toBeNull();
    expect(controller.value.value).toBeNull();
    expect(router.url).toBe('/gallery');
  });
});
