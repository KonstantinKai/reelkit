const stories = useOverlayUrlState({
  param: 'story',
  ...urlIndexTwoAxisKey({
    outerCount: () => groups.length,
    innerCounts: () => groups.map((g) => g.stories.length),
    // ?story=user_42.3
    outerCodec: { decode: (raw) => raw, encode: (id) => id },
    outerLocator: {
      locate: (id) => groups.findIndex((g) => g.author.id === id),
      identify: (index) => groups[index].author.id,
    },
    // Optional: ?story=user_42.story_7 — the story by id too
    innerCodec: { decode: (raw) => raw, encode: (id) => id },
    innerLocate: (outer, id) => {
      const index = groups[outer].stories.findIndex((s) => s.id === id);
      return index === -1 ? null : index;
    },
    innerIdentify: (outer, index) => groups[outer].stories[index].id,
  }),
});
