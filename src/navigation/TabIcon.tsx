import React, { memo } from 'react';
import { View } from 'react-native';
import type { TabParamList } from '@/navigation/types';

export type TabIconName = keyof TabParamList;

const SIZE = 22;

export const TabIcon = memo(function TabIcon({ name, color }: { name: TabIconName; color: string }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: SIZE,
        height: SIZE,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {name === 'Consult' ? <PersonIcon color={color} /> : null}
      {name === 'Shop' ? <BagIcon color={color} /> : null}
      {name === 'Records' ? <TimelineIcon color={color} /> : null}
    </View>
  );
});

function PersonIcon({ color }: { color: string }) {
  return (
    <View
      style={{
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          borderWidth: 1.6,
          borderColor: color,
        }}
      />
      <View
        style={{
          width: 16,
          height: 8,
          marginTop: 2,
          borderWidth: 1.6,
          borderBottomWidth: 0,
          borderColor: color,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      />
    </View>
  );
}

function BagIcon({ color }: { color: string }) {
  return (
    <View
      style={{
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 9,
          height: 5,
          borderWidth: 1.6,
          borderBottomWidth: 0,
          borderColor: color,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        }}
      />
      <View
        style={{
          width: 17,
          height: 13,
          borderWidth: 1.6,
          borderColor: color,
          borderRadius: 3,
        }}
      />
    </View>
  );
}

function TimelineIcon({ color }: { color: string }) {
  return (
    <View
      style={{
        gap: 3,
      }}
    >
      {[0, 1, 2].map(row => (
        <View
          key={row}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <View
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: color,
            }}
          />
          <View
            style={{
              width: row === 2 ? 8 : 12,
              height: 1.8,
              borderRadius: 1,
              backgroundColor: color,
            }}
          />
        </View>
      ))}
    </View>
  );
}
