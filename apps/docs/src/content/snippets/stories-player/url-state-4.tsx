const stories = useOverlayUrlState({
  param: 'story',
  ...urlIndexTwoAxisKey({
    outerCount: () => groups.length,
    innerCounts: () => groups.map((g) => g.stories.length),
    outerLocator: {
      locate: (index) => (index < groups.length ? index : null),
      identify: (index) => index,
      locateAsync: async (index) => {
        const loaded = await loadUntilGroup(index); // page up to it
        if (!loaded) return null; // exhausted — link names no group
        setGroups(loaded); // commit — the overlay renders from this state
        return index;
      },
    },
  }),
});
