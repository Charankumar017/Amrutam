import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/redux/store';
import type { Product } from '@/types/shop';

interface WishlistState {
  items: Record<string, Product>;
}

const initialState: WishlistState = {
  items: {},
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    wishlistToggled(state, action: PayloadAction<Product>) {
      const product = action.payload;
      if (state.items[product.id]) delete state.items[product.id];
      else state.items[product.id] = product;
    },
    wishlistRemoved(state, action: PayloadAction<string>) {
      delete state.items[action.payload];
    },
    wishlistCleared(state) {
      state.items = {};
    },
  },
});

export const { wishlistToggled, wishlistRemoved, wishlistCleared } = wishlistSlice.actions;

export const wishlistReducer = wishlistSlice.reducer;

export const selectWishlistMap = (state: RootState) => state.wishlist.items;

export const selectWishlistItems = (state: RootState) => Object.values(state.wishlist.items);

export const selectIsWishlisted = (productId: string) => (state: RootState) =>
  Boolean(state.wishlist.items[productId]);
