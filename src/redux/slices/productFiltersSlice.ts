import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { toggle } from '@/utils';
import type { RootState } from '@/redux/store';
import { EMPTY_PRODUCT_FILTERS, type ProductFilters, type ProductSort } from '@/types/shop';

const productFiltersSlice = createSlice({
  name: 'productFilters',
  initialState: EMPTY_PRODUCT_FILTERS as ProductFilters,
  reducers: {
    queryChanged(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    categoryToggled(state, action: PayloadAction<string>) {
      state.categories = toggle(state.categories, action.payload);
    },
    brandToggled(state, action: PayloadAction<string>) {
      state.brands = toggle(state.brands, action.payload);
    },
    concernToggled(state, action: PayloadAction<string>) {
      state.concerns = toggle(state.concerns, action.payload);
    },
    minRatingSet(state, action: PayloadAction<number | null>) {
      state.minRating = action.payload;
    },
    maxPriceSet(state, action: PayloadAction<number | null>) {
      state.maxPrice = action.payload;
    },
    inStockOnlySet(state, action: PayloadAction<boolean>) {
      state.inStockOnly = action.payload;
    },
    sortChanged(state, action: PayloadAction<ProductSort>) {
      state.sort = action.payload;
    },
    filtersReset(state) {
      return {
        ...EMPTY_PRODUCT_FILTERS,
        query: state.query,
      };
    },
  },
});

export const productFilterActions = productFiltersSlice.actions;

export const productFiltersReducer = productFiltersSlice.reducer;

export const selectProductFilters = (state: RootState) => state.productFilters;

export const selectProductQuery = (state: RootState) => state.productFilters.query;

export function countActiveProductFilters(filters: ProductFilters): number {
  return (
    filters.categories.length +
    filters.brands.length +
    filters.concerns.length +
    (filters.minRating === null ? 0 : 1) +
    (filters.maxPrice === null ? 0 : 1) +
    (filters.inStockOnly ? 1 : 0)
  );
}
