import { createCorpusLoader, fetchCorpusText } from './llmsCorpus';
import type { ModelContext } from './modelContext';
import { createDocsTools } from './tools';

/**
 * Registers the docs tools until the signal is aborted. A registration the
 * browser refuses, such as a name still held by an earlier mount, is left
 * out rather than surfacing as an unhandled rejection.
 */
export async function registerDocsTools(
  context: ModelContext,
  navigate: (to: string) => void,
  signal: AbortSignal,
): Promise<void> {
  const tools = createDocsTools({
    loadCorpus: createCorpusLoader(fetchCorpusText),
    currentLocation: () => window.location,
    navigate,
  });
  await Promise.all(
    tools.map((tool) =>
      Promise.resolve()
        .then(() => context.registerTool(tool, { signal }))
        .catch(() => undefined),
    ),
  );
}
