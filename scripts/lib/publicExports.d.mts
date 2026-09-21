export const kReexportBlock: RegExp;
export const kOwnDeclaration: RegExp;
export function publicExportNames(src: string): {
  names: string[];
  /** The subset of `names` that exists at runtime, types left out. */
  valueNames: string[];
  hasStarExport: boolean;
};
