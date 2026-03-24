import { Injectable, signal } from '@angular/core';

/**
 * Holds the reactive sound state for the reel player.
 *
 * Provided at the component level by `RkReelPlayerOverlayComponent` so that
 * each player instance has its own isolated sound state.
 *
 * Writable signals are kept private; consumers read via the public readonly
 * accessors. Mutations go through the dedicated mutator methods so that
 * write access is never leaked to arbitrary callers.
 */
@Injectable()
export class SoundStateService {
  private readonly _muted = signal(true);
  private readonly _disabled = signal(false);

  /** Whether the player is currently muted. Read-only to external consumers. */
  readonly muted = this._muted.asReadonly();

  /**
   * Set to `true` while transitioning or when the active slide has no video,
   * to hide the sound control during those states. Read-only to external consumers.
   */
  readonly disabled = this._disabled.asReadonly();

  toggle(): void {
    this._muted.update((v) => !v);
  }

  setDisabled(value: boolean): void {
    this._disabled.set(value);
  }

  reset(): void {
    this._muted.set(true);
    this._disabled.set(false);
  }
}
