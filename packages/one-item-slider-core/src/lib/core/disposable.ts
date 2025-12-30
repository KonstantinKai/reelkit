export type Disposer = () => void;

export interface DisposableList {
  push: (...disposers: Disposer[]) => void;
  dispose: () => void;
}

export const createDisposableList = (): DisposableList => {
  const disposers: Disposer[] = [];
  return {
    push: (...values) => disposers.push(...values),
    dispose: () => {
      disposers.forEach((dispose) => dispose());
      disposers.splice(0, disposers.length);
    },
  };
};
