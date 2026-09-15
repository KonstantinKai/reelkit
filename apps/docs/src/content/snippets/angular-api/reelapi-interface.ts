import { type ReelApi } from '@reelkit/angular';

@Component({ ... })
export class AppComponent {
  api: ReelApi | undefined;

  // In template: (apiReady)="api = $event"

  prev()  { this.api?.prev(); }
  next()  { this.api?.next(); }
  jump(i: number) { this.api?.goTo(i, true); }  // animated
}
