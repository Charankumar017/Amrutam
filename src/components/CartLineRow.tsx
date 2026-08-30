import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from '@/utils';
import type { CartLine } from '@/types/shop';
import { useTranslation } from '@/hooks/useTranslation';

const THUMB_HUES = [86, 140, 168, 42, 12, 200, 265, 320];

export const CartLineRow = memo(function CartLineRow({
  line,
  onChangeQuantity,
  onRemove,
}: {
  line: CartLine;
  onChangeQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}) {
  const { t } = useTranslation();
  const hue = THUMB_HUES[line.imageSeed % THUMB_HUES.length]!;
  return (
    <View testID={`cart-line-${line.productId}`} style={styles.card}>
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
            {line.name}
          </Text>
          <Text style={styles.meta}>{line.brand}</Text>

          <View style={styles.footerRow}>
            <Text style={styles.price}>{formatCurrency(line.unitPrice * line.quantity)}</Text>

            <View
              testID={`cart-qty-${line.productId}`}
              accessibilityLabel={`${line.name}, quantity ${line.quantity}`}
              style={styles.stepper}
            >
              <Pressable
                testID={`cart-qty-${line.productId}-dec`}
                onPress={() =>
                  line.quantity - 1 === 0
                    ? onRemove(line.productId)
                    : onChangeQuantity(line.productId, line.quantity - 1)
                }
                accessibilityRole="button"
                accessibilityLabel={`Decrease quantity of ${line.name}`}
                hitSlop={6}
                style={styles.stepButton}
              >
                <Text style={styles.stepLabel}>−</Text>
              </Pressable>
              <Text style={styles.quantity}>{line.quantity}</Text>
              <Pressable
                testID={`cart-qty-${line.productId}-inc`}
                onPress={() => onChangeQuantity(line.productId, line.quantity + 1)}
                accessibilityRole="button"
                accessibilityLabel={`Increase quantity of ${line.name}`}
                hitSlop={6}
                style={styles.stepButton}
              >
                <Text style={styles.stepLabel}>+</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            testID={`cart-remove-${line.productId}`}
            onPress={() => onRemove(line.productId)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${line.name} from cart`}
          >
            <Text style={styles.remove}>{t('shop.remove')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  thumb: {
    width: 56,
    height: 56,
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  price: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    color: '#14170F',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F5F3',
  },
  stepLabel: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    color: '#14170F',
  },
  quantity: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: '#14170F',
  },
  remove: {
    fontSize: 13,
    lineHeight: 18,
    color: '#8C2F1F',
  },
});
