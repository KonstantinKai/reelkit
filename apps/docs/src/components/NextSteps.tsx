import { Link } from 'react-router-dom';
import { kFrameworks, type Framework } from '../data/frameworkSignal';
import { FrameworkVariant } from './ui/FrameworkVariant';

interface NextStepItem {
  label: string;
  path: string | Record<Framework, string>;
  description: string;
}

interface NextStepsProps {
  items: NextStepItem[];
}

function NextStepLink({
  label,
  path,
  description,
}: {
  label: string;
  path: string;
  description: string;
}) {
  return (
    <>
      <Link
        to={path}
        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
      >
        {label}
      </Link>
      <span className="text-slate-500"> - {description}</span>
    </>
  );
}

export function NextSteps({ items }: NextStepsProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
      <ul className="space-y-3">
        {items.map((item, i) => {
          if (typeof item.path === 'string') {
            return (
              <li key={item.path}>
                <NextStepLink
                  label={item.label}
                  path={item.path}
                  description={item.description}
                />
              </li>
            );
          }
          // Framework-keyed path: render one `<li>` per framework, wrapped
          // in `<FrameworkVariant>` so the active framework's link is
          // visible without a render-time branch on `frameworkSignal`.
          return (
            <li key={`${item.label}-${i}`}>
              {kFrameworks.map((fw) => (
                <FrameworkVariant key={fw} for={fw} inline>
                  <NextStepLink
                    label={item.label}
                    path={(item.path as Record<Framework, string>)[fw]}
                    description={item.description}
                  />
                </FrameworkVariant>
              ))}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
