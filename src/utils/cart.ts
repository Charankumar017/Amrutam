import type { CartLine, CheckoutSummary, Product } from '@/types/shop';

const TAX_RATE = 0.05;

export const SHIPPING_FEE = 49;

export interface CartRules {
  readonly maxQuantity: number;
  readonly freeShippingThreshold: number;
}

export const DEFAULT_CART_RULES: CartRules = {
  maxQuantity: 10,
  freeShippingThreshold: 999,
};

export function addLine(
  lines: readonly CartLine[],
  product: Product,
  quantity: number,
  rules: CartRules,
): CartLine[] {
  if (quantity <= 0) return [...lines];
  const existing = lines.find(line => line.productId === product.id);
  if (existing) {
    return setQuantity(lines, product.id, existing.quantity + quantity, rules);
  }
  return [
    ...lines,
    {
      productId: product.id,
      name: product.name,
      brand: product.brand,
      unitPrice: product.price,
      mrp: product.mrp,
      imageSeed: product.imageSeed,
      quantity: Math.min(quantity, rules.maxQuantity),
      addedAt: Date.now(),
    },
  ];
}

export function setQuantity(
  lines: readonly CartLine[],
  productId: string,
  quantity: number,
  rules: CartRules,
): CartLine[] {
  const clamped = Math.max(0, Math.min(quantity, rules.maxQuantity));
  if (clamped === 0) return removeLine(lines, productId);
  return lines.map(line =>
    line.productId === productId
      ? {
          ...line,
          quantity: clamped,
        }
      : line,
  );
}

export function removeLine(lines: readonly CartLine[], productId: string): CartLine[] {
  return lines.filter(line => line.productId !== productId);
}

export function cartCount(lines: readonly CartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function summarise(lines: readonly CartLine[], rules: CartRules): CheckoutSummary {
  const subtotal = lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0);
  const listTotal = lines.reduce((total, line) => total + line.mrp * line.quantity, 0);
  const itemCount = cartCount(lines);
  const shipping = itemCount === 0 || subtotal >= rules.freeShippingThreshold ? 0 : SHIPPING_FEE;
  const tax = Math.round(subtotal * TAX_RATE);
  return {
    itemCount,
    subtotal: Math.round(subtotal),
    savings: Math.round(listTotal - subtotal),
    shipping,
    tax,
    total: Math.round(subtotal) + shipping + tax,
  };
}

export function reconcile(
  lines: readonly CartLine[],
  current: ReadonlyMap<string, Product>,
): {
  lines: CartLine[];
  repriced: string[];
  unavailable: string[];
} {
  const repriced: string[] = [];
  const unavailable: string[] = [];
  const next: CartLine[] = [];
  for (const line of lines) {
    const product = current.get(line.productId);
    if (!product) {
      next.push(line);
      continue;
    }
    if (!product.inStock) {
      unavailable.push(line.name);
      continue;
    }
    if (product.price !== line.unitPrice) {
      repriced.push(line.name);
      next.push({
        ...line,
        unitPrice: product.price,
        mrp: product.mrp,
      });
      continue;
    }
    next.push(line);
  }
  return {
    lines: next,
    repriced,
    unavailable,
  };
}
