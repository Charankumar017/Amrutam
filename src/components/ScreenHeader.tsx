import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface HeaderAction {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  badge?: number;
  testID?: string;
}

export function ScreenHeader({
  title,
  subtitle,
  actions = [],
}: {
  title: string;
  subtitle?: string;
  actions?: readonly HeaderAction[];
}) {
  return (
    <View style={styles.row}>
      <View style={styles.titles}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.actions}>
        {actions.map(action => (
          <Pressable
            key={action.label}
            testID={action.testID}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel}
            hitSlop={8}
            style={styles.action}
          >
            <Text style={styles.actionLabel}>
              {action.badge ? `${action.label} (${action.badge})` : action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  titles: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: '#14170F',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  action: {
    minHeight: 44,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#F4F5F3',
  },
  actionLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#23684A',
  },
});
