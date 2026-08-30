import React, { useCallback } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeatureFlag } from '@/hooks/useFlags';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import type { Facets } from '@/types';
import { RECORD_TYPE_LABEL } from '@/utils/timeline';
import {
  recordFilterActions,
  selectRecordFilters,
  selectRecordGrouping,
} from '@/redux/slices/recordFiltersSlice';
import { HEALTH_RECORD_TYPES } from '@/types/healthRecords';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/utils/i18n';

const RANGES: readonly {
  labelKey: TranslationKey;
  days: number | null;
}[] = [
  {
    labelKey: 'records.allTime',
    days: null,
  },
  {
    labelKey: 'records.last3Months',
    days: 90,
  },
  {
    labelKey: 'records.lastYear',
    days: 365,
  },
  {
    labelKey: 'records.last3Years',
    days: 1095,
  },
];

const MAX_TAGS = 10;

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export function RecordFilterSheet({
  visible,
  onDismiss,
  facets,
}: {
  visible: boolean;
  onDismiss: () => void;
  facets: Facets | undefined;
}) {
  const { t } = useTranslation();
  const yearGroupingEnabled = useFeatureFlag('records_year_grouping');
  const insets = useSafeAreaInsets();
  const filters = useAppSelector(selectRecordFilters);
  const grouping = useAppSelector(selectRecordGrouping);
  const dispatch = useAppDispatch();
  const reset = useCallback(() => dispatch(recordFilterActions.filtersReset()), [dispatch]);
  const activeRange = RANGES.find(range =>
    range.days === null ? filters.from === null : filters.from === isoDaysAgo(range.days),
  );
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      testID="record-filter-sheet"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        onPress={onDismiss}
        style={styles.scrim}
      />
      <View
        accessibilityViewIsModal
        style={[
          styles.sheet,
          {
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle} accessibilityRole="header">
            {t('common.filters')}
          </Text>
          <Pressable
            onPress={onDismiss}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close Filters"
          >
            <Text style={styles.close}>×</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Section title="RECORD TYPE">
            {HEALTH_RECORD_TYPES.map(type => (
              <Chip
                key={type}
                testID={`record-type-${type}`}
                label={RECORD_TYPE_LABEL[type]}
                selected={filters.types.includes(type)}
                onPress={() => dispatch(recordFilterActions.typeToggled(type))}
              />
            ))}
          </Section>

          <Section title="TAGS">
            {(facets?.tag ?? []).slice(0, MAX_TAGS).map(facet => (
              <Chip
                key={facet.value}
                label={`${facet.value} (${facet.count})`}
                selected={filters.tags.includes(facet.value)}
                onPress={() => dispatch(recordFilterActions.tagToggled(facet.value))}
              />
            ))}
          </Section>

          <Section title="DATE RANGE">
            {RANGES.map(range => (
              <Chip
                key={range.labelKey}
                label={t(range.labelKey)}
                selected={activeRange?.labelKey === range.labelKey}
                onPress={() =>
                  dispatch(
                    recordFilterActions.rangeSet({
                      from: range.days === null ? null : isoDaysAgo(range.days),
                      to: null,
                    }),
                  )
                }
              />
            ))}
          </Section>

          <Section title="GROUP BY">
            <Chip
              label={t('records.month')}
              selected={grouping === 'month'}
              onPress={() => dispatch(recordFilterActions.groupingChanged('month'))}
            />
            {yearGroupingEnabled ? (
              <Chip
                label={t('records.year')}
                selected={grouping === 'year'}
                onPress={() => dispatch(recordFilterActions.groupingChanged('year'))}
              />
            ) : null}
          </Section>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={reset} accessibilityRole="button" style={[styles.button, styles.secondary]}>
            <Text style={styles.secondaryLabel}>{t('common.reset')}</Text>
          </Pressable>
          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            testID="apply-record-filters"
            style={[styles.button, styles.primary, styles.grow]}
          >
            <Text style={styles.primaryLabel}>{t('common.apply')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
  testID,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{
        checked: selected,
      }}
      accessibilityLabel={label}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(11, 13, 8, 0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAE6',
  },
  headerTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    color: '#14170F',
  },
  close: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    color: '#5D665A',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#5D665A',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D4D8D1',
    backgroundColor: '#FFFFFF',
    minHeight: 34,
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: '#23684A',
    backgroundColor: '#EEF8F2',
  },
  chipLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#5D665A',
  },
  chipLabelSelected: {
    color: '#23684A',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8EAE6',
  },
  button: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  grow: {
    flex: 2,
  },
  primary: {
    backgroundColor: '#23684A',
    borderColor: '#23684A',
  },
  primaryLabel: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondary: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#D4D8D1',
  },
  secondaryLabel: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: '#14170F',
  },
});
