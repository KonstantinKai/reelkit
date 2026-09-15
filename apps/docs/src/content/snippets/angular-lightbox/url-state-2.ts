import { createRouterUrlAdapter } from '@reelkit/angular/ng-router-url-adapter';

const adapter = createRouterUrlAdapter();

const photo = createOverlayUrlState({
  param: 'photo',
  adapter,
  ...urlIndexKey(() => this.images().length),
});
