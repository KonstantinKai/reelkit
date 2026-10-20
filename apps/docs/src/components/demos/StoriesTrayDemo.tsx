import StoriesTray from '../../content/snippets/recipes/stories-tray/react';

// The recipe page shows the snippet's code, so the demo renders that very
// module on a page of its own that follows the site theme. A watched ring's
// default colour is meant for a dark page, so in light mode the demo sets
// `--rk-stories-ring-viewed-color` on the ring list, the way the recipe tells a
// light page to, and leaves :root alone so the player's carousel keeps its own.
export const kStoriesTrayLightRings =
  '[&_.rk-stories-ring-list]:[--rk-stories-ring-viewed-color:#d4d4d8]';
export const kStoriesTrayDarkRings =
  'dark:[&_.rk-stories-ring-list]:[--rk-stories-ring-viewed-color:rgba(255,255,255,0.25)]';

export function StoriesTrayDemo() {
  return (
    <div
      className={`h-full overflow-auto bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 ${kStoriesTrayLightRings} ${kStoriesTrayDarkRings}`}
    >
      <StoriesTray />
    </div>
  );
}
