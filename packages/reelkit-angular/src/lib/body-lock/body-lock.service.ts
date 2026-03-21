import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Locks/unlocks document body scroll, compensating for scrollbar width to
 * prevent layout shift. Shared across components via `providedIn: 'root'`.
 *
 * Uses reference counting so multiple concurrent callers (e.g. a lightbox
 * and a modal both open at once) can each call lock()/unlock() independently:
 * the body is only restored once the last caller releases it.
 *
 * SSR-safe: all `document`/`window` access is guarded by `isPlatformBrowser`,
 * so the service can be instantiated on the server without throwing.
 */
@Injectable({ providedIn: 'root' })
export class BodyLockService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private originalOverflow = '';
  private originalPaddingRight = '';
  /**
   * Number of active lock requests. Styles are applied on the first lock and
   * restored only when this count returns to zero.
   */
  private lockCount = 0;

  get locked(): boolean {
    return this.lockCount > 0;
  }

  lock(): void {
    if (!this.isBrowser) return;

    if (this.lockCount === 0) {
      // Capture original styles only on the very first lock.
      this.captureOriginalStyles();
      this.applyLockStyles();
    }
    this.lockCount++;
  }

  unlock(): void {
    if (!this.isBrowser) return;
    if (this.lockCount === 0) return;

    this.lockCount--;
    if (this.lockCount === 0) {
      document.body.style.overflow = this.originalOverflow;
      document.body.style.paddingRight = this.originalPaddingRight;
    }
  }

  private captureOriginalStyles(): void {
    this.originalOverflow = document.body.style.overflow;
    this.originalPaddingRight = document.body.style.paddingRight;
  }

  private applyLockStyles(): void {
    document.body.style.overflow = 'hidden';

    const scrollbarWidth = this.measureScrollbarWidth();
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  private measureScrollbarWidth(): number {
    return window.innerWidth - document.documentElement.clientWidth;
  }
}
