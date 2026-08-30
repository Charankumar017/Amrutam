import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckoutSummaryCard } from '@/components/CheckoutSummaryCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useToast } from '@/components/ToastProvider';
import { useCartSummary } from '@/hooks/useCart';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { cartCleared, selectCartLines } from '@/redux/slices/cartSlice';
import { formatCurrency } from '@/utils';
import type { RootScreenProps } from '@/navigation/types';
import { useTranslation } from '@/hooks/useTranslation';

export function CheckoutScreen({ navigation }: RootScreenProps<'Checkout'>) {
  const { t } = useTranslation();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const lines = useAppSelector(selectCartLines);
  const summary = useCartSummary();
  const [placing, setPlacing] = useState(false);
  const placeOrder = useCallback(() => {
    setPlacing(true);
    setTimeout(() => {
      setPlacing(false);
      dispatch(cartCleared());
      toast.show({
        message: t('shop.orderPlaced'),
        tone: 'success',
      });
      navigation.navigate('Tabs', {
        screen: 'Shop',
      });
    }, 600);
  }, [dispatch, toast, navigation, t]);
  return (
    <ScreenContainer testID="checkout-screen">
      <ScreenHeader title={t('shop.checkout')} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.heading}>ORDER</Text>
          <View style={styles.lines}>
            {lines.map(line => (
              <View key={line.productId} style={styles.line}>
                <Text style={styles.lineName} numberOfLines={1}>
                  {`${line.quantity} × ${line.name}`}
                </Text>
                <Text style={styles.lineValue}>{formatCurrency(line.unitPrice * line.quantity)}</Text>
              </View>
            ))}
          </View>
        </View>

        <CheckoutSummaryCard summary={summary} />

        <Pressable
          testID="place-order"
          onPress={placeOrder}
          disabled={placing || lines.length === 0}
          accessibilityRole="button"
          accessibilityState={{
            disabled: placing || lines.length === 0,
            busy: placing,
          }}
          style={[styles.primary, (placing || lines.length === 0) && styles.disabled]}
        >
          {placing ? <ActivityIndicator color="#FFFFFF" style={styles.spinner} /> : null}
          <Text style={styles.primaryLabel}>{`Place order · ${formatCurrency(summary.total)}`}</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 32,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EAE6',
    padding: 16,
  },
  heading: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#5D665A',
  },
  lines: {
    marginTop: 8,
    gap: 8,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  lineName: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
  },
  lineValue: {
    fontSize: 13,
    lineHeight: 18,
    color: '#14170F',
  },
  primary: {
    flexDirection: 'row',
    marginHorizontal: 16,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: '#23684A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  spinner: {
    marginRight: 8,
  },
  primaryLabel: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
