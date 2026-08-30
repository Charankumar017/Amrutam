import React from 'react';
import { RootNavigator } from '@/navigation/RootNavigator';
import { AppProviders } from '@/components/AppProviders';

export default function App() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
