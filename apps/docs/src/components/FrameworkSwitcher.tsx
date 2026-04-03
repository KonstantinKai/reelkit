import { useState } from 'react';
import { Observe } from '@reelkit/react';
import {
  frameworkSignal,
  setFramework,
  type Framework,
} from '../data/frameworkSignal';

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

const frameworkIcons: Record<
  Framework,
  { Icon: typeof ReactIcon; color: string; label: string }
> = {
  react: { Icon: ReactIcon, color: 'text-sky-500', label: 'React' },
  angular: { Icon: AngularIcon, color: 'text-rose-500', label: 'Angular' },
};

export { ReactIcon, AngularIcon };

export default function FrameworkSwitcher() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <>
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <Observe signals={[frameworkSignal]}>
            {() => (
              <div className="relative flex flex-col gap-2 mb-1">
                {(['react', 'angular'] as const).map((fw) => {
                  if (frameworkSignal.value === fw) return null;
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
            )}
          </Observe>
        </>
      )}
      <Observe signals={[frameworkSignal]}>
        {() => {
          const { Icon, color, label } = frameworkIcons[frameworkSignal.value];
          return (
            <button
              onClick={() => setIsOpen((v) => !v)}
              className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
              title={`Framework: ${label}`}
            >
              <Icon className={`w-7 h-7 ${color}`} />
            </button>
          );
        }}
      </Observe>
    </div>
  );
}
