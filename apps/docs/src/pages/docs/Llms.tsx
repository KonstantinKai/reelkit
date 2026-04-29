import { Bot, Sparkles, Link as LinkIcon, FileText } from 'lucide-react';
import { Heading } from '../../components/ui/Heading';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { Callout } from '../../components/ui/Callout';
import { FeatureCardGrid } from '../../components/ui/FeatureCard';

const endpoints = [
  {
    name: '/llms.txt',
    url: 'https://reelkit.dev/llms.txt',
    description:
      'Indexed link list of every doc page. Drop into any LLM context.',
  },
  {
    name: '/llms-full.txt',
    url: 'https://reelkit.dev/llms-full.txt',
    description:
      'Same index plus embedded per-page summaries. Full corpus in a single fetch.',
  },
  {
    name: 'context7.com/websites/reelkit_dev',
    url: 'https://context7.com/websites/reelkit_dev',
    description:
      'Live-indexed Context7 manifest. Plug in via the @context7 MCP server.',
  },
];

export default function LlmsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">AI / LLM Integration</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Machine-readable docs for AI coding assistants.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <FeatureCardGrid
          items={[
            {
              icon: FileText,
              label: 'llms.txt',
              desc: 'Compact link index. Every doc page in one file. Updated at build.',
            },
            {
              icon: Sparkles,
              label: 'llms-full.txt',
              desc: 'Full corpus with per-page summaries. Single-fetch context.',
            },
            {
              icon: Bot,
              label: 'context7',
              desc: 'Live-indexed manifest. Use with the @context7 MCP server.',
            },
          ]}
        />
      </div>

      <Callout type="info">
        <p>
          Both `.txt` endpoints regenerate on every docs build. The corpus
          tracks the published site.
        </p>
      </Callout>

      <Heading level={2} className="text-2xl font-bold mt-12 mb-4">
        Endpoints
      </Heading>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-2 pr-4 font-semibold">Endpoint</th>
              <th className="text-left py-2 font-semibold">Purpose</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((e) => (
              <tr
                key={e.name}
                className="border-b border-slate-100 dark:border-slate-800"
              >
                <td className="py-2 pr-4 font-mono text-xs">
                  <a
                    href={e.url}
                    className="text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <LinkIcon size={12} /> {e.name}
                  </a>
                </td>
                <td className="py-2 text-slate-600 dark:text-slate-400">
                  {e.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-12 mb-4">
        Quick start
      </Heading>

      <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
        Agent prompt
      </Heading>
      <p className="text-slate-600 dark:text-slate-400 mb-4">
        Paste an endpoint URL into the agent to ground answers in current docs.
      </p>
      <CodeBlock
        code={`reelkit.dev/llms-full.txt How do I wire vertical-feed gestures?`}
        language="text"
      />

      <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
        Context7 MCP server
      </Heading>
      <p className="text-slate-600 dark:text-slate-400 mb-4">
        Install the{' '}
        <a
          href="https://github.com/upstash/context7"
          className="text-primary-600 dark:text-primary-400 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          @context7
        </a>{' '}
        MCP server. The agent picks up the ReelKit manifest automatically and
        fetches docs on demand. Mention <code>reelkit</code> in your prompt.
      </p>

      <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
        Direct ingestion
      </Heading>
      <p className="text-slate-600 dark:text-slate-400 mb-4">
        Fetch programmatically:
      </p>
      <CodeBlock
        code={`curl -s https://reelkit.dev/llms.txt
curl -s https://reelkit.dev/llms-full.txt`}
        language="bash"
      />

      <Heading level={2} className="text-2xl font-bold mt-12 mb-4">
        What gets indexed
      </Heading>
      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
        <li>Getting started + Installation</li>
        <li>Core engine guide + API</li>
        <li>
          React, Vue, Angular bindings (guide + API + reel-player + lightbox +
          stories-player)
        </li>
        <li>Stories core engine</li>
        <li>SSR notes</li>
        <li>Troubleshooting</li>
        <li>Changelog</li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-12 mb-4">
        Why?
      </Heading>
      <p className="text-slate-600 dark:text-slate-400">
        AI assistants lag behind library changes. Generated code references
        stale APIs. These endpoints update with every doc release, so
        suggestions match current behavior instead of last quarter&apos;s.
      </p>
    </div>
  );
}
