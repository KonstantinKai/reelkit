import { Bot, Sparkles, Link as LinkIcon, FileText } from 'lucide-react';
import { Heading } from '../../../components/ui/Heading';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Callout } from '../../../components/ui/Callout';
import { FeatureCardGrid } from '../../../components/ui/FeatureCard';
import { zhPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/llms',
    title: 'AI / 大模型集成 · ReelKit',
    description:
      '把 ReelKit 文档喂给 AI 助手：llms.txt、llms-full.txt 与推荐的接入方式。',
  });

// Headings carry the English slug as an explicit id — the slug generator
// is ascii-only, so a Chinese heading would produce an empty anchor.

const endpoints = [
  {
    name: '/llms.txt',
    url: 'https://reelkit.dev/llms.txt',
    description: '每个文档页的索引链接列表。可直接放进任意大模型上下文。',
  },
  {
    name: '/llms-full.txt',
    url: 'https://reelkit.dev/llms-full.txt',
    description: '同样的索引，外加每页的内嵌摘要。一次请求拿到全部语料。',
  },
  {
    name: 'context7.com/websites/reelkit_dev',
    url: 'https://context7.com/websites/reelkit_dev',
    description: '实时索引的 Context7 清单。通过 @context7 MCP 服务器接入。',
  },
];

export default function LlmsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">AI / 大模型集成</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          面向 AI 编码助手的机器可读文档。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <FeatureCardGrid
          items={[
            {
              icon: FileText,
              label: 'llms.txt',
              desc: '紧凑的链接索引。所有文档页汇于一个文件，构建时更新。',
            },
            {
              icon: Sparkles,
              label: 'llms-full.txt',
              desc: '带每页摘要的完整语料。一次请求即可获得上下文。',
            },
            {
              icon: Bot,
              label: 'context7',
              desc: '实时索引的清单。配合 @context7 MCP 服务器使用。',
            },
          ]}
        />
      </div>

      <Callout type="info">
        <p>
          两个 `.txt` 端点都会在每次文档构建时重新生成，语料始终跟随已发布的
          站点。
        </p>
      </Callout>

      <Heading
        level={2}
        id="endpoints"
        className="text-2xl font-bold mt-12 mb-4"
      >
        端点
      </Heading>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-2 pr-4 font-semibold">端点</th>
              <th className="text-left py-2 font-semibold">用途</th>
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

      <Heading
        level={2}
        id="quick-start"
        className="text-2xl font-bold mt-12 mb-4"
      >
        快速上手
      </Heading>

      <Heading
        level={3}
        id="agent-prompt"
        className="text-lg font-semibold mt-6 mb-2"
      >
        Agent 提示词
      </Heading>
      <p className="text-slate-600 dark:text-slate-400 mb-4">
        把端点 URL 粘给 agent，让它的回答基于当前文档。
      </p>
      <CodeBlock
        code={`reelkit.dev/llms-full.txt How do I wire vertical-feed gestures?`}
        language="text"
      />

      <Heading
        level={3}
        id="context7-mcp-server"
        className="text-lg font-semibold mt-6 mb-2"
      >
        Context7 MCP 服务器
      </Heading>
      <p className="text-slate-600 dark:text-slate-400 mb-4">
        安装{' '}
        <a
          href="https://github.com/upstash/context7"
          className="text-primary-600 dark:text-primary-400 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          @context7
        </a>{' '}
        MCP 服务器。agent 会自动识别 ReelKit
        的清单并按需拉取文档。在提示词里提到 <code>reelkit</code> 即可。
      </p>

      <Heading
        level={3}
        id="direct-ingestion"
        className="text-lg font-semibold mt-6 mb-2"
      >
        直接接入
      </Heading>
      <p className="text-slate-600 dark:text-slate-400 mb-4">
        以编程方式拉取：
      </p>
      <CodeBlock
        code={`curl -s https://reelkit.dev/llms.txt
curl -s https://reelkit.dev/llms-full.txt`}
        language="bash"
      />

      <Heading
        level={2}
        id="what-gets-indexed"
        className="text-2xl font-bold mt-12 mb-4"
      >
        索引了哪些内容
      </Heading>
      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
        <li>快速开始 + 安装</li>
        <li>核心引擎指南 + API</li>
        <li>
          React、Vue、Angular 绑定（指南 + API + reel-player + lightbox +
          stories-player）
        </li>
        <li>Stories Core 引擎</li>
        <li>服务端渲染说明</li>
        <li>疑难排查</li>
        <li>更新日志</li>
      </ul>

      <Heading level={2} id="why" className="text-2xl font-bold mt-12 mb-4">
        为什么？
      </Heading>
      <p className="text-slate-600 dark:text-slate-400">
        AI 助手总是跟不上库的变化，生成的代码引用的是过时的
        API。这些端点会随每次文档发布更新，因此建议贴合当前行为，而不是上个季度的。
      </p>
    </div>
  );
}
