import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ScreenContainer({
  children,
  edges = ['bottom'],
  padded = false,
  style,
  testID,
}: {
  children: React.ReactNode;
  edges?: readonly ('top' | 'bottom')[];
  padded?: boolean;
  style?: ViewStyle;
  testID?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      testID={testID}
      style={[
        styles.screen,
        {
          paddingTop: edges.includes('top') ? insets.top : 0,
          paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
          paddingHorizontal: padded ? 16 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FBFBFA',
  },
});
