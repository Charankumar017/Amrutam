import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNow } from '@/hooks';
import { formatTime } from '@/utils';
import { groupSlotsByPeriod, isSlotExpired } from '@/utils/booking';
import type { Slot } from '@/types/consultations';
import { useTranslation } from '@/hooks/useTranslation';

type Period = ReturnType<typeof groupSlotsByPeriod>[number]['period'];

const PERIOD_LABEL: Record<Period, string> = {
  morning: 'MORNING',
  afternoon: 'AFTERNOON',
  evening: 'EVENING',
};

export const SlotPicker = memo(function SlotPicker({
  groups,
  selectedSlotId,
  onSelect,
}: {
  groups: readonly {
    period: Period;
    slots: readonly Slot[];
  }[];
  selectedSlotId: string | null;
  onSelect: (slot: Slot) => void;
}) {
  const now = useNow(30_000);
  return (
    <View style={styles.stack}>
      {groups.map(group => (
        <View key={group.period} style={styles.group}>
          <Text style={styles.heading} accessibilityRole="header">
            {PERIOD_LABEL[group.period]}
          </Text>
          <View style={styles.slots}>
            {group.slots.map(slot => (
              <SlotChip
                key={slot.id}
                slot={slot}
                expired={isSlotExpired(slot, now)}
                selected={slot.id === selectedSlotId}
                onSelect={onSelect}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
});

const SlotChip = memo(function SlotChip({
  slot,
  expired,
  selected,
  onSelect,
}: {
  slot: Slot;
  expired: boolean;
  selected: boolean;
  onSelect: (slot: Slot) => void;
}) {
  const { t } = useTranslation();
  const disabled = slot.isBooked || expired;
  const reason = slot.isBooked ? 'already booked' : expired ? 'no longer available' : '';
  return (
    <Pressable
      testID={`slot-${slot.id}`}
      onPress={() => onSelect(slot)}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{
        selected,
        disabled,
      }}
      accessibilityLabel={`${formatTime(slot.startsAt)}, ${slot.mode === 'online' ? 'online' : 'in person'}${
        reason ? `, ${reason}` : ''
      }`}
      style={[styles.chip, selected && styles.chipSelected, disabled && styles.chipDisabled]}
    >
      <Text style={[styles.time, selected && styles.timeSelected]}>{formatTime(slot.startsAt)}</Text>
      <Text style={styles.mode}>{slot.mode === 'online' ? t('doctors.online') : t('doctors.inPerson')}</Text>
      {disabled ? <View accessibilityElementsHidden style={styles.strike} /> : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  stack: {
    gap: 16,
  },
  group: {
    gap: 8,
  },
  heading: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#5D665A',
  },
  slots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minWidth: 96,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D4D8D1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: '#23684A',
    backgroundColor: '#EEF8F2',
  },
  chipDisabled: {
    opacity: 0.4,
  },
  time: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#14170F',
  },
  timeSelected: {
    color: '#23684A',
  },
  mode: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
  },
  strike: {
    position: 'absolute',
    height: 1,
    width: '80%',
    backgroundColor: '#5D665A',
  },
});
