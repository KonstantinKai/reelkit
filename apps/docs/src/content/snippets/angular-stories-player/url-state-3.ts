// locateAsync is asked only when locate misses — the group the link names is
// past what the feed has loaded. Page up to it, commit, and answer with its
// index; the story half is re-bounded against whichever group it settles on.
const key = urlIndexTwoAxisKey({
  outerCount: () => this.groups().length,
  innerCounts: () => this.groups().map((group) => group.stories.length),
  outerLocator: {
    locate: (index) => (index < this.groups().length ? index : null),
    identify: (index) => index,
    locateAsync: async (index) => {
      const loaded = await this.loadUntilGroup(index);
      if (!loaded) return null; // exhausted — the link names no group
      this.groups.set(loaded); // commit — the player renders from this signal
      return index;
    },
  },
});
