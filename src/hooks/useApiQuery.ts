import { useCallback, useEffect, useState } from 'react';
import { callApi, type ApiRequest } from '@/services/api';
import { toApiError, type ApiError } from '@/services/errors';

interface QueryState<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: ApiError | undefined;
}

export function useApiQuery<T>(request: ApiRequest, deps: readonly unknown[]) {
  const [state, setState] = useState<QueryState<T>>({
    data: undefined,
    isLoading: true,
    isError: false,
    isSuccess: false,
    error: undefined,
  });
  const [reloadToken, setReloadToken] = useState(0);
  const refetch = useCallback(() => setReloadToken(n => n + 1), []);
  useEffect(() => {
    let cancelled = false;
    setState(previous => ({
      ...previous,
      isLoading: true,
      isError: false,
      error: undefined,
    }));
    callApi<T>(request)
      .then(data => {
        if (cancelled) return;
        setState({
          data,
          isLoading: false,
          isError: false,
          isSuccess: true,
          error: undefined,
        });
      })
      .catch(error => {
        if (cancelled) return;
        setState({
          data: undefined,
          isLoading: false,
          isError: true,
          isSuccess: false,
          error: toApiError(error),
        });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken]);
  return {
    ...state,
    refetch,
  };
}
