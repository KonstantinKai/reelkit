import type { ComponentObjectPropsOptions } from 'vue';

/**
 * Hand a runtime props object to a generic setup-function component.
 *
 * Vue 3.3 types `defineComponent(<T>(props: Props<T>) => …, options)`
 * generically only through the overload that takes prop names. The overload
 * that takes a props object reads the prop types back from that object, so a
 * type parameter on the setup function is lost. This presents the object as
 * the list of prop names to the type checker while Vue still receives the
 * object itself, so defaults, validation and boolean casting keep working.
 *
 * ```ts
 * export const Feed = defineComponent(
 *   <T extends Item>(props: FeedProps<T>) => () => …,
 *   { props: asGenericPropKeys<FeedProps<Item>>(feedProps) },
 * );
 * ```
 */
export function asGenericPropKeys<TProps extends object>(
  props: ComponentObjectPropsOptions,
): (keyof TProps)[] {
  return props as unknown as (keyof TProps)[];
}
