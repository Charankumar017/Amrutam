import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { BookingCard } from '@/components/BookingCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useBookings, useCancelBooking } from '@/hooks/useBookings';
import { useNow, useStableCallback } from '@/hooks';
import { useRemoteValue } from '@/hooks/useFlags';
import { canCancel } from '@/utils/booking';
import type { Booking } from '@/types/consultations';
import { useTranslation } from '@/hooks/useTranslation';

type Tab = 'upcoming' | 'past';

export function BookingsScreen() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('upcoming');
  const cancellationWindow = useRemoteValue('bookingCancellationWindowHours');
  const { upcoming, past, isLoading, isError, error, refetch } = useBookings();
  const { cancel } = useCancelBooking();
  const data = tab === 'upcoming' ? upcoming : past;
  const now = useNow(60_000);
  const onCancel = useStableCallback((booking: Booking) => {
    Alert.alert(
      t('bookings.confirmCancel'),
      `${booking.doctorName} · ${new Date(booking.startsAt).toLocaleString()}`,
      [
        {
          text: t('common.close'),
          style: 'cancel',
        },
        {
          text: t('bookings.cancel'),
          style: 'destructive',
          onPress: () => void cancel(booking),
        },
      ],
    );
  });
  const renderItem = useCallback(
    ({ item }: { item: Booking }) => (
      <BookingCard
        booking={item}
        onCancel={onCancel}
        cancellable={canCancel(item, now, cancellationWindow)}
      />
    ),
    [onCancel, now, cancellationWindow],
  );
  return (
    <ScreenContainer testID="bookings-screen">
      <OfflineBanner />
      <ScreenHeader title={t('bookings.title')} />

      <View testID="bookings-tabs" accessibilityRole="tablist" style={styles.tabs}>
        {(['upcoming', 'past'] as const).map(value => (
          <Pressable
            key={value}
            testID={`bookings-tabs-${value}`}
            onPress={() => setTab(value)}
            accessibilityRole="tab"
            accessibilityState={{
              selected: tab === value,
            }}
            style={[styles.tab, tab === value && styles.tabSelected]}
          >
            <Text style={[styles.tabLabel, tab === value && styles.tabLabelSelected]}>
              {value === 'upcoming'
                ? t('bookings.upcoming', {
                    count: upcoming.length,
                  })
                : t('bookings.past', {
                    count: past.length,
                  })}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#23684A" style={styles.loader} />
      ) : isError && data.length === 0 ? (
        <ErrorState error={error} onRetry={() => void refetch()} testID="bookings-error" />
      ) : data.length === 0 ? (
        <EmptyState
          testID="bookings-empty"
          glyph="📅"
          title={t('bookings.empty.title')}
          description={t('bookings.empty.body')}
        />
      ) : (
        <FlashList
          testID="bookings-list"
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          drawDistance={250}
          contentContainerStyle={styles.list}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 32 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F4F5F3',
    borderRadius: 10,
    padding: 3,
    marginHorizontal: 16,
  },
  tab: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  tabSelected: {
    backgroundColor: '#FFFFFF',
  },
  tabLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#5D665A',
  },
  tabLabelSelected: {
    color: '#14170F',
  },
  list: {
    paddingTop: 12,
  },
});
