import { useCallback } from 'react';
import { useToast } from '@/components/ToastProvider';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { itemAdded, itemRemoved, selectCartCount, selectCartSummary } from '@/redux/slices/cartSlice';
import { selectIsWishlisted, wishlistToggled } from '@/redux/slices/wishlistSlice';
import { store } from '@/redux/store';
import type { Product } from '@/types/shop';

export function useCartCount(): number {
  return useAppSelector(selectCartCount);
}

export function useCartSummary() {
  return useAppSelector(selectCartSummary);
}

export function useAddToCart() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  return useCallback(
    (product: Product, quantity = 1) => {
      dispatch(itemAdded(product, quantity));
      toast.show({
        message: `${product.name} added`,
        tone: 'success',
        action: {
          label: 'Undo',
          onPress: () => dispatch(itemRemoved(product.id)),
        },
      });
    },
    [dispatch, toast],
  );
}

export function useWishlistToggle() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  return useCallback(
    (product: Product) => {
      const wasSaved = selectIsWishlisted(product.id)(store.getState());
      dispatch(wishlistToggled(product));
      toast.show({
        message: wasSaved ? 'Removed from wishlist' : 'Saved to wishlist',
        tone: 'info',
        durationMs: 1_800,
      });
    },
    [dispatch, toast],
  );
}
