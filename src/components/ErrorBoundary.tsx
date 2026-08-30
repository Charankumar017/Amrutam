import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { createLogger } from '@/utils/logger';
import { useTranslation } from '@/hooks/useTranslation';

const log = createLogger('error-boundary');

interface Props {
  children: React.ReactNode;
  scope: string;
  resetKeys?: readonly unknown[];
}

export function ErrorBoundary({ children, scope, resetKeys }: Props) {
  const onError = useCallback(
    (
      error: unknown,
      info: {
        componentStack?: string | null;
      },
    ) => {
      const thrown = error instanceof Error ? error : new Error(String(error));
      log.error(thrown.message, {
        boundary: scope,
        stack: thrown.stack,
        componentStack: info.componentStack,
      });
    },
    [scope],
  );
  return (
    <ReactErrorBoundary
      FallbackComponent={Fallback}
      onError={onError}
      resetKeys={resetKeys ? [...resetKeys] : undefined}
    >
      {children}
    </ReactErrorBoundary>
  );
}

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
  const { t } = useTranslation();
  const message = error instanceof Error ? error.message : String(error);
  return (
    <View testID="error-boundary-fallback" accessibilityRole="alert" style={styles.container}>
      <Text style={styles.title}>{t('error.boundaryTitle')}</Text>
      <Text style={styles.body}>{t('error.boundaryBody')}</Text>
      {__DEV__ ? <Text style={styles.detail}>{message}</Text> : null}
      <Pressable
        onPress={resetErrorBoundary}
        accessibilityRole="button"
        accessibilityLabel={t('error.boundaryAction')}
        testID="error-boundary-reset"
        style={styles.button}
      >
        <Text style={styles.buttonLabel}>{t('error.boundaryAction')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: '#14170F',
    textAlign: 'center',
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
    textAlign: 'center',
  },
  detail: {
    fontSize: 13,
    lineHeight: 18,
    color: '#8C2F1F',
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
