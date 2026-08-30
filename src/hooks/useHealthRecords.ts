import { useMemo } from 'react';
import { useApiPagedQuery } from '@/hooks/useApiPagedQuery';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useRemoteValue } from '@/hooks/useFlags';
import { buildTimeline, type TimelineGrouping } from '@/utils/timeline';
import type { Facets } from '@/types/pagination';
import type { HealthRecord, HealthRecordFilters } from '@/types/healthRecords';

function toQuery(filters: HealthRecordFilters, pageSize: number) {
  return {
    query: filters.query || undefined,
    types: filters.types.length ? filters.types.join(',') : undefined,
    tags: filters.tags.length ? filters.tags.join(',') : undefined,
    from: filters.from ?? undefined,
    to: filters.to ?? undefined,
    limit: pageSize,
  };
}

export function useHealthRecordTimeline(filters: HealthRecordFilters, grouping: TimelineGrouping) {
  const pageSize = useRemoteValue('pageSize');
  const debouncedQuery = useDebouncedValue(filters.query, 300);
  const effective = useMemo<HealthRecordFilters>(
    () => ({
      ...filters,
      query: debouncedQuery,
    }),
    [filters, debouncedQuery],
  );
  const query = useMemo(() => toQuery(effective, pageSize), [effective, pageSize]);
  const result = useApiPagedQuery<HealthRecord>('/health-records', query, [JSON.stringify(query)]);
  const timeline = useMemo(() => buildTimeline(result.items, grouping), [result.items, grouping]);
  return {
    ...result,
    records: result.items,
    rows: timeline.rows,
    stickyIndices: timeline.stickyIndices,
    sections: timeline.sections,
    isFetching: result.isLoading || result.isFetchingNextPage,
    isSettling: filters.query !== debouncedQuery,
  };
}

export function useHealthRecord(id: string) {
  return useApiQuery<HealthRecord>(
    {
      path: `/health-records/${id}`,
    },
    [id],
  );
}

export function useRecordFacets() {
  return useApiQuery<Facets>(
    {
      path: '/health-records/facets',
    },
    [],
  );
}
