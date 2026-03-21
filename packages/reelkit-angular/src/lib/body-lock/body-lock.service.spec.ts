import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { BodyLockService } from './body-lock.service';

describe('BodyLockService', () => {
  let service: BodyLockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BodyLockService);

    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  afterEach(() => {
    // Ensure body styles are restored even if the test failed.
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  it('starts in unlocked state', () => {
    expect(service.locked).toBe(false);
  });

  it('lock() sets body overflow to hidden', () => {
    service.lock();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('lock() sets the locked flag to true', () => {
    service.lock();
    expect(service.locked).toBe(true);
  });

  it('lock() compensates for scrollbar width when one exists', () => {
    // Simulate a 15 px scrollbar by making clientWidth < innerWidth.
    const originalInnerWidth = window.innerWidth;
    const originalClientWidth = document.documentElement.clientWidth;

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 1009,
    });

    service.lock();

    expect(document.body.style.paddingRight).toBe('15px');

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: originalClientWidth,
    });
  });

  it('lock() does not set paddingRight when scrollbar width is 0', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 1024,
    });

    document.body.style.paddingRight = '';
    service.lock();

    expect(document.body.style.paddingRight).toBe('');
  });

  it('lock() increments the reference count — styles are applied only on the first lock', () => {
    service.lock();
    const overflowAfterFirst = document.body.style.overflow;
    const paddingAfterFirst = document.body.style.paddingRight;

    // Change body styles manually between the two lock() calls to verify that
    // the second call does NOT re-capture or re-apply styles.
    document.body.style.overflow = 'scroll';
    document.body.style.paddingRight = '99px';

    // Second lock should NOT re-apply styles (styles were already applied on the first lock).
    service.lock();

    expect(document.body.style.overflow).toBe('scroll');
    expect(document.body.style.paddingRight).toBe('99px');

    // Both locks must be released before the service is fully unlocked.
    service.unlock(); // count: 2 → 1, still locked
    expect(service.locked).toBe(true);

    service.unlock(); // count: 1 → 0, now unlocked
    expect(service.locked).toBe(false);

    document.body.style.overflow = overflowAfterFirst;
    document.body.style.paddingRight = paddingAfterFirst;
  });

  it('unlock() restores original overflow style', () => {
    document.body.style.overflow = 'auto';

    service.lock();
    service.unlock();

    expect(document.body.style.overflow).toBe('auto');
  });

  it('unlock() restores original paddingRight style', () => {
    document.body.style.paddingRight = '8px';

    service.lock();
    service.unlock();

    expect(document.body.style.paddingRight).toBe('8px');
  });

  it('unlock() sets the locked flag back to false', () => {
    service.lock();
    service.unlock();

    expect(service.locked).toBe(false);
  });

  it('unlock() is idempotent — calling it when already unlocked is a no-op', () => {
    document.body.style.overflow = 'scroll';

    service.unlock(); // Should do nothing.

    expect(document.body.style.overflow).toBe('scroll');
    expect(service.locked).toBe(false);
  });

  it('supports multiple consecutive lock/unlock cycles', () => {
    document.body.style.overflow = 'visible';

    for (let i = 0; i < 3; i++) {
      service.lock();
      expect(document.body.style.overflow).toBe('hidden');
      expect(service.locked).toBe(true);

      service.unlock();
      expect(document.body.style.overflow).toBe('visible');
      expect(service.locked).toBe(false);
    }
  });

  it('body remains locked when a second locker unlocks before the first', () => {
    document.body.style.overflow = 'auto';

    service.lock(); // locker A
    service.lock(); // locker B

    service.unlock(); // locker B releases — body should still be locked
    expect(service.locked).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    service.unlock(); // locker A releases — now truly unlocked
    expect(service.locked).toBe(false);
    expect(document.body.style.overflow).toBe('auto');
  });

  it('restores the original styles that were present before the first lock', () => {
    document.body.style.overflow = 'clip';
    document.body.style.paddingRight = '4px';

    service.lock();
    // Simulate a resize that changes body styles while locked.
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '20px';

    service.unlock();

    // Must restore the original values, not the ones set while locked.
    expect(document.body.style.overflow).toBe('clip');
    expect(document.body.style.paddingRight).toBe('4px');
  });
});

// ─── SSR (server platform) tests ─────────────────────────────────────────────

describe('BodyLockService — SSR safety', () => {
  let service: BodyLockService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // Simulate the server-side rendering platform.
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    service = TestBed.inject(BodyLockService);

    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  it('lock() is a no-op on the server — does not touch document.body', () => {
    // In a real SSR environment document is not available; in jsdom it is but
    // the service must not mutate it on the server platform.
    expect(() => service.lock()).not.toThrow();
    expect(document.body.style.overflow).toBe('');
  });

  it('unlock() is a no-op on the server — does not throw', () => {
    expect(() => service.unlock()).not.toThrow();
  });

  it('locked stays false on the server after lock()', () => {
    service.lock();
    expect(service.locked).toBe(false);
  });
});
