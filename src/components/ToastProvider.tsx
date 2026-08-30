import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastTone = 'info' | 'success' | 'error' | 'warning';

export interface ToastOptions {
  message: string;
  tone?: ToastTone;
  durationMs?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface Toast extends Required<Pick<ToastOptions, 'message' | 'tone' | 'durationMs'>> {
  id: number;
  action?: ToastOptions['action'];
}

interface ToastContextValue {
  show(options: ToastOptions): void;
  dismiss(): void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const nextId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setToast(null);
  }, []);
  const show = useCallback((options: ToastOptions) => {
    if (timer.current) clearTimeout(timer.current);
    const next: Toast = {
      id: nextId.current++,
      message: options.message,
      tone: options.tone ?? 'info',
      durationMs: options.durationMs ?? 3_200,
      ...(options.action
        ? {
            action: options.action,
          }
        : {}),
    };
    setToast(next);
    AccessibilityInfo?.announceForAccessibility?.(next.message);
    timer.current = setTimeout(() => setToast(null), next.durationMs);
  }, []);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const value = useMemo(
    () => ({
      show,
      dismiss,
    }),
    [show, dismiss],
  );
  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <ToastView toast={toast} onDismiss={dismiss} /> : null}
    </ToastContext.Provider>
  );
}

const TONE_STYLE: Record<
  ToastTone,
  {
    backgroundColor: string;
    borderColor: string;
  }
> = {
  info: {
    backgroundColor: '#F4F5F3',
    borderColor: '#D4D8D1',
  },
  success: {
    backgroundColor: '#EEF8F2',
    borderColor: '#23684A',
  },
  warning: {
    backgroundColor: '#FDF0D2',
    borderColor: '#8A5A00',
  },
  error: {
    backgroundColor: '#FBE3DE',
    borderColor: '#8C2F1F',
  },
};

function ToastView({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    slide.setValue(0);
    const animation = Animated.spring(slide, {
      toValue: 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 180,
    });
    animation.start();
    return () => animation.stop();
  }, [slide, toast.id]);
  return (
    <Animated.View
      pointerEvents="box-none"
      testID="toast"
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[
        styles.wrapper,
        {
          bottom: insets.bottom + 32,
          transform: [
            {
              translateY: slide.interpolate({
                inputRange: [0, 1],
                outputRange: [24, 0],
              }),
            },
          ],
          opacity: slide,
        },
      ]}
    >
      <View style={[styles.toast, TONE_STYLE[toast.tone]]}>
        <Text style={styles.message}>{toast.message}</Text>
        {toast.action ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={toast.action.label}
            onPress={() => {
              toast.action?.onPress();
              onDismiss();
            }}
            hitSlop={8}
          >
            <Text style={styles.action}>{toast.action.label}</Text>
          </Pressable>
        ) : (
          <Pressable accessibilityRole="button" accessibilityLabel="Dismiss" onPress={onDismiss} hitSlop={8}>
            <Text style={styles.dismiss}>×</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
  },
  message: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#14170F',
  },
  action: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#23684A',
  },
  dismiss: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#5D665A',
  },
});
