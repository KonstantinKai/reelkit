import { DestroyRef, inject } from '@angular/core';
import { toAngularSignal } from '@reelkit/angular';
import { createSliderController } from '@reelkit/core';

// Custom component using low-level signal bridge
const destroyRef = inject(DestroyRef);
const controller = createSliderController({ count: 10 }, {});
const index = toAngularSignal(controller.state.index, destroyRef);
