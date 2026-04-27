import { useState } from 'react';
import {
  setFramework,
  kFrameworks,
  type Framework,
} from '../data/frameworkSignal';
import { FrameworkVariant } from './ui/FrameworkVariant';

function ReactIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="-11.5 -10.232 23 20.463" className={className}>
      <circle r="2.05" fill="currentColor" />
      <g stroke="currentColor" fill="none" strokeWidth="1">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  );
}

function AngularIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M9.931 12.645h4.138l-2.07-4.908m0-7.737L.68 3.982l1.726 14.771L12 24l9.596-5.242L23.32 3.984 11.999.001zm7.064 18.31h-2.638l-1.422-3.503H8.996l-1.422 3.504h-2.64L12 2.65z" />
    </svg>
  );
}

function VueIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M2 3h3.5L12 15l6.5-12H22L12 21 2 3zm4.5 0H10l2 3.6L14 3h3.5L12 13.2 6.5 3z" />
    </svg>
  );
}

const frameworkIcons: Record<
  Framework,
  { Icon: typeof ReactIcon; color: string; label: string }
> = {
  react: { Icon: ReactIcon, color: 'text-sky-500', label: 'React' },
  angular: { Icon: AngularIcon, color: 'text-rose-500', label: 'Angular' },
  vue: { Icon: VueIcon, color: 'text-emerald-500', label: 'Vue' },
};

export { ReactIcon, AngularIcon, VueIcon };

export default function FrameworkSwitcher() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <>
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          {kFrameworks.map((current) => (
            <FrameworkVariant key={current} for={current}>
              <div className="relative flex flex-col gap-2 mb-1">
                {kFrameworks
                  .filter((fw) => fw !== current)
                  .map((fw) => {
                    const { Icon, color, label } = frameworkIcons[fw];
                    return (
                      <button
                        key={fw}
                        onClick={() => {
                          setFramework(fw);
                          setIsOpen(false);
                        }}
                        className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                        title={label}
                      >
                        <Icon className={`w-6 h-6 ${color}`} />
                      </button>
                    );
                  })}
              </div>
            </FrameworkVariant>
          ))}
        </>
      )}
      {kFrameworks.map((fw) => {
        const { Icon, color, label } = frameworkIcons[fw];
        return (
          <FrameworkVariant key={fw} for={fw}>
            <button
              onClick={() => setIsOpen((v) => !v)}
              className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
              title={`Framework: ${label}`}
            >
              <Icon className={`w-7 h-7 ${color}`} />
            </button>
          </FrameworkVariant>
        );
      })}
    </div>
  );
}
