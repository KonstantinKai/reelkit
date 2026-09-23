import type { StoriesApi } from '@reelkit/angular-stories-player';

@Component({
  template: `
    <rk-stories-overlay
      [isOpen]="isOpen()"
      [groups]="groups"
      (apiReady)="api = $event"
      (closed)="isOpen.set(false)"
    />
    <button type="button" (click)="api?.nextGroup()">Skip this user</button>
  `,
})
export class DrivenComponent {
  // Handed over once the player is ready to take orders, and again on every
  // open: the player is rebuilt each time, so keep the newest one.
  protected api: StoriesApi | null = null;
}
