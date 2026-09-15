protected readonly reel = createOverlayUrlState({
  param: 'reel',
  ...urlStableIdKey({ items: () => this.loaded() }),
});
