import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { persistor, store } from '@/redux/store';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NetworkMonitor } from '@/components/NetworkMonitor';
import { ToastProvider } from '@/components/ToastProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <ErrorBoundary scope="root">
            <ToastProvider>
              <NetworkMonitor />
              <NavigationContainer>{children}</NavigationContainer>
            </ToastProvider>
          </ErrorBoundary>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
