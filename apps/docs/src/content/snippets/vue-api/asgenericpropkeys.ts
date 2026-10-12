import { defineComponent, h, type PropType } from 'vue';
import { asGenericPropKeys } from '@reelkit/vue';

interface Item {
  id: string;
}

interface FeedProps<T extends Item> {
  items: T[];
  loop?: boolean;
}

const feedProps = {
  items: { type: Array as PropType<Item[]>, required: true as const },
  loop: { type: Boolean, default: false },
};

export const Feed = defineComponent(
  <T extends Item = Item>(props: FeedProps<T>) =>
    () =>
      h('ul', props.items.map((item) => h('li', item.id))),
  { name: 'Feed', props: asGenericPropKeys<FeedProps<Item>>(feedProps) },
);
