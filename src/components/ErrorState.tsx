import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { toApiError } from '@/services/errors';
import { useTranslation } from '@/hooks/useTranslation';

export function ErrorState({
  error,
  onRetry,
  testID,
  compact = false,
}: {
  error: unknown;
  onRetry?: () => void;
  testID?: string;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const failure = toApiError(error);
  const isOffline = failure.code === 'offline';
  return (
    <View testID={testID} accessibilityRole="alert" style={[styles.container, compact && styles.compact]}>
      <Text style={styles.glyph} accessibilityElementsHidden>
        {isOffline ? '📴' : '⚠️'}
      </Text>
      <Text style={styles.title}>{isOffline ? t('error.offlineTitle') : t('error.title')}</Text>
      <Text style={styles.message}>{failure.userMessage}</Text>
      {__DEV__ ? <Text style={styles.code}>{failure.code}</Text> : null}
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          testID={testID ? `${testID}-retry` : undefined}
          style={styles.button}
        >
          <Text style={styles.buttonLabel}>{t('common.retry')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  compact: {
    padding: 16,
  },
  glyph: {
    fontSize: 24,
    lineHeight: 30,
  },
  title: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    color: '#14170F',
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
    textAlign: 'center',
  },
  code: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
    textAlign: 'center',
  },
  button: {
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D4D8D1',
    backgroundColor: '#FFFFFF',
  },
  buttonLabel: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: '#14170F',
  },
});
