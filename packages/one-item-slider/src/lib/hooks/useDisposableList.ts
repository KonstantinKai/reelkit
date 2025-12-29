import { useState } from 'react';

type Disposer = () => void;

export interface DisposableList {
  push: (...disposers: Disposer[]) => void;
  dispose: () => void;
}

export const makeDisposableList = (): DisposableList => {
  const disposers: Disposer[] = [];
  return {
    push: (...values) => disposers.push(...values),
    dispose: () => {
      disposers.forEach((dispose) => dispose());
      disposers.splice(0, disposers.length);
    },
  };
};

export const useDisposableList = (): DisposableList => {
  const result = useState<DisposableList>(makeDisposableList)[0];
  return result;
};
