import { Injectable } from '@angular/core';
import { sharedBodyLock } from '@reelkit/core';

/**
 * Locks/unlocks document body scroll, compensating for scrollbar width to
 * prevent layout shift. Shared across components via `providedIn: 'root'`.
 *
 * Delegates to the shared `sharedBodyLock` singleton from core so
 * reference counting is consistent across all framework bindings and
 * survives re-provisioning in feature modules or micro-frontends.
 * Multiple concurrent callers (e.g. a lightbox and a modal both open
 * at once) can each call lock()/unlock() independently: the body is
 * only restored once the last caller releases it.
 */
@Injectable({ providedIn: 'root' })
export class BodyLockService {
  get locked(): boolean {
    return sharedBodyLock.locked;
  }

  lock(): void {
    sharedBodyLock.lock();
  }

  unlock(): void {
    sharedBodyLock.unlock();
  }
}
