export function createSpecifierRewriter(options: {
  outDir: string;
  srcDir: string;
}): (filePath: string, content: string) => string;
export function asBeforeWriteFile(
  rewrite: (filePath: string, content: string) => string,
): (filePath: string, content: string) => { content: string };
