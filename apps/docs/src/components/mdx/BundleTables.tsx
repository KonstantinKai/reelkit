import { Check } from 'lucide-react';
import { kBundleSizes, kLibraryComparison } from '../../data/bundleSizes';

/**
 * Package sizes from the shared data module, one row per package, filtered
 * to the reader's framework like the rest of the page. The content file
 * supplies the column headers in its own language; the numbers are never
 * copied into a translation.
 */
export function BundleSizeTable({ headers }: { headers: string[] }) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="docs-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {kBundleSizes.map((size) => (
            <tr key={size.name} data-rk-fw={size.framework}>
              <td>
                <code className="docs-inline-code">{size.name}</code>
              </td>
              <td>{size.js}</td>
              <td>{size.gzip}</td>
              <td>{size.css}</td>
              <td>{size.cssGzip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Sizes against other carousel libraries. Notes are prose, so they come from
 * the content file in its language, one per row in the data module's order.
 */
export function LibraryComparison({
  headers,
  notes,
  plugin,
}: {
  headers: string[];
  notes: string[];
  plugin: string;
}) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="docs-table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {kLibraryComparison.map((library, index) => (
            <tr key={library.name}>
              <td className="font-semibold text-[var(--color-text)]">
                {library.name}
              </td>
              <td>{library.gzip}</td>
              <td>
                {library.virtualization === true ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : library.virtualization === 'plugin' ? (
                  <span className="text-yellow-600 dark:text-yellow-400">
                    {plugin}
                  </span>
                ) : (
                  <span className="text-red-500">✗</span>
                )}
              </td>
              <td>{notes[index]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
