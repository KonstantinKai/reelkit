// `?story=alice.0` — the group by the author's stable id, the story by its
// position inside whichever group that id resolves to.
const stories = useOverlayUrlState({
  param: 'story',
  adapter: useVueRouterUrlAdapter(),
  ...urlIndexTwoAxisKey({
    outerCount: () => groups.value.length,
    innerCounts: () => groups.value.map((group) => group.stories.length),
    outerCodec: { decode: (raw) => raw, encode: (id) => id },
    outerLocator: {
      locate: (id) =>
        groups.value.findIndex((group) => group.author.id === id),
      identify: (index) => groups.value[index].author.id,
    },
  }),
});
