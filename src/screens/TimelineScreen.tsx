import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { ListFooter } from '@/components/ListFooter';
import { OfflineBanner } from '@/components/OfflineBanner';
import { RecordRow, TimelineSectionHeader } from '@/components/RecordRow';
import { RecordFilterSheet } from '@/components/RecordFilterSheet';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchField } from '@/components/SearchField';
import { useHealthRecordTimeline, useRecordFacets } from '@/hooks/useHealthRecords';
import { useStableCallback } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  recordFilterActions,
  selectRecordFilters,
  selectRecordGrouping,
  selectRecordQuery,
} from '@/redux/slices/recordFiltersSlice';
import { countActiveRecordFilters } from '@/utils/timeline';
import type { TimelineRow } from '@/types/healthRecords';
import { useTranslation } from '@/hooks/useTranslation';

const keyExtractor = (row: TimelineRow) => row.key;

const getItemType = (row: TimelineRow) => row.kind;

export function TimelineScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const dispatch = useAppDispatch();
  const query = useAppSelector(selectRecordQuery);
  const filters = useAppSelector(selectRecordFilters);
  const grouping = useAppSelector(selectRecordGrouping);
  const setQuery = useCallback(
    (next: string) => dispatch(recordFilterActions.queryChanged(next)),
    [dispatch],
  );
  const facets = useRecordFacets();
  const timeline = useHealthRecordTimeline(filters, grouping);
  const activeFilters = countActiveRecordFilters(filters);
  const openRecord = useStableCallback((recordId: string) =>
    navigation.navigate('RecordDetail', {
      recordId,
    }),
  );
  const renderItem = useCallback(
    ({ item }: { item: TimelineRow }) =>
      item.kind === 'header' ? (
        <TimelineSectionHeader section={item.section} />
      ) : (
        <RecordRow record={item.record} onPress={openRecord} />
      ),
    [openRecord],
  );
  const loadMore = useCallback(() => {
    if (timeline.hasNextPage && !timeline.isFetchingNextPage) void timeline.fetchNextPage();
  }, [timeline]);
  const body = () => {
    if (timeline.isLoading) return <ActivityIndicator size="large" color="#23684A" style={styles.loader} />;
    if (timeline.isError && timeline.rows.length === 0) {
      return (
        <ErrorState error={timeline.error} onRetry={() => void timeline.refetch()} testID="timeline-error" />
      );
    }
    if (timeline.rows.length === 0) {
      return (
        <EmptyState
          testID="timeline-empty"
          glyph="🗂"
          title={t('records.empty.title')}
          description={t('records.empty.body')}
          actionLabel={activeFilters > 0 ? t('common.reset') : undefined}
          onAction={activeFilters > 0 ? () => dispatch(recordFilterActions.filtersReset()) : undefined}
        />
      );
    }
    return (
      <FlashList
        testID="timeline-list"
        data={timeline.rows}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        stickyHeaderIndices={timeline.stickyIndices}
        drawDistance={250}
        keyboardShouldPersistTaps="handled"
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        ListFooterComponent={
          <ListFooter
            isFetchingNextPage={timeline.isFetchingNextPage}
            hasNextPage={Boolean(timeline.hasNextPage)}
            count={timeline.records.length}
            total={timeline.total}
          />
        }
      />
    );
  };
  return (
    <ScreenContainer testID="timeline-screen" edges={['top']}>
      <OfflineBanner />
      <ScreenHeader
        title={t('records.title')}
        subtitle={
          timeline.total > 0
            ? t('common.results', {
                count: timeline.total.toLocaleString(),
              })
            : undefined
        }
      />

      <View style={styles.controls}>
        <SearchField
          testID="record-search"
          value={query}
          onChangeText={setQuery}
          placeholder={t('records.searchPlaceholder')}
          accessibilityLabel={t('records.searchA11y')}
        />
        <View style={styles.controlRow}>
          <Text style={styles.status}>
            {timeline.isSettling || timeline.isFetching ? t('common.searching') : ' '}
          </Text>
          <Pressable
            testID="open-record-filters"
            onPress={() => setFiltersVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={t('common.filters')}
            hitSlop={8}
          >
            <Text style={styles.filters}>
              {activeFilters > 0 ? `${t('common.filters')} · ${activeFilters} ⌄` : `${t('common.filters')} ⌄`}
            </Text>
          </Pressable>
        </View>
      </View>

      {body()}

      <RecordFilterSheet
        visible={filtersVisible}
        onDismiss={() => setFiltersVisible(false)}
        facets={facets.data}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 32 },
  controls: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 12,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  status: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
  },
  filters: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#23684A',
  },
});
