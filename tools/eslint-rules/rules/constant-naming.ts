import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-constant-naming"
export const kConstantNamingRuleName = 'constant-naming';

type Resolver = (node: TSESTree.Expression) => boolean;

const isLiteralValue = (
  node: TSESTree.Expression,
  resolve?: Resolver,
): boolean => {
  switch (node.type) {
    case 'Literal':
      return !('regex' in node && node.regex);
    case 'TemplateLiteral':
      return node.expressions.length === 0;
    case 'UnaryExpression':
      return node.operator === '-' && node.argument.type === 'Literal';
    case 'BinaryExpression':
      return (
        node.left.type !== 'PrivateIdentifier' &&
        isLiteralValue(node.left, resolve) &&
        isLiteralValue(node.right, resolve)
      );
    case 'ArrayExpression':
      return node.elements.every(
        (el) =>
          el !== null &&
          el.type !== 'SpreadElement' &&
          isLiteralValue(el, resolve),
      );
    case 'TSAsExpression':
    case 'TSSatisfiesExpression':
      return isLiteralValue(node.expression, resolve);
    case 'Identifier':
      return resolve ? resolve(node) : false;
    default:
      return false;
  }
};

const isValidName = (name: string, exported: boolean): boolean => {
  if (exported) return /^k[A-Z]/.test(name);
  return /^_k[A-Z]/.test(name);
};

const toSuggested = (name: string): string =>
  name
    .replace(/^_+/, '')
    .split('_')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join('');

export const constantNamingRule = ESLintUtils.RuleCreator(() => __filename)({
  name: kConstantNamingRuleName,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require module-level constants to use k-prefix naming: `kFoo` for exported, `_kFoo` for private.',
    },
    schema: [],
    messages: {
      exportedConstant:
        'Exported constant "{{name}}" should use k-prefix (e.g., "k{{suggested}}").',
      privateConstant:
        'Private constant "{{name}}" should use _k-prefix (e.g., "_k{{suggested}}").',
    },
  },
  defaultOptions: [],
  create(context) {
    const resolvedConstants = new Set<string>();
    const pending: {
      node: TSESTree.Identifier;
      init: TSESTree.Expression;
      exported: boolean;
    }[] = [];

    const isConstantValue = (node: TSESTree.Expression): boolean => {
      if (node.type === 'Identifier') return resolvedConstants.has(node.name);
      return isLiteralValue(node, isConstantValue);
    };

    return {
      'Program:exit'() {
        for (const { node, init, exported } of pending) {
          if (!isConstantValue(init)) continue;
          if (isValidName(node.name, exported)) {
            resolvedConstants.add(node.name);
            continue;
          }

          resolvedConstants.add(node.name);

          context.report({
            node,
            messageId: exported ? 'exportedConstant' : 'privateConstant',
            data: { name: node.name, suggested: toSuggested(node.name) },
          });
        }
      },
      VariableDeclaration(node: TSESTree.VariableDeclaration) {
        if (node.kind !== 'const') return;

        const scope = context.sourceCode.getScope(node);
        if (scope.type !== 'module') return;

        const exported = node.parent?.type === 'ExportNamedDeclaration';

        for (const declarator of node.declarations) {
          if (declarator.id.type !== 'Identifier') continue;
          if (!declarator.init) continue;

          pending.push({
            node: declarator.id,
            init: declarator.init,
            exported,
          });
        }
      },
    };
  },
});
