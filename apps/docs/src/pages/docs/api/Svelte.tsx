import { Callout } from '../../../components/ui/Callout';

export default function SvelteApi() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Svelte API</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Svelte bindings for reelkit are coming soon.
        </p>
      </div>

      <Callout type="warning" title="Coming Soon">
        Svelte support is on our roadmap. Stay tuned for updates!
      </Callout>
    </div>
  );
}
