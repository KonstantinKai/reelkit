protected readonly reel = createOverlayUrlState({
  param: 'reel',
  adapter: createRouterUrlAdapter(),
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => this.loaded().findIndex((x) => x.id === id),
    identify: (index) => this.loaded()[index].id,
    locateAsync: async (id) => {
      const page = await this.loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!page) return null; // exhausted — link names no post
      this.loaded.set(page); // commit — the overlay renders from this state
      return page.findIndex((x) => x.id === id);
    },
  },
});
