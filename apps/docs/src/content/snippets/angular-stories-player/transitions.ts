import { cubeTransition, flipTransition, fadeTransition } from '@reelkit/angular';

@Component({
  template: `
    <!-- Between users only. Stories inside one user always cross-fade. -->
    <rk-stories-overlay
      [isOpen]="isOpen()"
      [groups]="groups"
      [groupTransition]="flip"
      [innerTransitionDuration]="200"
      (closed)="isOpen.set(false)"
    />
  `,
})
export class TransitionsComponent {
  protected readonly flip = flipTransition;
}
