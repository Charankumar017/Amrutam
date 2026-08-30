export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  concerns: string[];
  price: number;
  mrp: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  description: string;
  imageSeed: number;
  createdAt: string;
}

export type ProductSort = 'relevance' | 'price_asc' | 'price_desc' | 'rating_desc' | 'newest';

export interface ProductFilters {
  readonly query: string;
  readonly categories: readonly string[];
  readonly brands: readonly string[];
  readonly concerns: readonly string[];
  readonly minRating: number | null;
  readonly maxPrice: number | null;
  readonly inStockOnly: boolean;
  readonly sort: ProductSort;
}

export const EMPTY_PRODUCT_FILTERS: ProductFilters = {
  query: '',
  categories: [],
  brands: [],
  concerns: [],
  minRating: null,
  maxPrice: null,
  inStockOnly: false,
  sort: 'relevance',
};

export interface CartLine {
  readonly productId: string;
  readonly name: string;
  readonly brand: string;
  readonly unitPrice: number;
  readonly mrp: number;
  readonly imageSeed: number;
  readonly quantity: number;
  readonly addedAt: number;
}

export interface CheckoutSummary {
  readonly itemCount: number;
  readonly subtotal: number;
  readonly savings: number;
  readonly shipping: number;
  readonly tax: number;
  readonly total: number;
}
