import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  glyph = '🌿',
  testID,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  glyph?: string;
  testID?: string;
}) {
  return (
    <View testID={testID} accessibilityRole="summary" style={styles.container}>
      <Text style={styles.glyph} accessibilityElementsHidden>
        {glyph}
      </Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button" style={styles.button}>
          <Text style={styles.buttonLabel}>{actionLabel}</Text>
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
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
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
