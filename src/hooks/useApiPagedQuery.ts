import { useCallback, useEffect, useRef, useState } from 'react';
import { callApi } from '@/services/api';
import { toApiError, type ApiError } from '@/services/errors';
import type { Page } from '@/types/pagination';

interface PagedState<T> {
  items: T[];
  nextCursor: string | null;
  total: number;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  error: ApiError | undefined;
}

const EMPTY = {
  items: [],
  nextCursor: null,
  total: 0,
  isLoading: true,
  isFetchingNextPage: false,
  isError: false,
  error: undefined,
};

export function useApiPagedQuery<T>(
  path: string,
  query: Record<string, string | number | boolean | undefined | null>,
  deps: readonly unknown[],
) {
  const [state, setState] = useState<PagedState<T>>(EMPTY as PagedState<T>);
  const [reloadToken, setReloadToken] = useState(0);
  const cursorRef = useRef<string | null>(null);
  const queryRef = useRef(query);
  queryRef.current = query;
  const refetch = useCallback(() => setReloadToken(n => n + 1), []);
  useEffect(() => {
    let cancelled = false;
    cursorRef.current = null;
    setState(EMPTY as PagedState<T>);
    callApi<Page<T>>({
      path,
      query: queryRef.current,
    })
      .then(page => {
        if (cancelled) return;
        cursorRef.current = page.nextCursor;
        setState({
          items: [...page.items],
          nextCursor: page.nextCursor,
          total: page.total,
          isLoading: false,
          isFetchingNextPage: false,
          isError: false,
          error: undefined,
        });
      })
      .catch(error => {
        if (cancelled) return;
        setState({
          ...(EMPTY as PagedState<T>),
          isLoading: false,
          isError: true,
          error: toApiError(error),
        });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps, reloadToken]);
  const fetchNextPage = useCallback(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    cursorRef.current = null;
    setState(previous => ({
      ...previous,
      isFetchingNextPage: true,
    }));
    callApi<Page<T>>({
      path,
      query: {
        ...queryRef.current,
        cursor,
      },
    })
      .then(page => {
        cursorRef.current = page.nextCursor;
        setState(previous => ({
          ...previous,
          items: [...previous.items, ...page.items],
          nextCursor: page.nextCursor,
          total: page.total,
          isFetchingNextPage: false,
        }));
      })
      .catch(error => {
        cursorRef.current = cursor;
        setState(previous => ({
          ...previous,
          isFetchingNextPage: false,
          error: toApiError(error),
        }));
      });
  }, [path]);
  return {
    ...state,
    hasNextPage: state.nextCursor !== null,
    fetchNextPage,
    refetch,
  };
}
