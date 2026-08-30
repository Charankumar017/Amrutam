import { FlashList } from '@shopify/flash-list';
import React, { useCallback } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { OfflineBanner } from '@/components/OfflineBanner';
import { PRODUCT_CARD_HEIGHT, ProductCard } from '@/components/ProductCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAddToCart, useWishlistToggle } from '@/hooks/useCart';
import { useStableCallback } from '@/hooks';
import { useAppSelector } from '@/redux/hooks';
import { selectCartLines } from '@/redux/slices/cartSlice';
import { selectWishlistItems } from '@/redux/slices/wishlistSlice';
import type { RootScreenProps } from '@/navigation/types';
import type { Product } from '@/types/shop';
import { useTranslation } from '@/hooks/useTranslation';

export function WishlistScreen({ navigation }: RootScreenProps<'Wishlist'>) {
  const { t } = useTranslation();
  const items = useAppSelector(selectWishlistItems);
  const cartLines = useAppSelector(selectCartLines);
  const addToCart = useAddToCart();
  const toggleWishlist = useWishlistToggle();
  const openProduct = useStableCallback((productId: string) =>
    navigation.navigate('ProductDetail', {
      productId,
    }),
  );
  const onAdd = useStableCallback((product: Product) => addToCart(product));
  const onToggle = useStableCallback((product: Product) => toggleWishlist(product));
  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        product={item}
        onPress={openProduct}
        onAdd={onAdd}
        onToggleWishlist={onToggle}
        isWishlisted
        wishlistEnabled
        quantityInCart={cartLines.find(line => line.productId === item.id)?.quantity ?? 0}
      />
    ),
    [openProduct, onAdd, onToggle, cartLines],
  );
  return (
    <ScreenContainer testID="wishlist-screen">
      <OfflineBanner />
      <ScreenHeader title={t('shop.wishlist')} subtitle={`${items.length} saved`} />
      {items.length === 0 ? (
        <EmptyState
          testID="wishlist-empty"
          glyph="♡"
          title={t('shop.wishlistEmpty.title')}
          description={t('shop.wishlistEmpty.body')}
          actionLabel={t('shop.title')}
          onAction={() =>
            navigation.navigate('Tabs', {
              screen: 'Shop',
            })
          }
        />
      ) : (
        <FlashList
          testID="wishlist-list"
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          drawDistance={PRODUCT_CARD_HEIGHT}
        />
      )}
    </ScreenContainer>
  );
}
