import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-lines-between-type-members"
export const linesBetweenTypeMembersRuleName = 'lines-between-type-members';

export const linesBetweenTypeMembersRule = ESLintUtils.RuleCreator(
  () => __filename,
)({
  name: linesBetweenTypeMembersRuleName,
  meta: {
    type: 'layout',
    docs: {
      description:
        'Require a blank line between properties in interfaces and type literals',
    },
    fixable: 'whitespace',
    schema: [
      {
        type: 'object',
        properties: {
          exceptAfterCommentlessMembers: {
            type: 'boolean',
            description:
              'When true, a blank line is not required before a member that has no leading comment or JSDoc.',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingBlankLine: 'Expected a blank line between type/interface members.',
    },
  },
  defaultOptions: [{ exceptAfterCommentlessMembers: false }],
  create(context, [options]) {
    const sourceCode = context.sourceCode;
    const exceptAfterCommentlessMembers =
      options.exceptAfterCommentlessMembers ?? false;

    function checkMembers(members: TSESTree.TypeElement[]) {
      for (let i = 1; i < members.length; i++) {
        const prev = members[i - 1];
        const current = members[i];

        const prevEndLine = prev.loc.end.line;

        // Get the first line of the current member (including any leading comment/JSDoc)
        const commentsBefore = sourceCode.getCommentsBefore(current);
        const currentStartLine =
          commentsBefore.length > 0
            ? commentsBefore[0].loc.start.line
            : current.loc.start.line;

        const linesBetween = currentStartLine - prevEndLine - 1;

        // Skip if the current member has no comment and the option is enabled
        if (exceptAfterCommentlessMembers && commentsBefore.length === 0) {
          continue;
        }

        if (linesBetween < 1) {
          context.report({
            node: current,
            messageId: 'missingBlankLine',
            fix(fixer) {
              const rangeStart = sourceCode.getIndexFromLoc({
                line: prevEndLine,
                column: 0,
              });
              const lineEnd = sourceCode.lines[prevEndLine - 1];
              const rangeEnd = rangeStart + (lineEnd?.length ?? 0);
              return fixer.insertTextAfterRange([rangeStart, rangeEnd], '\n');
            },
          });
        }
      }
    }

    return {
      TSInterfaceBody(node) {
        checkMembers(node.body);
      },
      TSTypeLiteral(node) {
        // Skip single-line inline type literals like { id: string; name: string }
        if (node.loc.start.line === node.loc.end.line) return;
        checkMembers(node.members);
      },
    };
  },
});
