import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-jsdoc-link-in-file"
export const kJsdocLinkInFileRuleName = 'jsdoc-link-in-file';

const _kLinkPattern = /\{@link(?:code|plain)?\s+([^}]*)\}/g;

const nameOf = (key: TSESTree.Node): string | null => {
  if (key.type === 'Identifier') return key.name;
  if (key.type === 'Literal' && typeof key.value === 'string') return key.value;
  return null;
};

/**
 * A link tag resolves only where its target is in scope, so a link to a
 * symbol the file neither declares nor imports renders as plain text in the
 * editor and as a broken reference in generated docs. A mention of something
 * from another file is written in backticks instead; the fixer does that.
 */
export const jsdocLinkInFileRule = ESLintUtils.RuleCreator(() => __filename)({
  name: kJsdocLinkInFileRuleName,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require every {@link} in a JSDoc comment to name a symbol the file declares, imports or re-exports.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      linkOutOfFile:
        '{@link {{name}}} names a symbol this file neither declares nor imports. Mention it in backticks, or import it.',
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;
    const known = new Set<string>();
    const remember = (key: TSESTree.Node) => {
      const name = nameOf(key);
      if (name) known.add(name);
    };

    return {
      ImportDeclaration(node) {
        for (const specifier of node.specifiers) {
          known.add(specifier.local.name);
        }
      },
      ExportNamedDeclaration(node) {
        if (!node.source) return;
        for (const specifier of node.specifiers) {
          remember(specifier.exported);
          remember(specifier.local);
        }
      },
      ExportAllDeclaration(node) {
        if (node.exported) remember(node.exported);
      },
      // A link can name a member of the declaration it documents; members
      // are not scope variables, so they are collected by hand.
      TSPropertySignature(node) {
        remember(node.key);
      },
      TSMethodSignature(node) {
        remember(node.key);
      },
      PropertyDefinition(node) {
        remember(node.key);
      },
      MethodDefinition(node) {
        remember(node.key);
      },
      Property(node) {
        remember(node.key);
      },
      TSEnumMember(node) {
        remember(node.id);
      },
      'Program:exit'() {
        for (const scope of sourceCode.scopeManager?.scopes ?? []) {
          for (const variable of scope.variables) known.add(variable.name);
        }

        for (const comment of sourceCode.getAllComments()) {
          if (comment.type !== 'Block' || !comment.value.startsWith('*')) {
            continue;
          }

          for (const match of comment.value.matchAll(_kLinkPattern)) {
            const [reference, ...labelParts] = match[1].split('|');
            const target = reference.trim();
            // Only a symbol-shaped target is checked: a URL, a module path
            // or an empty link is left alone.
            if (!/^[A-Za-z_$][\w$]*(?:[.#][\w$]+)*(?:\(\))?$/.test(target)) {
              continue;
            }

            const root = target.split(/[.#(]/)[0];
            if (known.has(root)) continue;

            // `comment.value` starts after the opening `/*`.
            const start = comment.range[0] + 2 + (match.index ?? 0);
            const end = start + match[0].length;
            const label = labelParts.join('|').trim();

            context.report({
              loc: {
                start: sourceCode.getLocFromIndex(start),
                end: sourceCode.getLocFromIndex(end),
              },
              messageId: 'linkOutOfFile',
              data: { name: target },
              fix: (fixer) =>
                fixer.replaceTextRange([start, end], label || `\`${target}\``),
            });
          }
        }
      },
    };
  },
});
