import {
  RkStoriesOverlayComponent,
  RkStoriesHeaderDirective,
  RkStoriesFooterDirective,
} from '@reelkit/angular-stories-player';

@Component({
  imports: [
    RkStoriesOverlayComponent,
    RkStoriesHeaderDirective,
    RkStoriesFooterDirective,
  ],
  template: `
    <rk-stories-overlay [isOpen]="isOpen()" [groups]="groups" (closed)="isOpen.set(false)">
      <!-- The author is the implicit value; everything else is named. -->
      <ng-template rkStoriesHeader let-author let-onClose="onClose">
        <header class="my-header">
          <img [src]="author.avatar" [alt]="author.name" />
          <strong>{{ author.name }}</strong>
          <button type="button" (click)="onClose()">Close</button>
        </header>
      </ng-template>

      <!-- The player draws no footer of its own; this adds one. -->
      <ng-template rkStoriesFooter let-story let-author="author">
        <footer class="my-footer">Reply to {{ author.name }}</footer>
      </ng-template>
    </rk-stories-overlay>
  `,
})
export class SlottedComponent {}
