protected readonly reel = createOverlayUrlState({
  param: 'reel',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => this.loaded().findIndex((x) => x.id === id),
    identify: (index) => this.loaded()[index].id,
  },
});
