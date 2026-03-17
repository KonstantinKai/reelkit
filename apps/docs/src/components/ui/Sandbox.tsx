import { useState, useCallback, type ReactNode } from 'react';
import { CodeBlock } from './CodeBlock';
import { useTheme } from '../../context/ThemeContext';
import { Eye, Code2, Maximize2, Minimize2, ExternalLink } from 'lucide-react';

interface SandboxProps {
  code: string;
  language?: string;
  children: ReactNode;
  title?: string;
  height?: number;
  stackblitzDeps?: Record<string, string>;
}

type Tab = 'preview' | 'code';

export function Sandbox({
  code,
  language = 'tsx',
  children,
  title,
  height = 500,
  stackblitzDeps,
}: SandboxProps) {
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [expanded, setExpanded] = useState(false);
  const { theme } = useTheme();

  const previewHeight = expanded ? 700 : height;

  const openInStackBlitz = useCallback(async () => {
    const [sdk, { createStackBlitzProject }] = await Promise.all([
      import('@stackblitz/sdk'),
      import('../../utils/stackblitz'),
    ]);

    const project = createStackBlitzProject({
      title: title ?? 'ReelKitSandbox',
      code,
      dependencies: stackblitzDeps!,
    });

    sdk.default.openProject(project, {
      openFile: 'src/App.tsx',
      newWindow: true,
      theme: theme === 'dark' ? 'dark' : 'light',
    });
  }, [code, title, stackblitzDeps, theme]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Eye size={14} />
            Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'code'
                ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Code2 size={14} />
            Code
          </button>
        </div>
        <div className="flex items-center gap-2">
          {title && (
            <span className="text-xs text-slate-400 font-medium">{title}</span>
          )}
          {stackblitzDeps && (
            <button
              onClick={openInStackBlitz}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Open in StackBlitz"
            >
              <ExternalLink size={12} />
              StackBlitz
            </button>
          )}
          {activeTab === 'preview' && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'preview' ? (
        <div
          className="relative bg-[#1a1a2e] dark:bg-[#0d0d1a] overflow-hidden transition-[height] duration-300"
          style={{ height: previewHeight }}
        >
          {/* Grid pattern background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="relative h-full">{children}</div>
        </div>
      ) : (
        <div className="max-h-[600px] overflow-auto">
          <CodeBlock code={code} language={language} bare />
        </div>
      )}
    </div>
  );
}
