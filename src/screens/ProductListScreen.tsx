import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { ListFooter } from '@/components/ListFooter';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ProductCard } from '@/components/ProductCard';
import { ProductFilterSheet } from '@/components/ProductFilterSheet';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchField } from '@/components/SearchField';
import { useAddToCart, useCartCount, useWishlistToggle } from '@/hooks/useCart';
import { useFeatureFlag } from '@/hooks/useFlags';
import { useProductFacets, useProductList } from '@/hooks/useProducts';
import { useStableCallback } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectCartLines } from '@/redux/slices/cartSlice';
import {
  countActiveProductFilters,
  productFilterActions,
  selectProductFilters,
  selectProductQuery,
} from '@/redux/slices/productFiltersSlice';
import { selectWishlistMap } from '@/redux/slices/wishlistSlice';
import type { Product } from '@/types/shop';
import { useTranslation } from '@/hooks/useTranslation';

const keyExtractor = (product: Product) => product.id;

export function ProductListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const dispatch = useAppDispatch();
  const query = useAppSelector(selectProductQuery);
  const filters = useAppSelector(selectProductFilters);
  const setQuery = useCallback(
    (next: string) => dispatch(productFilterActions.queryChanged(next)),
    [dispatch],
  );
  const wishlistEnabled = useFeatureFlag('shop_wishlist');
  const facets = useProductFacets();
  const list = useProductList(filters);
  const cartCount = useCartCount();
  const activeFilters = countActiveProductFilters(filters);
  const wishlistItems = useAppSelector(selectWishlistMap);
  const cartLines = useAppSelector(selectCartLines);
  const addToCart = useAddToCart();
  const toggleWishlist = useWishlistToggle();
  const openProduct = useStableCallback((productId: string) =>
    navigation.navigate('ProductDetail', {
      productId,
    }),
  );
  const onAdd = useStableCallback((product: Product) => addToCart(product));
  const onToggleWishlist = useStableCallback((product: Product) => toggleWishlist(product));
  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        product={item}
        onPress={openProduct}
        onAdd={onAdd}
        onToggleWishlist={onToggleWishlist}
        isWishlisted={Boolean(wishlistItems[item.id])}
        quantityInCart={cartLines.find(line => line.productId === item.id)?.quantity ?? 0}
        wishlistEnabled={wishlistEnabled}
      />
    ),
    [openProduct, onAdd, onToggleWishlist, wishlistItems, cartLines, wishlistEnabled],
  );
  const loadMore = useCallback(() => {
    if (list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
  }, [list]);
  const body = () => {
    if (list.isLoading) return <ActivityIndicator size="large" color="#23684A" style={styles.loader} />;
    if (list.isError && list.products.length === 0) {
      return (
        <ErrorState error={list.error} onRetry={() => void list.refetch()} testID="product-list-error" />
      );
    }
    if (list.products.length === 0) {
      return (
        <EmptyState
          testID="product-list-empty"
          glyph="🧴"
          title={t('shop.empty.title')}
          description={t('shop.empty.body')}
          actionLabel={activeFilters > 0 ? t('common.reset') : undefined}
          onAction={activeFilters > 0 ? () => dispatch(productFilterActions.filtersReset()) : undefined}
        />
      );
    }
    return (
      <FlashList
        testID="product-list"
        data={list.products}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        drawDistance={250}
        keyboardShouldPersistTaps="handled"
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        ListFooterComponent={
          <ListFooter
            isFetchingNextPage={list.isFetchingNextPage}
            hasNextPage={Boolean(list.hasNextPage)}
            count={list.products.length}
            total={list.total}
          />
        }
      />
    );
  };
  return (
    <ScreenContainer testID="product-list-screen" edges={['top']}>
      <OfflineBanner />
      <ScreenHeader
        title={t('shop.title')}
        subtitle={
          list.total > 0
            ? t('common.results', {
                count: list.total.toLocaleString(),
              })
            : undefined
        }
        actions={[
          ...(wishlistEnabled
            ? [
                {
                  label: '♡',
                  accessibilityLabel: t('shop.wishlist'),
                  onPress: () => navigation.navigate('Wishlist'),
                  testID: 'open-wishlist',
                },
              ]
            : []),
          {
            label: t('shop.cart'),
            accessibilityLabel: `${t('shop.cart')} (${cartCount})`,
            onPress: () => navigation.navigate('Cart'),
            badge: cartCount,
            testID: 'open-cart',
          },
        ]}
      />

      <View style={styles.controls}>
        <SearchField
          testID="product-search"
          value={query}
          onChangeText={setQuery}
          placeholder={t('shop.searchPlaceholder')}
          accessibilityLabel={t('shop.searchA11y')}
        />
        <View style={styles.controlRow}>
          <Text style={styles.status}>
            {list.isSettling || list.isFetching ? t('common.searching') : ' '}
          </Text>
          <Pressable
            testID="open-product-filters"
            onPress={() => setFiltersVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Filters and sort"
            hitSlop={8}
          >
            <Text style={styles.filters}>
              {activeFilters > 0 ? `${t('common.filters')} · ${activeFilters} ⌄` : `${t('common.filters')} ⌄`}
            </Text>
          </Pressable>
        </View>
      </View>

      {body()}

      <ProductFilterSheet
        visible={filtersVisible}
        onDismiss={() => setFiltersVisible(false)}
        facets={facets.data}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 32 },
  controls: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 12,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  status: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
  },
  filters: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#23684A',
  },
});
