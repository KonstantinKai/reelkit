import { RuleTester } from '@typescript-eslint/rule-tester';
import type { RuleTesterConfig } from '@typescript-eslint/rule-tester';
import {
  jsdocLinkInFileRule,
  kJsdocLinkInFileRuleName,
} from './jsdoc-link-in-file';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
  },
} as RuleTesterConfig);

ruleTester.run(
  kJsdocLinkInFileRuleName,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsdocLinkInFileRule as any,
  {
    valid: [
      // An imported symbol, value or type
      {
        code: `
import { Reel } from './Reel';
import type { Options } from './types';
/** Pairs {@link Reel} with {@link Options}. */
export const x = 1;`,
      },
      // A symbol the file declares, and one of its members
      {
        code: `
/** See {@link Foo.bar}. */
export interface Foo {
  bar: number;
}`,
      },
      // A member named on its own, from a sibling member's comment
      {
        code: `
export interface Store {
  /** Like {@link resolve}, but writes. */
  record: () => void;
  resolve: () => void;
}`,
      },
      // A re-exported symbol, as an index file links to it
      {
        code: `
export { createSignal } from './signal';
/** Built on {@link createSignal}. */
export const y = 1;`,
      },
      // A URL, and a link with a label
      {
        code: `
/** See {@link https://example.com | the docs}. */
export const z = 1;`,
      },
      // A plain block comment is not documentation
      {
        code: `
/* {@link Nowhere} */
export const w = 1;`,
      },
    ],
    invalid: [
      // A symbol from another file, mentioned without an import
      {
        code: `
/** Wraps {@link Reel}. */
export const x = 1;`,
        output: `
/** Wraps \`Reel\`. */
export const x = 1;`,
        errors: [{ messageId: 'linkOutOfFile', data: { name: 'Reel' } }],
      },
      // A member path whose root is unknown
      {
        code: `
/** Calls {@link Reel.next}. */
export const x = 1;`,
        output: `
/** Calls \`Reel.next\`. */
export const x = 1;`,
        errors: [{ messageId: 'linkOutOfFile', data: { name: 'Reel.next' } }],
      },
      // A labelled link keeps its label as plain text
      {
        code: `
/** See {@link Reel | the slider}. */
export const x = 1;`,
        output: `
/** See the slider. */
export const x = 1;`,
        errors: [{ messageId: 'linkOutOfFile', data: { name: 'Reel' } }],
      },
      // Inside a member's comment as well
      {
        code: `
export interface Foo {
  /** Handed to {@link Bar}. */
  bar: number;
}`,
        output: `
export interface Foo {
  /** Handed to \`Bar\`. */
  bar: number;
}`,
        errors: [{ messageId: 'linkOutOfFile', data: { name: 'Bar' } }],
      },
    ],
  },
);
