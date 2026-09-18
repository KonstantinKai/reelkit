import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createBodyLock, sharedBodyLock } from './bodyLock';

describe('createBodyLock', () => {
  const saved = {
    overflow: '',
    paddingRight: '',
    overscrollBehavior: '',
    position: '',
    top: '',
    width: '',
  };

  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(vi.fn());
    const { style } = document.body;
    saved.overflow = style.overflow;
    saved.paddingRight = style.paddingRight;
    saved.overscrollBehavior = style.overscrollBehavior;
    saved.position = style.position;
    saved.top = style.top;
    saved.width = style.width;

    style.overflow = '';
    style.paddingRight = '';
    style.overscrollBehavior = '';
    style.position = '';
    style.top = '';
    style.width = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    const { style } = document.body;
    style.overflow = saved.overflow;
    style.paddingRight = saved.paddingRight;
    style.overscrollBehavior = saved.overscrollBehavior;
    style.position = saved.position;
    style.top = saved.top;
    style.width = saved.width;
  });

  it('applies lock styles on first lock', () => {
    const bodyLock = createBodyLock();
    bodyLock.lock();

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.width).toBe('100%');
    expect(document.body.style.overscrollBehavior).toBe('none');

    bodyLock.unlock();
  });

  it('reports locked state', () => {
    const bodyLock = createBodyLock();

    expect(bodyLock.locked).toBe(false);
    bodyLock.lock();
    expect(bodyLock.locked).toBe(true);
    bodyLock.unlock();
    expect(bodyLock.locked).toBe(false);
  });

  it('restores original styles on unlock', () => {
    document.body.style.overflow = 'auto';
    document.body.style.position = 'relative';
    document.body.style.paddingRight = '10px';

    const bodyLock = createBodyLock();
    bodyLock.lock();

    expect(document.body.style.overflow).toBe('hidden');

    bodyLock.unlock();

    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.position).toBe('relative');
    expect(document.body.style.paddingRight).toBe('10px');
  });

  it('restores scroll position on unlock', () => {
    const scrollToSpy = vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(vi.fn());

    const bodyLock = createBodyLock();
    bodyLock.lock();
    bodyLock.unlock();

    expect(scrollToSpy).toHaveBeenCalledWith(0, expect.any(Number));
  });

  it('reference counts multiple locks', () => {
    const bodyLock = createBodyLock();

    bodyLock.lock();
    bodyLock.lock();

    expect(bodyLock.locked).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    bodyLock.unlock();
    expect(bodyLock.locked).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    bodyLock.unlock();
    expect(bodyLock.locked).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('lock returns a disposer that calls unlock', () => {
    const bodyLock = createBodyLock();
    const dispose = bodyLock.lock();

    expect(bodyLock.locked).toBe(true);

    dispose();

    expect(bodyLock.locked).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('unlock is a no-op when not locked', () => {
    document.body.style.overflow = 'auto';

    const bodyLock = createBodyLock();
    bodyLock.unlock();

    expect(document.body.style.overflow).toBe('auto');
  });

  it('sets paddingRight based on scrollbar width', () => {
    const bodyLock = createBodyLock();
    bodyLock.lock();

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      expect(document.body.style.paddingRight).toBe(`${scrollbarWidth}px`);
    } else {
      expect(document.body.style.paddingRight).toBe('');
    }

    bodyLock.unlock();
  });
});

describe('sharedBodyLock', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(vi.fn());
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.paddingRight = '';
    document.body.style.overscrollBehavior = '';
  });

  afterEach(() => {
    while (sharedBodyLock.locked) sharedBodyLock.unlock();
    vi.restoreAllMocks();
  });

  it('is a singleton — same reference across imports', async () => {
    const again = (await import('./bodyLock')).sharedBodyLock;
    expect(again).toBe(sharedBodyLock);
  });

  it('interleaves two concurrent locks — restores only after both unlock', () => {
    const dispose1 = sharedBodyLock.lock();
    expect(document.body.style.overflow).toBe('hidden');

    const dispose2 = sharedBodyLock.lock();
    expect(document.body.style.overflow).toBe('hidden');

    dispose1();
    // First unlock must NOT restore — the second lock still holds
    expect(document.body.style.overflow).toBe('hidden');
    expect(sharedBodyLock.locked).toBe(true);

    dispose2();
    // Both released — body restored
    expect(document.body.style.overflow).toBe('');
    expect(sharedBodyLock.locked).toBe(false);
  });
});
