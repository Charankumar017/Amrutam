import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CartLineRow } from '@/components/CartLineRow';
import { CheckoutSummaryCard } from '@/components/CheckoutSummaryCard';
import { EmptyState } from '@/components/EmptyState';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useCartSummary } from '@/hooks/useCart';
import { useStableCallback } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { itemRemoved, quantitySet, selectCartLines } from '@/redux/slices/cartSlice';
import type { RootScreenProps } from '@/navigation/types';
import { useTranslation } from '@/hooks/useTranslation';

export function CartScreen({ navigation }: RootScreenProps<'Cart'>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const lines = useAppSelector(selectCartLines);
  const summary = useCartSummary();
  const onChangeQuantity = useStableCallback((productId: string, quantity: number) =>
    dispatch(
      quantitySet({
        productId,
        quantity,
      }),
    ),
  );
  const onRemove = useStableCallback((productId: string) => dispatch(itemRemoved(productId)));
  const goToCheckout = useCallback(() => navigation.navigate('Checkout'), [navigation]);
  if (lines.length === 0) {
    return (
      <ScreenContainer testID="cart-screen">
        <OfflineBanner />
        <ScreenHeader title={t('shop.cart')} />
        <EmptyState
          testID="cart-empty"
          glyph="🛒"
          title={t('shop.cartEmpty.title')}
          description={t('shop.cartEmpty.body')}
          actionLabel={t('shop.title')}
          onAction={() =>
            navigation.navigate('Tabs', {
              screen: 'Shop',
            })
          }
        />
      </ScreenContainer>
    );
  }
  return (
    <ScreenContainer testID="cart-screen">
      <OfflineBanner />
      <ScreenHeader title={t('shop.cart')} subtitle={`${summary.itemCount} item(s)`} />

      {}
      <ScrollView contentContainerStyle={styles.scroll}>
        {lines.map(line => (
          <CartLineRow
            key={line.productId}
            line={line}
            onChangeQuantity={onChangeQuantity}
            onRemove={onRemove}
          />
        ))}
        <CheckoutSummaryCard summary={summary} />
      </ScrollView>

      <View style={styles.bar}>
        <Pressable
          testID="go-to-checkout"
          onPress={goToCheckout}
          accessibilityRole="button"
          style={styles.primary}
        >
          <Text style={styles.primaryLabel}>{t('shop.checkout')}</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 12,
    paddingBottom: 140,
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
});
