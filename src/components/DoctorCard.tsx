import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { formatCurrency } from '@/utils';
import type { Doctor } from '@/types/consultations';

interface Props {
  doctor: Doctor;
  onPress: (doctorId: string) => void;
}

const AVATAR_HUES = [86, 140, 168, 42, 12, 200, 265, 320];

function initialsOf(name: string): string {
  return name
    .replace(/^Dr\.?\s*/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0] ?? '')
    .join('')
    .toUpperCase();
}

export const DoctorCard = memo(function DoctorCard({ doctor, onPress }: Props) {
  const { t } = useTranslation();
  const hue = AVATAR_HUES[doctor.avatarSeed % AVATAR_HUES.length]!;
  return (
    <Pressable
      testID={`doctor-card-${doctor.id}`}
      onPress={() => onPress(doctor.id)}
      accessibilityRole="button"
      accessibilityLabel={`${doctor.name}, ${doctor.specialization}, ${doctor.city}`}
      accessibilityHint="Opens the practitioner's profile and available slots"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: `hsl(${hue}, 45%, 90%)`,
            },
          ]}
        >
          <Text style={styles.initials}>{initialsOf(doctor.name)}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={1}>
            {doctor.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {`${doctor.specialization} · ${doctor.experienceYears} yrs · ${doctor.city}`}
          </Text>

          <View style={styles.inline}>
            <View accessible accessibilityLabel={`Rated ${doctor.rating} out of 5`} style={styles.rating}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.ratingValue}>{doctor.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>{`(${formatCount(doctor.reviewCount)})`}</Text>
            </View>
            <Text style={styles.fee}>{formatCurrency(doctor.consultationFee)}</Text>
          </View>

          <View style={styles.inline}>
            {doctor.modes.map(mode => (
              <View
                key={mode}
                style={[styles.badge, mode === 'online' ? styles.badgeInfo : styles.badgeNeutral]}
              >
                <Text style={[styles.badgeText, mode === 'online' && styles.badgeTextInfo]}>
                  {mode === 'online' ? t('doctors.onlineBadge') : t('doctors.inPersonBadge')}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  );
});

function formatCount(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
}

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
  pressed: {
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: '#14170F',
  },
  body: {
    flex: 1,
    gap: 4,
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
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
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
  reviewCount: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
  },
  fee: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#14170F',
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeNeutral: {
    backgroundColor: '#E8EAE6',
  },
  badgeInfo: {
    backgroundColor: '#DCEBFB',
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#5D665A',
  },
  badgeTextInfo: {
    color: '#1B4F8A',
  },
});
