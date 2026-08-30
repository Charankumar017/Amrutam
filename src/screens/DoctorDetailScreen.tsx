import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SlotPicker } from '@/components/SlotPicker';
import { useBookConsultation } from '@/hooks/useBookings';
import { useDoctor } from '@/hooks/useDoctors';
import { useSlots } from '@/hooks/useSlots';
import { formatCurrency, toDateKey } from '@/utils';
import type { RootScreenProps } from '@/navigation/types';
import type { Slot } from '@/types/consultations';
import { useTranslation } from '@/hooks/useTranslation';

const DAYS_AHEAD = 7;

const AVATAR_HUES = [86, 140, 168, 42, 12, 200, 265, 320];

export function DoctorDetailScreen({ route, navigation }: RootScreenProps<'DoctorDetail'>) {
  const { t } = useTranslation();
  const { doctorId } = route.params;
  const dates = useMemo(() => {
    const today = new Date();
    return Array.from(
      {
        length: DAYS_AHEAD,
      },
      (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return date;
      },
    );
  }, []);
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(dates[0] as Date));
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const doctor = useDoctor(doctorId);
  const slots = useSlots(doctorId, selectedDate);
  const { book, isBooking } = useBookConsultation();
  const onSelectSlot = useCallback((slot: Slot) => setSelectedSlot(slot), []);
  const onBook = useCallback(async () => {
    if (!doctor.data || !selectedSlot) return;
    const outcome = await book(doctor.data, selectedSlot);
    setSelectedSlot(null);
    if (outcome.kind === 'confirmed' || outcome.kind === 'queued') navigation.navigate('Bookings');
    else void slots.refetch();
  }, [doctor.data, selectedSlot, book, navigation, slots]);
  if (doctor.isLoading) {
    return (
      <ScreenContainer testID="doctor-detail-loading">
        <ActivityIndicator size="large" color="#23684A" style={styles.loader} />
      </ScreenContainer>
    );
  }
  if (doctor.isError || !doctor.data) {
    return (
      <ScreenContainer testID="doctor-detail-error">
        <ErrorState error={doctor.error} onRetry={() => void doctor.refetch()} />
      </ScreenContainer>
    );
  }
  const profile = doctor.data;
  const hue = AVATAR_HUES[profile.avatarSeed % AVATAR_HUES.length]!;
  return (
    <ScreenContainer testID="doctor-detail-screen">
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: `hsl(${hue}, 45%, 90%)`,
              },
            ]}
          />
          <View style={styles.grow}>
            <Text style={styles.name} accessibilityRole="header">
              {profile.name}
            </Text>
            <Text style={styles.meta}>{`${profile.specialization} · ${profile.city}`}</Text>
            <View style={styles.ratingRow} accessible accessibilityLabel={`Rated ${profile.rating} out of 5`}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.ratingValue}>{profile.rating.toFixed(1)}</Text>
              <Text style={styles.meta}>{`(${profile.reviewCount})`}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.stats}>
            <Stat label={t('doctors.experience')} value={`${profile.experienceYears} yrs`} />
            <Stat label={t('doctors.fee')} value={formatCurrency(profile.consultationFee)} />
            <Stat label={t('doctors.rating')} value={profile.rating.toFixed(1)} />
          </View>
          <View style={styles.divider} />
          <Text style={styles.bio}>{profile.bio}</Text>
          <View style={styles.badges}>
            {profile.qualifications.map(q => (
              <View key={q} style={styles.badge}>
                <Text style={styles.badgeText}>{q.toUpperCase()}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.meta}>{`Speaks ${profile.languages.join(', ')}`}</Text>
        </View>

        <View style={styles.stack}>
          <Text style={styles.heading} accessibilityRole="header">
            {t('doctors.slots')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dates}>
            {dates.map(date => {
              const key = toDateKey(date);
              const selected = key === selectedDate;
              return (
                <Pressable
                  key={key}
                  testID={`date-${key}`}
                  onPress={() => {
                    setSelectedDate(key);
                    setSelectedSlot(null);
                  }}
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked: selected,
                  }}
                  style={[styles.dateChip, selected && styles.dateChipSelected]}
                >
                  <Text style={[styles.dateLabel, selected && styles.dateLabelSelected]}>
                    {date.toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {slots.isLoading ? (
          <ActivityIndicator size="large" color="#23684A" style={styles.loader} />
        ) : slots.isError ? (
          <ErrorState compact error={slots.error} onRetry={() => void slots.refetch()} testID="slots-error" />
        ) : slots.bookableCount === 0 ? (
          <EmptyState glyph="🕰" title={t('doctors.noSlots')} description={t('doctors.noSlotsBody')} />
        ) : (
          <SlotPicker
            groups={slots.groups}
            selectedSlotId={selectedSlot?.id ?? null}
            onSelect={onSelectSlot}
          />
        )}
      </ScrollView>

      <View style={styles.bar}>
        <Pressable
          testID="confirm-booking"
          onPress={onBook}
          disabled={!selectedSlot || isBooking}
          accessibilityRole="button"
          accessibilityState={{
            disabled: !selectedSlot || isBooking,
            busy: isBooking,
          }}
          accessibilityHint={selectedSlot ? undefined : t('doctors.selectSlotFirst')}
          style={[styles.primary, (!selectedSlot || isBooking) && styles.disabled]}
        >
          <Text style={styles.primaryLabel}>
            {selectedSlot
              ? t('doctors.bookWithFee', {
                  fee: formatCurrency(profile.consultationFee),
                })
              : t('doctors.book')}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.meta}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 32 },
  scroll: {
    padding: 16,
    gap: 16,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  grow: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: '#14170F',
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  star: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#8A5A00',
  },
  ratingValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#14170F',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EAE6',
    padding: 16,
    gap: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    color: '#14170F',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8EAE6',
  },
  bio: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  badge: {
    backgroundColor: '#E8EAE6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#5D665A',
  },
  stack: {
    gap: 8,
  },
  heading: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    color: '#14170F',
  },
  dates: {
    gap: 8,
  },
  dateChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D4D8D1',
    backgroundColor: '#FFFFFF',
    minHeight: 34,
    justifyContent: 'center',
  },
  dateChipSelected: {
    borderColor: '#23684A',
    backgroundColor: '#EEF8F2',
  },
  dateLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#5D665A',
  },
  dateLabelSelected: {
    color: '#23684A',
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EAE6',
  },
  primary: {
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: '#23684A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.5,
  },
});
