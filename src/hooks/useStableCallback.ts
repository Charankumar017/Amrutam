import { useCallback, useRef } from 'react';

export function useStableCallback<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult,
): (...args: TArgs) => TResult {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args: TArgs) => ref.current(...args), []);
}
