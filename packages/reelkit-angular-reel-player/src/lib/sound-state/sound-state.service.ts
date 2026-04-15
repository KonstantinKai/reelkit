import { DestroyRef, Injectable, inject } from '@angular/core';
import {
  createSoundController,
  toAngularSignal,
  type SoundController,
} from '@reelkit/angular';

/**
 * Angular DI wrapper around core's {@link createSoundController}.
 *
 * Provided at the component level by `RkReelPlayerOverlayComponent` so that
 * each player instance has its own isolated sound state.
 */
@Injectable()
export class SoundStateService {
  private readonly _ctrl: SoundController = createSoundController();
  private readonly _destroyRef = inject(DestroyRef);

  readonly muted = toAngularSignal(this._ctrl.muted, this._destroyRef);
  readonly disabled = toAngularSignal(this._ctrl.disabled, this._destroyRef);

  get controller(): SoundController {
    return this._ctrl;
  }

  toggle(): void {
    this._ctrl.toggle();
  }

  setDisabled(value: boolean): void {
    this._ctrl.disabled.value = value;
  }

  reset(): void {
    this._ctrl.muted.value = true;
    this._ctrl.disabled.value = false;
  }
}
