import { publishedPackages } from '../../data/publishedPackages';

interface PublishedPackageListProps {
  /** Append each package's one-line description after its name. */
  withDescriptions?: boolean;
}

export function PublishedPackageList({
  withDescriptions = false,
}: PublishedPackageListProps) {
  return (
    <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
      {publishedPackages.map((pkg) => (
        <li key={pkg.name}>
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {pkg.name}
          </code>
          {withDescriptions ? ` — ${pkg.description}` : null}
        </li>
      ))}
    </ul>
  );
}
