import { RuleTester } from '@typescript-eslint/rule-tester';
import type { RuleTesterConfig } from '@typescript-eslint/rule-tester';
import {
  fieldsBeforeCallbacksRule,
  fieldsBeforeCallbacksRuleName,
} from './fields-before-callbacks';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
  },
} as RuleTesterConfig);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
ruleTester.run(fieldsBeforeCallbacksRuleName, fieldsBeforeCallbacksRule as any, {
  valid: [
    // Fields before callbacks
    {
      code: `
interface Foo {
  name: string;
  count: number;
  onClick: () => void;
  onHover: (x: number) => void;
}`,
    },
    // Only fields
    {
      code: `
interface Foo {
  name: string;
  count: number;
}`,
    },
    // Only callbacks
    {
      code: `
interface Foo {
  onClick: () => void;
  onHover: () => void;
}`,
    },
    // Empty interface
    {
      code: `interface Foo {}`,
    },
    // Single field
    {
      code: `
interface Foo {
  name: string;
}`,
    },
    // Single callback
    {
      code: `
interface Foo {
  onClick: () => void;
}`,
    },
    // Type literal — fields before callbacks
    {
      code: `
type Foo = {
  name: string;
  onClick: () => void;
};`,
    },
    // Single-line type literal — skipped
    {
      code: `const x: { onClick: () => void; name: string } = {} as any;`,
    },
    // Fields with JSDoc before callbacks with JSDoc
    {
      code: `
interface Foo {
  /** The name */
  name: string;

  /** The count */
  count: number;

  /** Click handler */
  onClick: () => void;
}`,
    },
    // Method signatures are not considered callbacks
    {
      code: `
interface Foo {
  reset(): void;
  name: string;
}`,
    },
    // Mixed method signatures and property callbacks
    {
      code: `
interface Foo {
  name: string;
  reset(): void;
  onClick: () => void;
}`,
    },
    // Optional fields before optional callbacks
    {
      code: `
interface Foo {
  name?: string;
  onClick?: () => void;
}`,
    },
    // Readonly fields before callbacks
    {
      code: `
interface Foo {
  readonly name: string;
  onClick: () => void;
}`,
    },
    // Complex non-function types are treated as fields
    {
      code: `
interface Foo {
  items: Array<string>;
  map: Map<string, number>;
  nested: { a: string };
  onChange: () => void;
}`,
    },
    // Index signatures are not fields — ignored by rule
    {
      code: `
interface Foo {
  onClick: () => void;
  [key: string]: unknown;
}`,
    },
    // Union type that is NOT all functions — treated as field
    {
      code: `
interface Foo {
  value: string | number;
  onClick: () => void;
}`,
    },
  ],

  invalid: [
    // Field after callback in interface
    {
      code: `
interface Foo {
  onClick: () => void;
  name: string;
}`,
      output: `
interface Foo {
  name: string;
  onClick: () => void;
}`,
      errors: [
        { messageId: 'fieldAfterCallback' as const, data: { name: 'name' } },
      ],
    },
    // Field after callback in type literal
    {
      code: `
type Foo = {
  onClick: () => void;
  name: string;
};`,
      output: `
type Foo = {
  name: string;
  onClick: () => void;
};`,
      errors: [
        { messageId: 'fieldAfterCallback' as const, data: { name: 'name' } },
      ],
    },
    // Multiple fields after callback
    {
      code: `
interface Foo {
  onClick: () => void;
  name: string;
  count: number;
}`,
      output: `
interface Foo {
  name: string;
  count: number;
  onClick: () => void;
}`,
      errors: [
        { messageId: 'fieldAfterCallback' as const, data: { name: 'name' } },
        { messageId: 'fieldAfterCallback' as const, data: { name: 'count' } },
      ],
    },
    // Interleaved fields and callbacks
    {
      code: `
interface Foo {
  name: string;
  onClick: () => void;
  count: number;
  onHover: () => void;
}`,
      output: `
interface Foo {
  name: string;
  count: number;
  onClick: () => void;
  onHover: () => void;
}`,
      errors: [
        { messageId: 'fieldAfterCallback' as const, data: { name: 'count' } },
      ],
    },
    // Field with JSDoc after callback with JSDoc
    {
      code: `
interface Foo {
  /** Click handler */
  onClick: () => void;

  /** The name */
  name: string;
}`,
      output: `
interface Foo {
  /** The name */
  name: string;

  /** Click handler */
  onClick: () => void;
}`,
      errors: [
        { messageId: 'fieldAfterCallback' as const, data: { name: 'name' } },
      ],
    },
    // Field with inline comment after callback
    {
      code: `
interface Foo {
  onClick: () => void;
  // The name
  name: string;
}`,
      output: `
interface Foo {
  // The name
  name: string;
  onClick: () => void;
}`,
      errors: [
        { messageId: 'fieldAfterCallback' as const, data: { name: 'name' } },
      ],
    },
    // Optional field after optional callback
    {
      code: `
interface Foo {
  onClick?: () => void;
  name?: string;
}`,
      output: `
interface Foo {
  name?: string;
  onClick?: () => void;
}`,
      errors: [
        { messageId: 'fieldAfterCallback' as const, data: { name: 'name' } },
      ],
    },
    // Readonly field after callback
    {
      code: `
interface Foo {
  onClick: () => void;
  readonly name: string;
}`,
      output: `
interface Foo {
  readonly name: string;
  onClick: () => void;
}`,
      errors: [
        { messageId: 'fieldAfterCallback' as const, data: { name: 'name' } },
      ],
    },
    // Union of all functions is still a callback
    {
      code: `
interface Foo {
  handler: (() => void) | ((x: number) => void);
  name: string;
}`,
      output: `
interface Foo {
  name: string;
  handler: (() => void) | ((x: number) => void);
}`,
      errors: [
        { messageId: 'fieldAfterCallback' as const, data: { name: 'name' } },
      ],
    },
  ],
});
