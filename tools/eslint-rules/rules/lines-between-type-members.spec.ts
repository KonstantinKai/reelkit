import { RuleTester } from '@typescript-eslint/rule-tester';
import type { RuleTesterConfig } from '@typescript-eslint/rule-tester';
import { rule, RULE_NAME } from './lines-between-type-members';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
  },
} as RuleTesterConfig);

// NOTE: type assertion needed due to @typescript-eslint/utils vs rule-tester version mismatch
// eslint-disable-next-line @typescript-eslint/no-explicit-any
ruleTester.run(RULE_NAME, rule as any, {
  valid: [
    // Single member — no blank line needed
    {
      code: `
interface Foo {
  a: string;
}`,
    },
    // Blank line between members
    {
      code: `
interface Foo {
  a: string;

  b: number;
}`,
    },
    // Blank line between members with JSDoc
    {
      code: `
interface Foo {
  /** First prop */
  a: string;

  /** Second prop */
  b: number;
}`,
    },
    // Type literal with blank lines
    {
      code: `
type Foo = {
  a: string;

  b: number;
};`,
    },
    // Empty interface
    {
      code: `
interface Foo {}`,
    },
    // Multiple blank lines (only enforces minimum)
    {
      code: `
interface Foo {
  a: string;


  b: number;
}`,
    },
    // Single-line inline type literal — skip
    {
      code: `
const items: { id: string; name: string }[] = [];`,
    },
    // Single-line inline type literal in function param
    {
      code: `
function foo(opts: { a: number; b: string }) {}`,
    },
    // exceptAfterCommentlessMembers: commentless members don't need blank line
    {
      code: `
interface Foo {
  a: string;
  b: number;
}`,
      options: [{ exceptAfterCommentlessMembers: true }],
    },
    // exceptAfterCommentlessMembers: mixed — commentless OK, commented has blank line
    {
      code: `
interface Foo {
  a: string;
  b: number;

  /** Third prop */
  c: boolean;
}`,
      options: [{ exceptAfterCommentlessMembers: true }],
    },
    // exceptAfterCommentlessMembers: all commented with blank lines
    {
      code: `
interface Foo {
  /** First */
  a: string;

  /** Second */
  b: number;
}`,
      options: [{ exceptAfterCommentlessMembers: true }],
    },
    // exceptAfterCommentlessMembers: type literal
    {
      code: `
type Foo = {
  a: string;
  b: number;
  c: boolean;
};`,
      options: [{ exceptAfterCommentlessMembers: true }],
    },
    // exceptAfterCommentlessMembers: single-line comment also counts
    {
      code: `
interface Foo {
  a: string;

  // Second prop
  b: number;
}`,
      options: [{ exceptAfterCommentlessMembers: true }],
    },
  ],

  invalid: [
    // Interface — no blank line
    {
      code: `
interface Foo {
  a: string;
  b: number;
}`,
      output: `
interface Foo {
  a: string;

  b: number;
}`,
      errors: [{ messageId: 'missingBlankLine' as const }],
    },
    // Type literal — no blank line
    {
      code: `
type Foo = {
  a: string;
  b: number;
};`,
      output: `
type Foo = {
  a: string;

  b: number;
};`,
      errors: [{ messageId: 'missingBlankLine' as const }],
    },
    // Three members — two errors (fix applied iteratively)
    {
      code: `
interface Foo {
  a: string;
  b: number;
  c: boolean;
}`,
      output: `
interface Foo {
  a: string;

  b: number;

  c: boolean;
}`,
      errors: [
        { messageId: 'missingBlankLine' as const },
        { messageId: 'missingBlankLine' as const },
      ],
    },
    // JSDoc on second member but no blank line
    {
      code: `
interface Foo {
  a: string;
  /** Second prop */
  b: number;
}`,
      output: `
interface Foo {
  a: string;

  /** Second prop */
  b: number;
}`,
      errors: [{ messageId: 'missingBlankLine' as const }],
    },
    // Mixed: first pair OK, second pair missing
    {
      code: `
interface Foo {
  a: string;

  b: number;
  c: boolean;
}`,
      output: `
interface Foo {
  a: string;

  b: number;

  c: boolean;
}`,
      errors: [{ messageId: 'missingBlankLine' as const }],
    },
    // exceptAfterCommentlessMembers: commented member still needs blank line
    {
      code: `
interface Foo {
  a: string;
  /** Second prop */
  b: number;
}`,
      output: `
interface Foo {
  a: string;

  /** Second prop */
  b: number;
}`,
      options: [{ exceptAfterCommentlessMembers: true }],
      errors: [{ messageId: 'missingBlankLine' as const }],
    },
    // exceptAfterCommentlessMembers: single-line comment also needs blank line
    {
      code: `
interface Foo {
  a: string;
  // Second prop
  b: number;
}`,
      output: `
interface Foo {
  a: string;

  // Second prop
  b: number;
}`,
      options: [{ exceptAfterCommentlessMembers: true }],
      errors: [{ messageId: 'missingBlankLine' as const }],
    },
    // exceptAfterCommentlessMembers: mixed — only commented member errors
    {
      code: `
interface Foo {
  a: string;
  b: number;
  /** Third */
  c: boolean;
}`,
      output: `
interface Foo {
  a: string;
  b: number;

  /** Third */
  c: boolean;
}`,
      options: [{ exceptAfterCommentlessMembers: true }],
      errors: [{ messageId: 'missingBlankLine' as const }],
    },
    // exceptAfterCommentlessMembers: type literal with comment
    {
      code: `
type Foo = {
  a: string;
  /** Second */
  b: number;
};`,
      output: `
type Foo = {
  a: string;

  /** Second */
  b: number;
};`,
      options: [{ exceptAfterCommentlessMembers: true }],
      errors: [{ messageId: 'missingBlankLine' as const }],
    },
  ],
});
