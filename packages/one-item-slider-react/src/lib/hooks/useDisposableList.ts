import { useState } from 'react';
import { createDisposableList, type DisposableList } from '@kdevsoft/one-item-slider-core';

export const useDisposableList = (): DisposableList => {
  const [disposableList] = useState(createDisposableList);
  return disposableList;
};

export default useDisposableList;
