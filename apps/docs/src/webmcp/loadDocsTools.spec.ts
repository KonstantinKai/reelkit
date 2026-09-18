import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadDocsTools } from './loadDocsTools';
import type { ModelContext, ModelContextTool } from './modelContext';

const loaded = vi.hoisted(() => ({ count: 0 }));

vi.mock('./registerDocsTools', async (importOriginal) => {
  loaded.count++;
  const actual = await importOriginal<typeof import('./registerDocsTools')>();
  return { registerDocsTools: vi.fn(actual.registerDocsTools) };
});

// Behaves like the draft standard: a name is held until its signal aborts,
// and registering a held name or with an aborted signal rejects.
function createFakeContext() {
  const active = new Map<string, ModelContextTool>();
  const registerTool = vi.fn(
    async (tool: ModelContextTool, { signal }: { signal: AbortSignal }) => {
      if (signal.aborted) throw signal.reason;
      if (active.has(tool.name)) {
        throw new DOMException(
          `${tool.name} is registered`,
          'InvalidStateError',
        );
      }
      active.set(tool.name, tool);
      signal.addEventListener('abort', () => active.delete(tool.name));
    },
  );
  const context: ModelContext = { registerTool };
  return { context, active, registerTool };
}

function install(target: Document | Navigator, context: ModelContext) {
  Object.defineProperty(target, 'modelContext', {
    configurable: true,
    value: context,
  });
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

const navigate = () => undefined;

afterEach(() => {
  vi.useRealTimers();
  delete (document as { modelContext?: unknown }).modelContext;
  delete (navigator as { modelContext?: unknown }).modelContext;
});

describe('loading the docs tools', () => {
  // Runs first: once any test loads the chunk, the module stays cached.
  it('loads nothing in a browser without WebMCP', async () => {
    const dispose = loadDocsTools(navigate);
    await settle();
    dispose();

    expect(loaded.count).toBe(0);
    expect('modelContext' in document).toBe(false);
    expect('modelContext' in navigator).toBe(false);
  });

  it('registers every tool once the page is idle', async () => {
    const { context, active } = createFakeContext();
    install(document, context);

    const dispose = loadDocsTools(navigate);
    expect(active.size).toBe(0);

    await vi.waitFor(() => expect(active.size).toBe(4));
    expect([...active.keys()]).toEqual([
      'list_pages',
      'search_docs',
      'get_page',
      'open_page',
    ]);
    dispose();
  });

  it('prefers the document context over the navigator one', async () => {
    const onDocument = createFakeContext();
    const onNavigator = createFakeContext();
    install(document, onDocument.context);
    install(navigator, onNavigator.context);

    const dispose = loadDocsTools(navigate);
    await vi.waitFor(() => expect(onDocument.active.size).toBe(4));
    expect(onNavigator.registerTool).not.toHaveBeenCalled();
    dispose();
  });

  it('falls back to the navigator context', async () => {
    const { context, active } = createFakeContext();
    install(navigator, context);

    const dispose = loadDocsTools(navigate);
    await vi.waitFor(() => expect(active.size).toBe(4));
    dispose();
  });

  it('unregisters every tool on dispose', async () => {
    const { context, active } = createFakeContext();
    install(document, context);

    const dispose = loadDocsTools(navigate);
    await vi.waitFor(() => expect(active.size).toBe(4));
    dispose();

    expect(active.size).toBe(0);
  });
});

describe('mounting more than once', () => {
  it('ends with one set of tools after a mount, unmount and mount', async () => {
    const { context, active, registerTool } = createFakeContext();
    install(document, context);

    loadDocsTools(navigate)();
    const dispose = loadDocsTools(navigate);
    await vi.waitFor(() => expect(active.size).toBe(4));
    await settle();

    expect(registerTool).toHaveBeenCalledTimes(4);
    dispose();
  });

  it('registers nothing when unmounted while the chunk is loading', async () => {
    const { context, registerTool } = createFakeContext();
    install(document, context);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    const dispose = loadDocsTools(navigate);
    vi.advanceTimersByTime(10);
    dispose();
    vi.useRealTimers();
    await settle();

    expect(registerTool).not.toHaveBeenCalled();
  });

  it('registers again after an unmount that followed registration', async () => {
    const { context, active } = createFakeContext();
    install(document, context);

    const first = loadDocsTools(navigate);
    await vi.waitFor(() => expect(active.size).toBe(4));
    first();
    const second = loadDocsTools(navigate);
    await vi.waitFor(() => expect(active.size).toBe(4));
    second();
  });

  it('absorbs the rejections of a second live mount', async () => {
    const { context, active, registerTool } = createFakeContext();
    install(document, context);

    const first = loadDocsTools(navigate);
    await vi.waitFor(() => expect(active.size).toBe(4));
    const second = loadDocsTools(navigate);
    await vi.waitFor(() => expect(registerTool).toHaveBeenCalledTimes(8));
    await settle();

    expect(active.size).toBe(4);
    first();
    second();
  });
});
