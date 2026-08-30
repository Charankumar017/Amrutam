import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { DoctorCard } from '@/components/DoctorCard';
import { DoctorFilterSheet } from '@/components/DoctorFilterSheet';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { ListFooter } from '@/components/ListFooter';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchField } from '@/components/SearchField';
import { useDoctorFacets, useDoctorList } from '@/hooks/useDoctors';
import { useStableCallback } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  countActiveDoctorFilters,
  doctorFilterActions,
  selectDoctorFilters,
  selectDoctorQuery,
} from '@/redux/slices/doctorFiltersSlice';
import type { Doctor } from '@/types/consultations';
import { useTranslation } from '@/hooks/useTranslation';
import { LOCALE_LABELS, LOCALES } from '@/utils/i18n';

const keyExtractor = (doctor: Doctor) => doctor.id;

export function DoctorListScreen() {
  const { t, locale, setLocale } = useTranslation();
  const navigation = useNavigation();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const dispatch = useAppDispatch();
  const query = useAppSelector(selectDoctorQuery);
  const filters = useAppSelector(selectDoctorFilters);
  const setQuery = useCallback(
    (next: string) => dispatch(doctorFilterActions.queryChanged(next)),
    [dispatch],
  );
  const facets = useDoctorFacets();
  const list = useDoctorList(filters);
  const activeFilters = countActiveDoctorFilters(filters);
  const openDoctor = useStableCallback((doctorId: string) =>
    navigation.navigate('DoctorDetail', {
      doctorId,
    }),
  );
  const renderItem = useCallback(
    ({ item }: { item: Doctor }) => <DoctorCard doctor={item} onPress={openDoctor} />,
    [openDoctor],
  );
  const loadMore = useCallback(() => {
    if (list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
  }, [list]);
  const body = () => {
    if (list.isLoading) return <ActivityIndicator size="large" color="#23684A" style={styles.loader} />;
    if (list.isError && list.doctors.length === 0) {
      return <ErrorState error={list.error} onRetry={() => void list.refetch()} testID="doctor-list-error" />;
    }
    if (list.doctors.length === 0) {
      return (
        <EmptyState
          testID="doctor-list-empty"
          title={t('doctors.empty.title')}
          description={t('doctors.empty.body')}
          actionLabel={activeFilters > 0 ? t('common.reset') : undefined}
          onAction={activeFilters > 0 ? () => dispatch(doctorFilterActions.filtersReset()) : undefined}
        />
      );
    }
    return (
      <FlashList
        testID="doctor-list"
        data={list.doctors}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        drawDistance={250}
        keyboardShouldPersistTaps="handled"
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        ListFooterComponent={
          <ListFooter
            isFetchingNextPage={list.isFetchingNextPage}
            hasNextPage={Boolean(list.hasNextPage)}
            count={list.doctors.length}
            total={list.total}
          />
        }
      />
    );
  };
  return (
    <ScreenContainer testID="doctor-list-screen" edges={['top']}>
      <OfflineBanner />
      <ScreenHeader
        title={t('doctors.title')}
        subtitle={
          list.total > 0
            ? t('common.results', {
                count: list.total.toLocaleString(),
              })
            : undefined
        }
        actions={[
          {
            label: LOCALE_LABELS[locale],
            accessibilityLabel: `Language: ${LOCALE_LABELS[locale]}`,
            onPress: () => setLocale(LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length]!),
            testID: 'toggle-language',
          },
          {
            label: t('bookings.title'),
            accessibilityLabel: t('bookings.title'),
            onPress: () => navigation.navigate('Bookings'),
            testID: 'open-bookings',
          },
        ]}
      />

      <View style={styles.controls}>
        <SearchField
          testID="doctor-search"
          value={query}
          onChangeText={setQuery}
          placeholder={t('doctors.searchPlaceholder')}
          accessibilityLabel={t('doctors.searchA11y')}
        />
        <View style={styles.controlRow}>
          <Text style={styles.status}>
            {list.isSettling || list.isFetching ? t('common.searching') : ' '}
          </Text>
          <Pressable
            testID="open-doctor-filters"
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

      <DoctorFilterSheet
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
