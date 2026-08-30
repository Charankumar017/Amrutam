import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ErrorState } from '@/components/ErrorState';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useAddToCart, useWishlistToggle } from '@/hooks/useCart';
import { useFeatureFlag } from '@/hooks/useFlags';
import { useProduct } from '@/hooks/useProducts';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { quantitySet, selectQuantityOf } from '@/redux/slices/cartSlice';
import { selectIsWishlisted } from '@/redux/slices/wishlistSlice';
import { formatCurrency } from '@/utils';
import type { RootScreenProps } from '@/navigation/types';
import { useTranslation } from '@/hooks/useTranslation';

const THUMB_HUES = [86, 140, 168, 42, 12, 200, 265, 320];

export function ProductDetailScreen({ route, navigation }: RootScreenProps<'ProductDetail'>) {
  const { t } = useTranslation();
  const { productId } = route.params;
  const dispatch = useAppDispatch();
  const wishlistEnabled = useFeatureFlag('shop_wishlist');
  const product = useProduct(productId);
  const quantityInCart = useAppSelector(selectQuantityOf(productId));
  const isWishlisted = useAppSelector(selectIsWishlisted(productId));
  const addToCart = useAddToCart();
  const toggleWishlist = useWishlistToggle();
  const onAdd = useCallback(() => {
    if (!product.data) return;
    if (quantityInCart > 0)
      dispatch(
        quantitySet({
          productId,
          quantity: quantityInCart + 1,
        }),
      );
    else addToCart(product.data);
  }, [product.data, quantityInCart, dispatch, productId, addToCart]);
  if (product.isLoading) {
    return (
      <ScreenContainer testID="product-detail-loading">
        <ActivityIndicator size="large" color="#23684A" style={styles.loader} />
      </ScreenContainer>
    );
  }
  if (product.isError || !product.data) {
    return (
      <ScreenContainer testID="product-detail-error">
        <ErrorState error={product.error} onRetry={() => void product.refetch()} />
      </ScreenContainer>
    );
  }
  const item = product.data;
  const discount = item.mrp > item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
  const hue = THUMB_HUES[item.imageSeed % THUMB_HUES.length]!;
  return (
    <ScreenContainer testID="product-detail-screen">
      <ScrollView contentContainerStyle={styles.scroll}>
        <View
          style={[
            styles.hero,
            {
              backgroundColor: `hsl(${hue}, 45%, 90%)`,
            },
          ]}
        />

        <View style={styles.stack}>
          <Text style={styles.title} accessibilityRole="header">
            {item.name}
          </Text>
          <Text style={styles.meta}>{`${item.brand} · ${item.category}`}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(item.price)}</Text>
            {discount > 0 ? (
              <>
                <Text style={styles.mrp}>{formatCurrency(item.mrp)}</Text>
                <View style={styles.badgeAccent}>
                  <Text style={styles.badgeTextAccent}>
                    {t('shop.discount', {
                      percent: discount,
                    })}
                  </Text>
                </View>
              </>
            ) : null}
          </View>

          <View style={styles.ratingRow} accessible accessibilityLabel={`Rated ${item.rating} out of 5`}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.ratingValue}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.meta}>{`(${item.reviewCount})`}</Text>
          </View>

          {!item.inStock ? (
            <View style={styles.badgeDanger}>
              <Text style={styles.badgeTextDanger}>OUT OF STOCK</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>ABOUT</Text>
          <Text style={styles.description}>{item.description}</Text>
          <View style={styles.badges}>
            {item.concerns.map(concern => (
              <View key={concern} style={styles.badgeInfo}>
                <Text style={styles.badgeTextInfo}>{concern.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bar}>
        {wishlistEnabled ? (
          <Pressable
            testID="detail-wishlist"
            onPress={() => toggleWishlist(item)}
            accessibilityRole="button"
            accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            style={[styles.button, styles.secondary]}
          >
            <Text style={styles.secondaryLabel}>{isWishlisted ? '♥ Saved' : '♡ Save'}</Text>
          </Pressable>
        ) : null}
        <Pressable
          testID="detail-add-to-cart"
          onPress={quantityInCart > 0 ? () => navigation.navigate('Cart') : onAdd}
          disabled={!item.inStock}
          accessibilityRole="button"
          accessibilityState={{
            disabled: !item.inStock,
          }}
          style={[styles.button, styles.primary, styles.grow, !item.inStock && styles.disabled]}
        >
          <Text style={styles.primaryLabel}>
            {quantityInCart > 0
              ? t('shop.cartWithCount', {
                  count: quantityInCart,
                })
              : t('shop.addToCart')}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 32 },
  scroll: {
    padding: 16,
    gap: 16,
    paddingBottom: 120,
  },
  hero: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  stack: {
    gap: 8,
  },
  title: {
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  price: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: '#14170F',
  },
  mrp: {
    fontSize: 15,
    lineHeight: 22,
    color: '#5D665A',
    textDecorationLine: 'line-through',
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
  heading: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#5D665A',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#14170F',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  badgeAccent: {
    backgroundColor: '#FDF0D2',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeTextAccent: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#8A5A00',
  },
  badgeInfo: {
    backgroundColor: '#DCEBFB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeTextInfo: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#1B4F8A',
  },
  badgeDanger: {
    backgroundColor: '#FBE3DE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeTextDanger: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#8C2F1F',
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EAE6',
  },
  button: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
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
    backgroundColor: '#FFFFFF',
    borderColor: '#D4D8D1',
  },
  secondaryLabel: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: '#14170F',
  },
  disabled: {
    opacity: 0.5,
  },
});
