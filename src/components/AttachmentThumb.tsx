import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Attachment } from '@/types/healthRecords';

const THUMB_HUES = [86, 140, 168, 42, 12, 200, 265, 320];

export const AttachmentThumb = memo(function AttachmentThumb({
  attachment,
  size = 56,
  onPress,
}: {
  attachment: Attachment;
  size?: number;
  onPress?: (attachment: Attachment) => void;
}) {
  const hue = THUMB_HUES[attachment.thumbSeed % THUMB_HUES.length]!;
  const label = `${attachment.kind === 'pdf' ? 'PDF' : 'Image'}, ${attachment.name}, ${Math.round(
    attachment.sizeKb,
  )} kilobytes`;
  const content = (
    <View
      style={[
        styles.wrapper,
        {
          width: size,
        },
      ]}
    >
      <View>
        <View
          style={[
            styles.thumb,
            {
              width: size,
              height: size,
              backgroundColor: `hsl(${hue}, 45%, 90%)`,
            },
          ]}
        />
        {attachment.kind === 'pdf' ? (
          <View style={styles.pdfBadge}>
            <Text style={styles.pdfLabel}>
              {attachment.pageCount ? `PDF · ${attachment.pageCount}p` : 'PDF'}
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {attachment.name}
      </Text>
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      testID={`attachment-${attachment.id}`}
      onPress={() => onPress(attachment)}
      accessibilityRole="imagebutton"
      accessibilityLabel={label}
      accessibilityHint="Opens a larger preview"
    >
      {content}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 4,
  },
  thumb: {
    borderRadius: 10,
  },
  pdfBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingVertical: 1,
  },
  pdfLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#8C2F1F',
  },
  name: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#5D665A',
  },
});
