import { RuleTester } from '@typescript-eslint/rule-tester';
import type { RuleTesterConfig } from '@typescript-eslint/rule-tester';
import { constantNamingRule, kConstantNamingRuleName } from './constant-naming';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: { sourceType: 'module' },
  },
} as RuleTesterConfig);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
ruleTester.run(kConstantNamingRuleName, constantNamingRule as any, {
  valid: [
    // Private constant with _k prefix
    { code: `const _kMaxRetry = 5;` },
    // Exported constant with k prefix
    { code: `export const kMaxRetry = 5;` },
    // String constant
    { code: `const _kColor = '#fff';` },
    // Boolean constant
    { code: `const _kEnabled = true;` },
    // Template literal without expressions
    { code: 'const _kLabel = `hello`;' },
    // Negative number
    { code: `const _kOffset = -10;` },
    // Binary expression of literals
    { code: `const _kDuration = 300 + 100;` },
    // Array of literals
    { code: `const _kItems = [1, 2, 3];` },
    // as const assertion
    { code: `const _kItems = [1, 2, 3] as const;` },
    // Reference to another constant in binary expression
    { code: `const _kBase = 300;\nconst _kThrottle = _kBase + 100;` },

    // --- Should NOT be flagged (not constants) ---

    // Function expression
    { code: `const myFn = () => {};` },
    // Arrow function
    { code: `const add = (a: number, b: number) => a + b;` },
    // Function call
    { code: `const result = createFoo();` },
    // New expression
    { code: `const map = new Map();` },
    // Object literal (mutable structure)
    { code: `const config = { a: 1 };` },
    // Identifier reference
    { code: `const alias = otherValue;` },
    // Template literal with expression
    { code: 'const msg = `hello ${name}`;' },
    // let declaration
    { code: `let MAX = 5;` },
    // Inside function (not module-level)
    { code: `function foo() { const MAX = 5; }` },
    // Inside block
    { code: `if (true) { const MAX = 5; }` },
    // Destructuring
    { code: `const { a, b } = obj;` },
    // Array destructuring
    { code: `const [x, y] = arr;` },
    // Class instance
    { code: `const shared = createSharedVideo({ className: 'foo' });` },
    // Map constructor
    { code: `const NAV_KEY_CODES = new Map([['a', 1]]);` },
    // Already valid private
    { code: `const _kFoo = 'bar';` },
    // Already valid exported
    { code: `export const kFoo = 'bar';` },
    // Regex (not a simple literal in our rule)
    { code: `const pattern = /foo/;` },
  ],

  invalid: [
    // SCREAMING_SNAKE_CASE private constant
    {
      code: `const MAX_RETRY = 5;`,
      errors: [
        {
          messageId: 'privateConstant' as const,
          data: { name: 'MAX_RETRY', suggested: 'MaxRetry' },
        },
      ],
    },
    // SCREAMING_SNAKE_CASE exported constant
    {
      code: `export const MAX_RETRY = 5;`,
      errors: [
        {
          messageId: 'exportedConstant' as const,
          data: { name: 'MAX_RETRY', suggested: 'MaxRetry' },
        },
      ],
    },
    // camelCase private constant with literal
    {
      code: `const defaultDuration = 5000;`,
      errors: [
        {
          messageId: 'privateConstant' as const,
          data: { name: 'defaultDuration', suggested: 'Defaultduration' },
        },
      ],
    },
    // String constant without prefix
    {
      code: `const BG_COLOR = 'rgba(255, 255, 255, 0.3)';`,
      errors: [
        {
          messageId: 'privateConstant' as const,
          data: { name: 'BG_COLOR', suggested: 'BgColor' },
        },
      ],
    },
    // Boolean constant
    {
      code: `const ENABLED = true;`,
      errors: [{ messageId: 'privateConstant' as const }],
    },
    // Negative number constant
    {
      code: `const OFFSET = -1;`,
      errors: [{ messageId: 'privateConstant' as const }],
    },
    // Binary expression constant
    {
      code: `const THROTTLE = 300 + 100;`,
      errors: [{ messageId: 'privateConstant' as const }],
    },
    // Array constant
    {
      code: `const ITEMS = [1, 2, 3];`,
      errors: [{ messageId: 'privateConstant' as const }],
    },
    // Exported with wrong prefix (_k instead of k)
    {
      code: `export const _kFoo = 5;`,
      errors: [{ messageId: 'exportedConstant' as const }],
    },
    // Private with k prefix (should be _k)
    {
      code: `const kFoo = 5;`,
      errors: [{ messageId: 'privateConstant' as const }],
    },
    // as const array
    {
      code: `const TRANSITIONS = ['slide', 'fade'] as const;`,
      errors: [{ messageId: 'privateConstant' as const }],
    },
    // Constant with JSDoc
    {
      code: `
/** Max retries */
const MAX_RETRY = 3;`,
      errors: [{ messageId: 'privateConstant' as const }],
    },
    // Constant derived from another constant
    {
      code: `const _kBase = 300;\nconst THROTTLE = _kBase + 100;`,
      errors: [{ messageId: 'privateConstant' as const }],
    },
    // Both constants wrong
    {
      code: `const BASE = 300;\nconst THROTTLE = BASE + 100;`,
      errors: [
        {
          messageId: 'privateConstant' as const,
          data: { name: 'BASE', suggested: 'Base' },
        },
        {
          messageId: 'privateConstant' as const,
          data: { name: 'THROTTLE', suggested: 'Throttle' },
        },
      ],
    },
  ],
});
