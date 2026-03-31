import { Injectable } from '@angular/core';
import { createBodyLock, type BodyLock } from '@reelkit/core';

/**
 * Locks/unlocks document body scroll, compensating for scrollbar width to
 * prevent layout shift. Shared across components via `providedIn: 'root'`.
 *
 * Uses reference counting so multiple concurrent callers (e.g. a lightbox
 * and a modal both open at once) can each call lock()/unlock() independently:
 * the body is only restored once the last caller releases it.
 *
 * Delegates to core's {@link createBodyLock} for the actual implementation.
 */
@Injectable({ providedIn: 'root' })
export class BodyLockService {
  private readonly bodyLock: BodyLock = createBodyLock();

  get locked(): boolean {
    return this.bodyLock.locked;
  }

  lock(): void {
    this.bodyLock.lock();
  }

  unlock(): void {
    this.bodyLock.unlock();
  }
}
