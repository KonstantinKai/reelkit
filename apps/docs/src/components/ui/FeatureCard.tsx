import type { LucideIcon } from 'lucide-react';

export interface FeatureCardItem {
  icon: LucideIcon;

  label: string;

  desc: string;
}

export function FeatureCardGrid({ items }: { items: FeatureCardItem[] }) {
  return (
    <>
      {items.map((item) => (
        <div
          key={item.label}
          className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:shadow-primary-500/10 dark:hover:shadow-primary-400/5"
        >
          <item.icon className="w-6 h-6 mx-auto mb-2 text-primary-500 transition-transform duration-200 group-hover:scale-110" />
          <div className="font-semibold text-sm">{item.label}</div>
          <div className="text-xs text-slate-500">{item.desc}</div>
        </div>
      ))}
    </>
  );
}
