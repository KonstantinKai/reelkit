import { ReactNode } from 'react';
import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface CalloutProps {
  type?: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  className?: string;
  children: ReactNode;
}

const styles = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500',
    title: 'text-blue-800 dark:text-blue-200',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-500',
    title: 'text-amber-800 dark:text-amber-200',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-500',
    title: 'text-green-800 dark:text-green-200',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-500',
    title: 'text-red-800 dark:text-red-200',
  },
};

const icons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
};

export function Callout({ type = 'info', title, className, children }: CalloutProps) {
  const style = styles[type];
  const Icon = icons[type];

  return (
    <div
      className={`flex gap-3 p-4 rounded-xl border ${style.bg} ${style.border}${className ? ` ${className}` : ''}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.icon}`} />
      <div className="flex-1 min-w-0">
        {title && (
          <h5 className={`font-semibold mb-1 ${style.title}`}>{title}</h5>
        )}
        <div className="text-sm text-slate-700 dark:text-slate-300 [&>p]:m-0">
          {children}
        </div>
      </div>
    </div>
  );
}
