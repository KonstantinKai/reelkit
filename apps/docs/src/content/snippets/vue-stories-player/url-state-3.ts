// A feed that pages. `locate` answers for the groups already loaded;
// `locateAsync` runs only when it misses, so a shared link to a group past
// the window fetches up to it and then opens.
outerLocator: {
  locate: (index) => (index < loaded.value.length ? index : null),
  identify: (index) => index,
  locateAsync: async (index) => {
    if (index >= totalGroups) return null;
    loaded.value = await fetchGroupsUpTo(index);
    return index;
  },
},
