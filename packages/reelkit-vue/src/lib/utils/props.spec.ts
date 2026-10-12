/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  createSSRApp,
  defineComponent,
  h,
  type Component,
  type PropType,
} from 'vue';
import { renderToString } from 'vue/server-renderer';
import { asGenericPropKeys } from './props';

interface Item {
  id: string;
}

interface ListProps<T extends Item> {
  items: T[];
  loop?: boolean;
}

const listProps = {
  items: { type: Array as PropType<Item[]>, required: true as const },
  loop: { type: Boolean, default: false },
};

const List = defineComponent(
  <T extends Item = Item>(props: ListProps<T>) =>
    () =>
      h('p', `${props.items.length}:${String(props.loop)}`),
  { name: 'List', props: asGenericPropKeys<ListProps<Item>>(listProps) },
);

// Untyped on purpose: the boolean case passes the empty string a bare
// attribute compiles to, which the typed props would not accept.
const render = (props: Record<string, unknown>) =>
  renderToString(createSSRApp({ render: () => h(List as Component, props) }));

describe('asGenericPropKeys', () => {
  it('hands Vue the props object itself', () => {
    expect(asGenericPropKeys(listProps)).toBe(listProps);
  });

  it('keeps runtime defaults and boolean casting', async () => {
    expect(await render({ items: [{ id: 'a' }] })).toBe('<p>1:false</p>');
    expect(await render({ items: [], loop: '' })).toBe('<p>0:true</p>');
  });

  it('keeps the type parameter of the setup function', () => {
    interface Product extends Item {
      sku: string;
    }
    const products: Product[] = [{ id: 'p', sku: 'A-1' }];
    // Only inspected by the type checker, never called.
    const construct = () => new List({ items: products });

    expectTypeOf<
      ReturnType<typeof construct>['$props']['items']
    >().toEqualTypeOf<Product[]>();

    const reject = () =>
      // @ts-expect-error numbers are not items
      new List({ items: [1] });
    expectTypeOf(reject).toBeFunction();
  });
});
