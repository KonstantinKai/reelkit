import { dirname, join, relative } from 'node:path';
import { Parser } from 'acorn';
import type { Options as MdxOptions } from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';

const _kSourceDir = join(import.meta.dirname, 'src');

/**
 * Bare specifier the compiled MDX imports its component map from. Resolved
 * by a Vite alias in `vite.config.mts`, so the compiler can emit one static
 * import no matter how deep the content file sits.
 */
export const kMdxComponentsSpecifier = '@reelkit/docs-mdx-components';

export const kMdxComponentsPath = join(
  _kSourceDir,
  'components/mdx/components.tsx',
);

/* Just enough of the mdast and vfile shapes for the two plugins below. */
interface Node {
  type: string;
  value?: string;
  children?: Node[];
  data?: Record<string, unknown>;
}

interface File {
  path: string;
  fail(reason: string, place?: Node): never;
}

/**
 * `## Title [#slug]` → `<h2 id="slug">`. Every heading in every locale
 * carries the English slug explicitly, so anchors stay stable across
 * translations and the slug generator never sees non-ascii text. A heading
 * without one fails the build here, at the file that needs fixing.
 *
 * Square brackets rather than the `{#slug}` seen elsewhere: in MDX a brace
 * opens a JavaScript expression, so that form does not parse. A bracket
 * with no link target stays literal text — possibly split across several
 * text nodes, hence the join below.
 */
function remarkHeadingIds() {
  return (tree: Node, file: File) => {
    const walk = (node: Node) => {
      if (node.type === 'heading') {
        const children = node.children ?? [];
        let start = children.length;
        while (start > 0 && children[start - 1].type === 'text') start--;
        const trailing = children
          .slice(start)
          .map((c) => c.value ?? '')
          .join('');
        const match = /\s*\[#([a-z0-9-]+)\]\s*$/.exec(trailing);
        if (!match) {
          const text = children.map((c) => c.value ?? '').join('');
          file.fail(
            `Heading "${text}" needs an explicit ascii id: ## ${text} [#slug]`,
            node,
          );
        }
        children.splice(start, children.length - start, {
          type: 'text',
          value: trailing.slice(0, match.index),
        });
        node.data ??= {};
        node.data['hProperties'] = {
          ...(node.data['hProperties'] as object),
          id: match[1],
        };
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

/**
 * Wires a content file into the site without any boilerplate in the file
 * itself. Appends, as module-level ESM:
 *
 * - `export const meta` — page title, description and social tags, derived
 *   from the frontmatter plus the locale in the URL.
 * - a default layout export, which MDX renders around the body — the page
 *   shell with the `<h1>` from the frontmatter.
 *
 * Frontmatter without `title` and `description` fails the build.
 */
function remarkDocsPageModule() {
  return (tree: Node, file: File) => {
    const frontmatter = readFrontmatter(tree);
    for (const key of ['title', 'description']) {
      if (typeof frontmatter[key] !== 'string' || !frontmatter[key]) {
        file.fail(`Frontmatter needs a non-empty "${key}"`);
      }
    }

    const importPath = (target: string) => {
      const specifier = relative(dirname(file.path), join(_kSourceDir, target));
      return specifier.startsWith('.') ? specifier : `./${specifier}`;
    };
    const source = [
      `import { jsx as __jsx } from 'react/jsx-runtime';`,
      `import { DocsPage as __DocsPage } from '${importPath('components/mdx/DocsPage')}';`,
      `import { pageMeta as __pageMeta } from '${importPath('i18n/pageMeta')}';`,
      `export const meta = (args) => __pageMeta(frontmatter, args);`,
      `export default function DocsLayout(props) {`,
      `  return __jsx(__DocsPage, { frontmatter, children: props.children });`,
      `}`,
    ].join('\n');

    tree.children?.push({
      type: 'mdxjsEsm',
      value: source,
      data: {
        estree: Parser.parse(source, {
          ecmaVersion: 2022,
          sourceType: 'module',
        }),
      },
    });
  };
}

interface Property {
  key: { type: string; name?: string; value?: unknown };
  value: { type: string; value?: unknown };
}

interface Statement {
  declaration?: {
    declarations?: {
      id: { name: string };
      init: { properties?: Property[] };
    }[];
  };
}

/**
 * The frontmatter as `remark-mdx-frontmatter` already exported it — read
 * back from the `export const frontmatter = {…}` estree so both plugins
 * agree on one parse.
 */
function readFrontmatter(tree: Node): Record<string, unknown> {
  for (const node of tree.children ?? []) {
    if (node.type !== 'mdxjsEsm') continue;
    const program = node.data?.['estree'] as { body: Statement[] } | undefined;
    for (const statement of program?.body ?? []) {
      const declarator = statement.declaration?.declarations?.[0];
      if (declarator?.id.name !== 'frontmatter') continue;
      const result: Record<string, unknown> = {};
      for (const property of declarator.init.properties ?? []) {
        const key =
          property.key.type === 'Identifier'
            ? property.key.name
            : property.key.value;
        if (property.value.type === 'Literal') {
          result[String(key)] = property.value.value;
        }
      }
      return result;
    }
  }
  return {};
}

export const mdxOptions: MdxOptions = {
  mdxExtensions: ['.mdx'],
  // Leave `.md` alone: `CHANGELOG.md?raw` and the llms sources must keep
  // importing as strings.
  mdExtensions: [],
  providerImportSource: kMdxComponentsSpecifier,
  remarkPlugins: [
    remarkFrontmatter,
    [remarkMdxFrontmatter, { name: 'frontmatter' }],
    remarkGfm,
    remarkHeadingIds,
    remarkDocsPageModule,
  ],
};
