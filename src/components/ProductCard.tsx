import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from '@/utils';
import type { Product } from '@/types/shop';
import { useTranslation } from '@/hooks/useTranslation';

export const PRODUCT_CARD_HEIGHT = 150;

interface Props {
  product: Product;
  onPress: (productId: string) => void;
  onAdd: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  quantityInCart: number;
  wishlistEnabled: boolean;
}

const THUMB_HUES = [86, 140, 168, 42, 12, 200, 265, 320];

export const ProductCard = memo(function ProductCard({
  product,
  onPress,
  onAdd,
  onToggleWishlist,
  isWishlisted,
  quantityInCart,
  wishlistEnabled,
}: Props) {
  const { t } = useTranslation();
  const discount =
    product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const hue = THUMB_HUES[product.imageSeed % THUMB_HUES.length]!;
  return (
    <Pressable
      testID={`product-card-${product.id}`}
      onPress={() => onPress(product.id)}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatCurrency(product.price)}${
        product.inStock ? '' : ', out of stock'
      }`}
      accessibilityHint="Opens product details"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: `hsl(${hue}, 45%, 90%)`,
            },
          ]}
        />

        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {`${product.brand} · ${product.category}`}
          </Text>

          <View style={styles.inline}>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            {discount > 0 ? (
              <>
                <Text style={styles.mrp}>{formatCurrency(product.mrp)}</Text>
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

          <View style={styles.footerRow}>
            <View accessible accessibilityLabel={`Rated ${product.rating} out of 5`} style={styles.rating}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.ratingValue}>{product.rating.toFixed(1)}</Text>
            </View>

            <View style={styles.actions}>
              {wishlistEnabled ? (
                <Pressable
                  testID={`wishlist-${product.id}`}
                  onPress={() => onToggleWishlist(product)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: isWishlisted,
                  }}
                  accessibilityLabel={
                    isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`
                  }
                  style={styles.heart}
                >
                  <Text style={[styles.heartIcon, isWishlisted && styles.heartOn]}>
                    {isWishlisted ? '♥' : '♡'}
                  </Text>
                </Pressable>
              ) : null}

              {product.inStock ? (
                <Pressable
                  testID={`add-to-cart-${product.id}`}
                  onPress={() => onAdd(product)}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${product.name} to cart`}
                  style={[styles.addButton, quantityInCart > 0 ? styles.addSecondary : styles.addPrimary]}
                >
                  <Text style={[styles.addLabel, quantityInCart > 0 && styles.addLabelSecondary]}>
                    {quantityInCart > 0
                      ? t('shop.inCart', {
                          count: quantityInCart,
                        })
                      : t('shop.add')}
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.badgeDanger}>
                  <Text style={styles.badgeTextDanger}>OUT OF STOCK</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
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
  pressed: {
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    lineHeight: 22,
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
  price: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    color: '#14170F',
  },
  mrp: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
    textDecorationLine: 'line-through',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heart: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    color: '#5D665A',
  },
  heartOn: {
    color: '#8C2F1F',
  },
  addButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPrimary: {
    backgroundColor: '#23684A',
    borderColor: '#23684A',
  },
  addSecondary: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D4D8D1',
  },
  addLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addLabelSecondary: {
    color: '#14170F',
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
  badgeDanger: {
    backgroundColor: '#FBE3DE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeTextDanger: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#8C2F1F',
  },
});
