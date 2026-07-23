import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, type Event } from '@angular/router';
import { Subject } from 'rxjs';
import { createRouterUrlAdapter } from './ng-router-url-adapter';

function makeRouter(url = '/gallery?photo=1') {
  const events = new Subject<Event>();
  const navigate = jest.fn().mockResolvedValue(true);
  const router = { events, url, navigate } as unknown as Router;
  return { router, events, navigate };
}

function provideRouter(router: Router) {
  TestBed.configureTestingModule({
    providers: [{ provide: Router, useValue: router }],
  });
}

describe('createRouterUrlAdapter', () => {
  it('reads the query string out of the router url', () => {
    const { router } = makeRouter('/gallery?photo=1');
    provideRouter(router);

    const adapter = TestBed.runInInjectionContext(createRouterUrlAdapter);

    expect(adapter.read()).toBe('?photo=1');
  });

  it('notifies subscribers only when navigation completes', () => {
    const { router, events } = makeRouter();
    provideRouter(router);
    const adapter = TestBed.runInInjectionContext(createRouterUrlAdapter);

    const listener = jest.fn();
    adapter.subscribe(listener);

    // A mid-flight event that is not a NavigationEnd must be ignored.
    events.next({} as Event);
    expect(listener).not.toHaveBeenCalled();

    events.next(new NavigationEnd(1, '/gallery?photo=2', '/gallery?photo=2'));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('stops notifying after unsubscribe', () => {
    const { router, events } = makeRouter();
    provideRouter(router);
    const adapter = TestBed.runInInjectionContext(createRouterUrlAdapter);

    const dispose = adapter.subscribe(jest.fn());
    dispose();

    const listener = jest.fn();
    adapter.subscribe(listener);
    dispose();
    events.next(new NavigationEnd(1, '/x', '/x'));

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('releases the router subscription when the injection context is destroyed', () => {
    const { router, events } = makeRouter();
    provideRouter(router);
    TestBed.runInInjectionContext(createRouterUrlAdapter);

    expect(events.observed).toBe(true);

    TestBed.resetTestingModule();

    expect(events.observed).toBe(false);
  });

  it('pushes query params through the router', () => {
    const { router, navigate } = makeRouter();
    provideRouter(router);
    const adapter = TestBed.runInInjectionContext(createRouterUrlAdapter);

    adapter.push('?photo=3', { open: true });

    expect(navigate).toHaveBeenCalledWith([], {
      queryParams: { photo: '3' },
      state: { open: true },
    });
  });

  it('replaces the entry and merges state into what history already holds', () => {
    const { router, navigate } = makeRouter();
    provideRouter(router);
    window.history.replaceState({ keep: 1 }, '');
    const adapter = TestBed.runInInjectionContext(createRouterUrlAdapter);

    adapter.replace('?photo=3', { added: 2 });

    expect(navigate).toHaveBeenCalledWith([], {
      queryParams: { photo: '3' },
      replaceUrl: true,
      state: { keep: 1, added: 2 },
    });
  });

  it('steps back through the History API', () => {
    const { router } = makeRouter();
    provideRouter(router);
    const back = jest.spyOn(window.history, 'back').mockImplementation(() => {
      /* jsdom cannot navigate; assert the call only */
    });
    const adapter = TestBed.runInInjectionContext(createRouterUrlAdapter);

    adapter.goBack();

    expect(back).toHaveBeenCalled();
    back.mockRestore();
  });
});
