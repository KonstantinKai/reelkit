import StoriesTray from '../../content/snippets/recipes/stories-tray/react';

// The recipe page shows the snippet's code, so the demo renders that very
// module. The tray takes the colours of the page around it, and a watched
// ring is drawn in a faint light grey meant for a dark page, the way the
// player itself looks, so the demo gives it a dark page in either theme.
export function StoriesTrayDemo() {
  return (
    <div className="h-full overflow-auto bg-slate-900 text-slate-100">
      <StoriesTray />
    </div>
  );
}
