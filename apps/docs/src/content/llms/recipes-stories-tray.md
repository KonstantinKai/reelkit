---
title: Stories Tray
url: https://reelkit.dev/docs/recipes/stories-tray
section: Recipes
order: 5
desc: A row of story rings that opens the stories player and remembers what the viewer has seen across reloads.
---

# Stories Tray

Ring row at top of feed: one per person, bright while something new, muted once all seen. Ring press → stories open at first unseen one. Next visit, even after reload, remembers where viewer got to.

`./api` = stand-in for backend: `groups` (people followed + their stories, shape of player's `StoriesGroup`). Page shows `api.ts` above demo. **Warning:** `cdnUrl` builds cdn.reelkit.dev links, served only to ReelKit sites → point `avatar` + `src` at own files before copying.

## Why it works

- **One controller remembers for both.** `createStoriesViewedStateController({ storageKey, groups: () => groups })` created once, passed as `viewed` to ring list + player. Rings read it, player records every story shown, kept in `localStorage` → reload changes nothing.
- **Player picks up where viewer left off.** With `viewed`, player opens person at first unseen story, or from start once all seen. Recipe passes only person, never story index.
- **Ring has two states.** Bright = something left; muted (`rk-stories-ring--active` gone) = watched to end. Progress within person = player's progress bar.
- **Ring colours follow page.** States = tokens `--rk-stories-ring-active-gradient` / `--rk-stories-ring-viewed-color`; watched default = faint white for dark page. Light page → set on `.rk-stories-ring-list` (demo does in light theme), not `:root`: player's desktop carousel draws rings w/ same tokens on dark backdrop.
- **No extra wiring.** Player always rendered, opened with `isOpen` → reads stored state itself before choosing first story. Mounting only while open needs page to attach controller first (`useAttachViewedState` / `attachViewedState`).
- **Focus back to right ring.** Player returns focus to opening ring as it closes, after close handler → recipe waits one task (`setTimeout`), then scrolls last-watched person's ring (`.rk-stories-ring-list-item [role="button"]` by index) into view + focuses it. Track person with `onGroupChange` / `@group-change` / `(groupChanged)`.
- **Other storage.** `storage` = own adapter (server → follows viewer across devices). `ttlMs` expires entries, `maxTracks` caps people kept. `viewed.forget()` starts over.

## React

```tsx
export default function StoriesTray() {
  const [{ open, startGroup, lastGroup, viewed }] = useState(() => ({
    open: createSignal(false),
    startGroup: createSignal(0),
    lastGroup: createSignal(0),
    viewed: createStoriesViewedStateController({
      storageKey: 'stories-tray-seen',
      groups: () => groups,
    }),
  }));
  const tray = useRef<HTMLDivElement>(null);

  const openAt = (groupIndex: number) => {
    startGroup.value = groupIndex;
    lastGroup.value = groupIndex;
    open.value = true;
  };

  const close = () => {
    open.value = false;
    setTimeout(() => {
      const ring = tray.current
        ?.querySelectorAll<HTMLElement>('.rk-stories-ring-list-item')
        [lastGroup.value]?.querySelector<HTMLElement>('[role="button"]');
      ring?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      ring?.focus({ preventScroll: true });
    });
  };

  return (
    <>
      <div ref={tray}>
        <StoriesRingList groups={groups} viewed={viewed} onSelect={openAt} />
      </div>
      <button onClick={viewed.forget}>Forget what was seen</button>
      <Observe signals={[open]}>
        {() => (
          <StoriesOverlay
            isOpen={open.value}
            groups={groups}
            initialGroupIndex={startGroup.value}
            viewed={viewed}
            onGroupChange={(groupIndex) => (lastGroup.value = groupIndex)}
            onClose={close}
          />
        )}
      </Observe>
    </>
  );
}
```

## Vue

`<StoriesRingList :groups="groups" :viewed="viewed" @select="openAt" />`, `<StoriesOverlay :is-open="open" :groups="groups" :initial-group-index="startGroup" :viewed="viewed" @group-change="(i) => (lastGroup = i)" @close="close" />`; same controller + `setTimeout` focus move via template ref on tray wrapper.

## Angular

`<rk-stories-ring-list [groups]="groups" [viewed]="viewed" (selected)="openAt($event)" />`, `<rk-stories-overlay [isOpen]="open()" [groups]="groups" [initialGroupIndex]="startGroup()" [viewed]="viewed" (groupChanged)="lastGroup = $event" (closed)="close()" />`; tray via `viewChild.required<ElementRef<HTMLElement>>('tray')`, same `setTimeout` focus move.
