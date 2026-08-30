import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';

export function ListFooter({
  isFetchingNextPage,
  hasNextPage,
  count,
  total,
}: {
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  count: number;
  total: number;
}) {
  const { t } = useTranslation();
  if (count === 0) return null;
  return (
    <View style={styles.footer}>
      {isFetchingNextPage ? <ActivityIndicator color="#23684A" /> : null}
      <Text style={styles.label}>
        {hasNextPage
          ? t('common.showingSome', {
              count: count.toLocaleString(),
              total: total.toLocaleString(),
            })
          : t('common.showingAll', {
              total: total.toLocaleString(),
            })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
  },
});
