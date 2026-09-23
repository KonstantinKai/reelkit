// Every group carries its own progress bar and header, so both turn with the
// group instead of switching above the player once it has changed.
@Component({
  template: `
    <rk-stories-overlay
      [isOpen]="isOpen()"
      [groups]="groups"
      chromePlacement="group"
      (closed)="isOpen.set(false)"
    />
  `,
})
export class GroupChromeFeedComponent {}
