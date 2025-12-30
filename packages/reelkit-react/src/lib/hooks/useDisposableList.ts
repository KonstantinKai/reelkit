import { useState } from 'react';
import { createDisposableList, type DisposableList } from '@reelkit/core';

export const useDisposableList = (): DisposableList => {
  const [disposableList] = useState(createDisposableList);
  return disposableList;
};

export default useDisposableList;
