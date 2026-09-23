import { ChangeDetectionStrategy, Component, Injector, inject, runInInjectionContext, type OnInit } from '@angular/core';
import {
  RkStoriesUrlOverlayComponent,
  RkStoriesRingListComponent,
  type StoriesGroup,
} from '@reelkit/angular-stories-player';
import {
  createOverlayUrlState,
  urlIndexTwoAxisKey,
  type TwoAxisPosition,
  type UrlStateController,
} from '@reelkit/angular';
import { createRouterUrlAdapter } from '@reelkit/angular/ng-router-url-adapter';

@Component({
  selector: 'app-url-feed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RkStoriesUrlOverlayComponent, RkStoriesRingListComponent],
  template: `
    <rk-stories-ring-list [groups]="groups" (selected)="open($event)" />
    <rk-stories-url-overlay [controller]="stories" [groups]="groups" />
  `,
})
export class UrlFeedComponent implements OnInit {
  private readonly injector = inject(Injector);

  protected groups: StoriesGroup[] = [];
  protected stories!: UrlStateController<TwoAxisPosition>;

  ngOnInit(): void {
    // Both the controller and the router adapter need an injection context,
    // and ngOnInit does not run in one, so borrow the component's.
    this.stories = runInInjectionContext(this.injector, () =>
      createOverlayUrlState({
        param: 'story',
        adapter: createRouterUrlAdapter(),
        ...urlIndexTwoAxisKey({
          outerCount: () => this.groups.length,
          innerCounts: () => this.groups.map((group) => group.stories.length),
        }),
      }),
    ) as UrlStateController<TwoAxisPosition>;
  }

  // Swiping only replaces the entry, so one back step always closes the
  // player rather than walking back through every story.
  protected open(groupIndex: number): void {
    this.stories.set(`${groupIndex}.0`);
  }
}
