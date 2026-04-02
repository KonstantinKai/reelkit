import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-fields-before-callbacks"
export const fieldsBeforeCallbacksRuleName = 'fields-before-callbacks';

type TypeElement = TSESTree.TypeElement;

const isFunctionType = (node: TSESTree.TypeNode): boolean => {
  switch (node.type) {
    case 'TSFunctionType':
      return true;
    case 'TSUnionType':
    case 'TSIntersectionType':
      return node.types.every(isFunctionType);
    default:
      return false;
  }
};

const isCallbackMember = (member: TypeElement): boolean => {
  if (member.type !== 'TSPropertySignature') return false;
  const annotation = member.typeAnnotation?.typeAnnotation;
  if (!annotation) return false;
  return isFunctionType(annotation);
};

export const fieldsBeforeCallbacksRule = ESLintUtils.RuleCreator(
  () => __filename,
)({
  name: fieldsBeforeCallbacksRuleName,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require data fields to appear before callback (function-typed) fields in interfaces and type literals.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      fieldAfterCallback:
        'Data field "{{name}}" should appear before callback fields.',
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;

    function getFullText(member: TypeElement): string {
      const comments = sourceCode.getCommentsBefore(member);
      const start =
        comments.length > 0
          ? sourceCode.getIndexFromLoc(comments[0].loc.start)
          : member.range[0];
      return sourceCode.getText().slice(start, member.range[1]);
    }

    function getMemberName(member: TypeElement): string {
      if (member.type === 'TSPropertySignature') {
        return member.key.type === 'Identifier'
          ? member.key.name
          : sourceCode.getText(member.key);
      }
      return sourceCode.getText(member);
    }

    function checkMembers(members: TypeElement[]) {
      const violations: TypeElement[] = [];
      let lastCallbackIndex = -1;

      for (let i = 0; i < members.length; i++) {
        const member = members[i];

        if (isCallbackMember(member)) {
          lastCallbackIndex = i;
        } else if (
          member.type === 'TSPropertySignature' &&
          lastCallbackIndex >= 0
        ) {
          violations.push(member);
        }
      }

      if (violations.length === 0) return;

      for (let i = 0; i < violations.length; i++) {
        const member = violations[i];
        const isFirst = i === 0;

        context.report({
          node: member,
          messageId: 'fieldAfterCallback',
          data: { name: getMemberName(member) },
          ...(isFirst
            ? {
                fix(fixer) {
                  const fields: TypeElement[] = [];
                  const callbacks: TypeElement[] = [];
                  const others: TypeElement[] = [];

                  for (const m of members) {
                    if (isCallbackMember(m)) callbacks.push(m);
                    else if (m.type === 'TSPropertySignature') fields.push(m);
                    else others.push(m);
                  }

                  const reordered = [...others, ...fields, ...callbacks];
                  const texts = reordered.map((m) => {
                    const hasComment =
                      sourceCode.getCommentsBefore(m).length > 0;
                    return { text: getFullText(m), hasComment };
                  });
                  const parts: string[] = [];
                  for (let j = 0; j < texts.length; j++) {
                    if (j > 0) {
                      parts.push(texts[j].hasComment ? '\n\n  ' : '\n  ');
                    }
                    parts.push(texts[j].text);
                  }
                  const joined = parts.join('');

                  const firstComments = sourceCode.getCommentsBefore(
                    members[0],
                  );
                  const rangeStart =
                    firstComments.length > 0
                      ? sourceCode.getIndexFromLoc(firstComments[0].loc.start)
                      : members[0].range[0];
                  const rangeEnd = members[members.length - 1].range[1];

                  return fixer.replaceTextRange([rangeStart, rangeEnd], joined);
                },
              }
            : {}),
        });
      }
    }

    return {
      TSInterfaceBody(node) {
        checkMembers(node.body);
      },
      TSTypeLiteral(node) {
        if (node.loc.start.line === node.loc.end.line) return;
        checkMembers(node.members);
      },
    };
  },
});
