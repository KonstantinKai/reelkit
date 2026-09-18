// The slice of the WebMCP API the docs use. TypeScript ships no types for it
// yet, and only the parts called here are declared.

export interface ToolInputProperty {
  type: 'string';
  description: string;
  enum?: readonly string[];
}

export interface ToolInputSchema {
  type: 'object';
  properties: Record<string, ToolInputProperty>;
  required: string[];
  additionalProperties: false;
}

export interface ModelContextTool {
  name: string;
  title: string;
  description: string;
  inputSchema: ToolInputSchema;
  annotations?: { readOnlyHint?: boolean };
  execute: (input: unknown) => Promise<unknown>;
}

export interface ModelContext {
  /**
   * Resolves once the tool is registered. Rejects when a tool with the same
   * name is already registered or the signal has already been aborted.
   * Aborting the signal later unregisters the tool.
   */
  registerTool: (
    tool: ModelContextTool,
    options: { signal: AbortSignal },
  ) => Promise<void> | void;
}

/**
 * The browser's model context, or nothing where WebMCP is not available. The
 * draft standard puts it on `document`; the Chrome origin trial still ships
 * the earlier `navigator` getter.
 */
export function findModelContext(): ModelContext | undefined {
  const fromDocument = (document as { modelContext?: ModelContext })
    .modelContext;
  return (
    fromDocument ?? (navigator as { modelContext?: ModelContext }).modelContext
  );
}
