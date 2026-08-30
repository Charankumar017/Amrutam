import React, { useCallback } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import type { Facets } from '@/types';
import { formatCurrency } from '@/utils';
import { productFilterActions, selectProductFilters } from '@/redux/slices/productFiltersSlice';
import type { ProductSort } from '@/types/shop';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/utils/i18n';

const SORTS: readonly {
  value: ProductSort;
  labelKey: TranslationKey;
}[] = [
  {
    value: 'relevance',
    labelKey: 'filters.relevance',
  },
  {
    value: 'price_asc',
    labelKey: 'filters.priceAsc',
  },
  {
    value: 'price_desc',
    labelKey: 'filters.priceDesc',
  },
  {
    value: 'rating_desc',
    labelKey: 'filters.topRated',
  },
  {
    value: 'newest',
    labelKey: 'filters.newest',
  },
];

const PRICES = [300, 600, 1200, 2400];

const RATINGS = [4.5, 4, 3.5];

const MAX_FACET_VALUES = 10;

export function ProductFilterSheet({
  visible,
  onDismiss,
  facets,
}: {
  visible: boolean;
  onDismiss: () => void;
  facets: Facets | undefined;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const filters = useAppSelector(selectProductFilters);
  const dispatch = useAppDispatch();
  const reset = useCallback(() => dispatch(productFilterActions.filtersReset()), [dispatch]);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      testID="product-filter-sheet"
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
            {t('common.filtersAndSort')}
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
          <Section title="SORT">
            {SORTS.map(option => (
              <Chip
                key={option.value}
                testID={`sort-${option.value}`}
                label={t(option.labelKey)}
                selected={filters.sort === option.value}
                onPress={() => dispatch(productFilterActions.sortChanged(option.value))}
              />
            ))}
          </Section>

          <Section title="AVAILABILITY">
            <Chip
              testID="filter-in-stock"
              label={t('shop.inStockOnly')}
              selected={filters.inStockOnly}
              onPress={() => dispatch(productFilterActions.inStockOnlySet(!filters.inStockOnly))}
            />
          </Section>

          <Section title="CATEGORY">
            {(facets?.category ?? []).slice(0, MAX_FACET_VALUES).map(facet => (
              <Chip
                key={facet.value}
                label={`${facet.value} (${facet.count})`}
                selected={filters.categories.includes(facet.value)}
                onPress={() => dispatch(productFilterActions.categoryToggled(facet.value))}
              />
            ))}
          </Section>

          <Section title="BRAND">
            {(facets?.brand ?? []).slice(0, MAX_FACET_VALUES).map(facet => (
              <Chip
                key={facet.value}
                label={`${facet.value} (${facet.count})`}
                selected={filters.brands.includes(facet.value)}
                onPress={() => dispatch(productFilterActions.brandToggled(facet.value))}
              />
            ))}
          </Section>

          <Section title="CONCERN">
            {(facets?.concern ?? []).slice(0, MAX_FACET_VALUES).map(facet => (
              <Chip
                key={facet.value}
                label={`${facet.value} (${facet.count})`}
                selected={filters.concerns.includes(facet.value)}
                onPress={() => dispatch(productFilterActions.concernToggled(facet.value))}
              />
            ))}
          </Section>

          <Section title="MAXIMUM PRICE">
            {PRICES.map(price => (
              <Chip
                key={price}
                label={t('shop.under', {
                  amount: formatCurrency(price),
                })}
                selected={filters.maxPrice === price}
                onPress={() =>
                  dispatch(productFilterActions.maxPriceSet(filters.maxPrice === price ? null : price))
                }
              />
            ))}
          </Section>

          <Section title="MINIMUM RATING">
            {RATINGS.map(rating => (
              <Chip
                key={rating}
                label={`${rating}★ & above`}
                selected={filters.minRating === rating}
                onPress={() =>
                  dispatch(productFilterActions.minRatingSet(filters.minRating === rating ? null : rating))
                }
              />
            ))}
          </Section>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={reset} accessibilityRole="button" style={[styles.button, styles.secondary]}>
            <Text style={styles.secondaryLabel}>{t('common.reset')}</Text>
          </Pressable>
          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            testID="apply-product-filters"
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
