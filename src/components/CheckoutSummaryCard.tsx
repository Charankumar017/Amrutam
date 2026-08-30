import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from '@/utils';
import { DEFAULT_CART_RULES } from '@/utils/cart';
import type { CheckoutSummary } from '@/types/shop';
import { useTranslation } from '@/hooks/useTranslation';

export const CheckoutSummaryCard = memo(function CheckoutSummaryCard({
  summary,
}: {
  summary: CheckoutSummary;
}) {
  const { t } = useTranslation();
  return (
    <View testID="checkout-summary" style={styles.card}>
      <Line
        label={t('shop.subtotal', {
          count: summary.itemCount,
        })}
        value={formatCurrency(summary.subtotal)}
      />
      {summary.savings > 0 ? (
        <Line label={t('shop.savings')} value={`− ${formatCurrency(summary.savings)}`} success />
      ) : null}
      <Line
        label={t('shop.shipping')}
        value={summary.shipping === 0 ? t('shop.free') : formatCurrency(summary.shipping)}
        success={summary.shipping === 0}
      />
      <Line label={t('shop.tax')} value={formatCurrency(summary.tax)} />

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.total}>{t('shop.total')}</Text>
        <Text style={styles.total} testID="checkout-total">
          {formatCurrency(summary.total)}
        </Text>
      </View>

      {summary.shipping > 0 ? (
        <Text style={styles.hint}>{`Free shipping over ₹${DEFAULT_CART_RULES.freeShippingThreshold}`}</Text>
      ) : null}
    </View>
  );
});

function Line({ label, value, success }: { label: string; value: string; success?: boolean }) {
  return (
    <View style={styles.line}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, success && styles.success]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EAE6',
    padding: 16,
    margin: 16,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
  },
  value: {
    fontSize: 13,
    lineHeight: 18,
    color: '#14170F',
  },
  success: {
    color: '#23684A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8EAE6',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  total: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    color: '#14170F',
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
    marginTop: 8,
  },
});
