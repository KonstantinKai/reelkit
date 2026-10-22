export function mentionsAsCode(haystack: string, symbol: string): boolean;
export function componentsAfterHooks(
  src: string,
  valueNames: string[],
): string[];
export function strippedInternals(
  tsconfig: { compilerOptions?: { stripInternal?: boolean } },
  internalNames: string[],
): string[];
