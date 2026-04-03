import { TestBed } from '@angular/core/testing';
import { BodyLockService } from './body-lock.service';

describe('BodyLockService', () => {
  let service: BodyLockService;

  beforeEach(() => {
    jest.spyOn(window, 'scrollTo').mockImplementation(jest.fn());

    TestBed.configureTestingModule({});
    service = TestBed.inject(BodyLockService);

    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.style.overscrollBehavior = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.style.overscrollBehavior = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    jest.restoreAllMocks();
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

  it('lock() applies position fixed with negative top', () => {
    service.lock();
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.width).toBe('100%');
  });

  it('lock() compensates for scrollbar width when one exists', () => {
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

  it('lock() increments the reference count — styles applied only on first lock', () => {
    service.lock();

    document.body.style.overflow = 'scroll';
    document.body.style.paddingRight = '99px';

    service.lock();

    expect(document.body.style.overflow).toBe('scroll');
    expect(document.body.style.paddingRight).toBe('99px');

    service.unlock();
    expect(service.locked).toBe(true);

    service.unlock();
    expect(service.locked).toBe(false);
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

    service.unlock();

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

    service.lock();
    service.lock();

    service.unlock();
    expect(service.locked).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    service.unlock();
    expect(service.locked).toBe(false);
    expect(document.body.style.overflow).toBe('auto');
  });

  it('restores the original styles that were present before the first lock', () => {
    document.body.style.overflow = 'clip';
    document.body.style.paddingRight = '4px';

    service.lock();
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '20px';

    service.unlock();

    expect(document.body.style.overflow).toBe('clip');
    expect(document.body.style.paddingRight).toBe('4px');
  });

  it('calls window.scrollTo on unlock to restore scroll position', () => {
    service.lock();
    service.unlock();

    expect(window.scrollTo).toHaveBeenCalledWith(0, expect.any(Number));
  });
});
