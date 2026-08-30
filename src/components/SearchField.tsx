import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export const SearchField = memo(function SearchField({
  value,
  onChangeText,
  placeholder = 'Search',
  testID,
  accessibilityLabel,
}: {
  value: string;
  onChangeText: (next: string) => void;
  placeholder?: string;
  testID?: string;
  accessibilityLabel: string;
}) {
  const clear = useCallback(() => onChangeText(''), [onChangeText]);
  return (
    <View style={styles.field}>
      <Text style={styles.icon} accessibilityElementsHidden importantForAccessibility="no">
        ⌕
      </Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#5D665A"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel={accessibilityLabel}
        style={styles.input}
      />
      {value.length > 0 ? (
        <Pressable onPress={clear} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={12}>
          <Text style={styles.clear}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F3',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8EAE6',
    paddingHorizontal: 12,
    minHeight: 44,
  },
  icon: {
    fontSize: 15,
    lineHeight: 22,
    color: '#5D665A',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#14170F',
  },
  clear: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: '#5D665A',
  },
});
