import { Component, ElementRef, signal, viewChild } from '@angular/core';
import {
  RkStoriesOverlayComponent,
  RkStoriesRingListComponent,
  createStoriesViewedStateController,
} from '@reelkit/angular-stories-player';
import '@reelkit/angular-stories-player/styles.css';
import { groups } from './api';

@Component({
  selector: 'app-stories-tray',
  imports: [RkStoriesOverlayComponent, RkStoriesRingListComponent],
  template: `
    <div class="stories-tray">
      <div #tray>
        <rk-stories-ring-list
          [groups]="groups"
          [viewed]="viewed"
          (selected)="openAt($event)"
        />
      </div>

      <button type="button" class="forget" (click)="viewed.forget()">
        Forget what was seen
      </button>

      <rk-stories-overlay
        [isOpen]="open()"
        [groups]="groups"
        [initialGroupIndex]="startGroup()"
        [viewed]="viewed"
        (groupChanged)="lastGroup = $event"
        (closed)="close()"
      />
    </div>
  `,
  styles: `
    .stories-tray {
      padding: 16px;
    }

    .forget {
      margin-top: 12px;
      padding: 6px 14px;
      border: none;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.12);
      color: inherit;
      font-size: 13px;
      cursor: pointer;
    }
  `,
})
export class StoriesTrayComponent {
  protected readonly groups = groups;
  protected readonly open = signal(false);
  protected readonly startGroup = signal(0);
  protected lastGroup = 0;
  private readonly _tray = viewChild.required<ElementRef<HTMLElement>>('tray');

  // One controller for the rings and the player, kept in localStorage, so
  // what was seen survives a reload.
  protected readonly viewed = createStoriesViewedStateController({
    storageKey: 'stories-tray-seen',
    groups: () => groups,
  });

  protected openAt(groupIndex: number) {
    this.startGroup.set(groupIndex);
    this.lastGroup = groupIndex;
    this.open.set(true);
  }

  protected close() {
    this.open.set(false);
    // As it closes, the player hands focus back to the ring that opened it.
    // Wait one task for that, then move focus on to the ring of the person
    // the viewer stopped at, scrolled into view, so they continue from there.
    setTimeout(() => {
      const ring = this._tray()
        .nativeElement.querySelectorAll<HTMLElement>(
          '.rk-stories-ring-list-item',
        )
        [this.lastGroup]?.querySelector<HTMLElement>('[role="button"]');
      ring?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      ring?.focus({ preventScroll: true });
    });
  }
}
