import { useMemo } from 'react';
import { useApiPagedQuery } from '@/hooks/useApiPagedQuery';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useRemoteValue } from '@/hooks/useFlags';
import type { Facets } from '@/types/pagination';
import type { Doctor, DoctorFilters } from '@/types/consultations';

function toQuery(filters: DoctorFilters, pageSize: number) {
  return {
    query: filters.query || undefined,
    specializations: filters.specializations.length ? filters.specializations.join(',') : undefined,
    cities: filters.cities.length ? filters.cities.join(',') : undefined,
    modes: filters.modes.length ? filters.modes.join(',') : undefined,
    minRating: filters.minRating ?? undefined,
    maxFee: filters.maxFee ?? undefined,
    sort: filters.sort,
    limit: pageSize,
  };
}

export function useDoctorList(filters: DoctorFilters) {
  const pageSize = useRemoteValue('pageSize');
  const debouncedQuery = useDebouncedValue(filters.query, 300);
  const effective = useMemo<DoctorFilters>(
    () => ({
      ...filters,
      query: debouncedQuery,
    }),
    [filters, debouncedQuery],
  );
  const query = useMemo(() => toQuery(effective, pageSize), [effective, pageSize]);
  const result = useApiPagedQuery<Doctor>('/doctors', query, [JSON.stringify(query)]);
  return {
    ...result,
    doctors: result.items,
    isFetching: result.isLoading || result.isFetchingNextPage,
    isSettling: filters.query !== debouncedQuery,
  };
}

export function useDoctor(id: string) {
  return useApiQuery<Doctor>(
    {
      path: `/doctors/${id}`,
    },
    [id],
  );
}

export function useDoctorFacets() {
  return useApiQuery<Facets>(
    {
      path: '/doctors/facets',
    },
    [],
  );
}
