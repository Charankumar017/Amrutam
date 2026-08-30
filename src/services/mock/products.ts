import type { Product } from '@/types/shop';
import { createRandom } from '@/services/mock/random';
import {
  PRODUCT_BRANDS,
  PRODUCT_CATEGORIES,
  PRODUCT_CONCERNS,
  PRODUCT_FORMS,
  PRODUCT_NOUNS,
} from '@/services/mock/vocab';

export interface ProductRow {
  readonly product: Product;
  readonly search: string;
}

export function generateProducts(count: number, seed: number, now: number): ProductRow[] {
  const rng = createRandom(seed);
  const rows: ProductRow[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const brand = rng.pick(PRODUCT_BRANDS);
    const noun = rng.pick(PRODUCT_NOUNS);
    const form = rng.pick(PRODUCT_FORMS);
    const grams = rng.pick([50, 100, 200, 250, 500]);
    const name = `${brand} ${noun} ${form} ${grams}g`;
    const category = rng.pick(PRODUCT_CATEGORIES);
    const concerns = rng.pickMany(PRODUCT_CONCERNS, rng.int(1, 3));
    const mrp = rng.int(3, 60) * 50;
    const discount = rng.pick([0, 0, 5, 10, 15, 20, 25, 30]);
    const product: Product = {
      id: `prd_${i.toString(36).padStart(5, '0')}`,
      name,
      brand,
      category,
      concerns,
      price: Math.round((mrp * (100 - discount)) / 100),
      mrp,
      rating: rng.float(2.8, 5, 1),
      reviewCount: rng.int(0, 8_000),
      inStock: rng.bool(0.88),
      description: `A classical ${category.toLowerCase()} preparation of ${noun}. Traditionally used to support ${concerns
        .join(', ')
        .toLowerCase()}. Made in a GMP-certified facility with third-party heavy-metal testing.`,
      imageSeed: rng.int(0, 9_999),
      createdAt: new Date(now - rng.int(0, 900) * 86_400_000).toISOString(),
    };
    rows[i] = {
      product,
      search: `${name} ${brand} ${category} ${concerns.join(' ')}`.toLowerCase(),
    };
  }
  return rows;
}
