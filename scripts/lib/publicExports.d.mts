export const kReexportBlock: RegExp;
export const kOwnDeclaration: RegExp;
export function publicExportNames(src: string): {
  names: string[];
  hasStarExport: boolean;
};
