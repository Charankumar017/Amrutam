import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatCurrency, formatRelativeDay, formatTime } from '@/utils';
import type { Booking } from '@/types/consultations';
import { useTranslation } from '@/hooks/useTranslation';

const STATUS_LABEL: Record<Booking['status'], string> = {
  pending_sync: 'AWAITING SYNC',
  cancelled: 'CANCELLED',
  failed: 'FAILED',
  confirmed: 'CONFIRMED',
};

export const BookingCard = memo(function BookingCard({
  booking,
  onCancel,
  cancellable,
}: {
  booking: Booking;
  onCancel: (booking: Booking) => void;
  cancellable: boolean;
}) {
  const { t } = useTranslation();
  const badgeStyle =
    booking.status === 'pending_sync'
      ? styles.badgeAccent
      : booking.status === 'confirmed'
      ? styles.badgeSuccess
      : styles.badgeDanger;
  const badgeTextStyle =
    booking.status === 'pending_sync'
      ? styles.badgeTextAccent
      : booking.status === 'confirmed'
      ? styles.badgeTextSuccess
      : styles.badgeTextDanger;
  return (
    <View testID={`booking-card-${booking.id}`} style={styles.card}>
      <View style={styles.stack}>
        <View style={styles.headerRow}>
          <View style={styles.titles}>
            <Text style={styles.name} numberOfLines={1}>
              {booking.doctorName}
            </Text>
            <Text style={styles.meta}>{booking.specialization}</Text>
          </View>
          <View testID={`booking-status-${booking.id}`} style={[styles.badge, badgeStyle]}>
            <Text style={[styles.badgeText, badgeTextStyle]}>{STATUS_LABEL[booking.status]}</Text>
          </View>
        </View>

        <View style={styles.inline}>
          <Text style={styles.day}>{formatRelativeDay(booking.startsAt)}</Text>
          <Text style={styles.time}>{`${formatTime(booking.startsAt)} - ${formatTime(booking.endsAt)}`}</Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.meta}>
            {`${booking.mode === 'online' ? 'Online consultation' : 'In-person visit'} · ${formatCurrency(
              booking.fee,
            )}`}
          </Text>
          {cancellable ? (
            <Pressable
              onPress={() => onCancel(booking)}
              testID={`cancel-booking-${booking.id}`}
              accessibilityRole="button"
              accessibilityLabel={`Cancel consultation with ${booking.doctorName}`}
              hitSlop={8}
              style={styles.cancel}
            >
              <Text style={styles.cancelLabel}>{t('bookings.cancelShort')}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EAE6',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  stack: {
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  titles: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    color: '#14170F',
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  day: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: '#14170F',
  },
  time: {
    fontSize: 15,
    lineHeight: 22,
    color: '#5D665A',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeAccent: {
    backgroundColor: '#FDF0D2',
  },
  badgeSuccess: {
    backgroundColor: '#EEF8F2',
  },
  badgeDanger: {
    backgroundColor: '#FBE3DE',
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  badgeTextAccent: {
    color: '#8A5A00',
  },
  badgeTextSuccess: {
    color: '#23684A',
  },
  badgeTextDanger: {
    color: '#8C2F1F',
  },
  cancel: {
    minHeight: 36,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  cancelLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#23684A',
  },
});
