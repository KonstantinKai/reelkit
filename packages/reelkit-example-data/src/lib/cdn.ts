const _kCdnProd = 'https://cdn.reelkit.dev';

let base = _kCdnProd;

export function setCdnBase(url: string): void {
  base = url;
}

export function cdnUrl(path: string): string {
  return `${base}/${path}`;
}

export const generate = <T>(count: number, fn: (i: number) => T): T[] =>
  Array.from({ length: count }, (_, i) => fn(i));
