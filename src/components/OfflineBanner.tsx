import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '@/redux/hooks';
import { selectIsOnline } from '@/redux/slices/networkSlice';
import { selectUnsyncedCount } from '@/redux/slices/offlineSlice';
import { useTranslation } from '@/hooks/useTranslation';

export function OfflineBanner() {
  const { t } = useTranslation();
  const isOnline = useAppSelector(selectIsOnline);
  const pendingCount = useAppSelector(selectUnsyncedCount);
  if (isOnline && pendingCount === 0) return null;
  return (
    <View
      testID="offline-banner"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.banner, isOnline ? styles.syncing : styles.offline]}
    >
      <Text style={[styles.text, isOnline && styles.syncingText]}>
        {isOnline
          ? t('common.syncing', {
              count: pendingCount,
            })
          : t('common.offline')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  syncing: {
    backgroundColor: '#FDF0D2',
  },
  offline: {
    backgroundColor: '#E8EAE6',
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
    textAlign: 'center',
  },
  syncingText: {
    color: '#8A5A00',
  },
});
