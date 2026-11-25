declare module 'virtual:reelkit-versions' {
  export const REELKIT_VERSIONS: Readonly<Record<string, string>>;
}

declare module 'virtual:reelkit-changelog' {
  /** Every package entry id, newest first. */
  export const ids: readonly string[];
  /** Markdown of the newest releases, rendered into the prerendered page. */
  export const head: string;
  /** Number of chunks, the head included. */
  export const chunkCount: number;
  /** Markdown of the chunk at `index`, from 1 up to `chunkCount - 1`. */
  export function loadChunk(index: number): Promise<string>;
}
