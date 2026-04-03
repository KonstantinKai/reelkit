import { Link } from 'react-router-dom';
import { Observe } from '@reelkit/react';
import { frameworkSignal } from '../data/frameworkSignal';
import type { Framework } from '../data/frameworkSignal';

interface NextStepItem {
  label: string;
  path: string | Record<Framework, string>;
  description: string;
}

export function NextSteps({ items }: { items: NextStepItem[] }) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
      <Observe signals={[frameworkSignal]}>
        {() => {
          const fw = frameworkSignal.value;
          return (
            <ul className="space-y-3">
              {items.map((item) => {
                const path =
                  typeof item.path === 'string' ? item.path : item.path[fw];
                return (
                  <li key={path}>
                    <Link
                      to={path}
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                    >
                      {item.label}
                    </Link>
                    <span className="text-slate-500">
                      {' '}
                      - {item.description}
                    </span>
                  </li>
                );
              })}
            </ul>
          );
        }}
      </Observe>
    </section>
  );
}
