import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { remoteConfigApplied } from '@/redux/slices/flagsSlice';
import type { RootState } from '@/redux/store';
import {
  DEFAULT_CART_RULES,
  addLine,
  cartCount,
  removeLine,
  setQuantity,
  summarise,
  type CartRules,
} from '@/utils/cart';
import type { CartLine, Product } from '@/types/shop';

interface CartState {
  lines: CartLine[];
  rules: CartRules;
}

const initialState: CartState = {
  lines: [],
  rules: DEFAULT_CART_RULES,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    itemAdded: {
      reducer(
        state,
        action: PayloadAction<{
          product: Product;
          quantity: number;
        }>,
      ) {
        state.lines = addLine(
          state.lines,
          action.payload.product,
          action.payload.quantity,
          DEFAULT_CART_RULES,
        );
      },
      prepare(product: Product, quantity = 1) {
        return {
          payload: {
            product,
            quantity,
          },
        };
      },
    },
    quantitySet(
      state,
      action: PayloadAction<{
        productId: string;
        quantity: number;
      }>,
    ) {
      state.lines = setQuantity(
        state.lines,
        action.payload.productId,
        action.payload.quantity,
        DEFAULT_CART_RULES,
      );
    },
    itemRemoved(state, action: PayloadAction<string>) {
      state.lines = removeLine(state.lines, action.payload);
    },
    cartCleared(state) {
      state.lines = [];
    },
    linesReplaced(state, action: PayloadAction<CartLine[]>) {
      state.lines = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(remoteConfigApplied, (state, action) => {
      state.rules = {
        maxQuantity: action.payload.values.maxCartQuantity ?? DEFAULT_CART_RULES.maxQuantity,
        freeShippingThreshold:
          action.payload.values.freeShippingThreshold ?? DEFAULT_CART_RULES.freeShippingThreshold,
      };
    });
  },
});

export const { itemAdded, quantitySet, itemRemoved, cartCleared, linesReplaced } = cartSlice.actions;

export const cartReducer = cartSlice.reducer;

export const selectCartLines = (state: RootState) => state.cart.lines;

export const selectCartCount = (state: RootState) => cartCount(state.cart.lines);

export const selectCartSummary = (state: RootState) => summarise(state.cart.lines, state.cart.rules);

export const selectQuantityOf = (productId: string) => (state: RootState) =>
  state.cart.lines.find(line => line.productId === productId)?.quantity ?? 0;
