import { useMemo } from 'react';
import { useApiPagedQuery } from '@/hooks/useApiPagedQuery';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useRemoteValue } from '@/hooks/useFlags';
import type { Facets } from '@/types/pagination';
import type { Product, ProductFilters } from '@/types/shop';

function toQuery(filters: ProductFilters, pageSize: number) {
  return {
    query: filters.query || undefined,
    categories: filters.categories.length ? filters.categories.join(',') : undefined,
    brands: filters.brands.length ? filters.brands.join(',') : undefined,
    concerns: filters.concerns.length ? filters.concerns.join(',') : undefined,
    minRating: filters.minRating ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
    inStockOnly: filters.inStockOnly || undefined,
    sort: filters.sort,
    limit: pageSize,
  };
}

export function useProductList(filters: ProductFilters) {
  const pageSize = useRemoteValue('pageSize');
  const debouncedQuery = useDebouncedValue(filters.query, 300);
  const effective = useMemo<ProductFilters>(
    () => ({
      ...filters,
      query: debouncedQuery,
    }),
    [filters, debouncedQuery],
  );
  const query = useMemo(() => toQuery(effective, pageSize), [effective, pageSize]);
  const result = useApiPagedQuery<Product>('/products', query, [JSON.stringify(query)]);
  return {
    ...result,
    products: result.items,
    isFetching: result.isLoading || result.isFetchingNextPage,
    isSettling: filters.query !== debouncedQuery,
  };
}

export function useProduct(id: string) {
  return useApiQuery<Product>(
    {
      path: `/products/${id}`,
    },
    [id],
  );
}

export function useProductFacets() {
  return useApiQuery<Facets>(
    {
      path: '/products/facets',
    },
    [],
  );
}
