const photo = createOverlayUrlState({
  param: 'photo',
  ...urlStableIdKey({ items: () => this.images() }),
});
