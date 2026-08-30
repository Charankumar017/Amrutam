import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatDate } from '@/utils';
import { RECORD_TYPE_GLYPH, RECORD_TYPE_LABEL, attachmentSummary } from '@/utils/timeline';
import type { HealthRecord, TimelineSection } from '@/types/healthRecords';

export const TimelineSectionHeader = memo(function TimelineSectionHeader({
  section,
}: {
  section: TimelineSection;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel} accessibilityRole="header">
        {section.label.toUpperCase()}
      </Text>
      <Text style={styles.sectionCount}>{`${section.count} record${section.count > 1 ? 's' : ''}`}</Text>
    </View>
  );
});

export const RecordRow = memo(function RecordRow({
  record,
  onPress,
}: {
  record: HealthRecord;
  onPress: (recordId: string) => void;
}) {
  const attachments = attachmentSummary(record);
  return (
    <Pressable
      testID={`record-row-${record.id}`}
      onPress={() => onPress(record.id)}
      accessibilityRole="button"
      accessibilityLabel={`${RECORD_TYPE_LABEL[record.type]}: ${record.title}, ${formatDate(
        record.recordedAt,
      )}`}
      accessibilityHint="Opens the full record"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <View accessibilityElementsHidden style={styles.glyphBox}>
          <Text style={styles.glyph}>{RECORD_TYPE_GLYPH[record.type]}</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {record.title}
            </Text>
            <Text style={styles.date}>{formatDate(record.recordedAt)}</Text>
          </View>

          <Text style={styles.summary} numberOfLines={2}>
            {record.summary}
          </Text>

          <View style={styles.badges}>
            <View style={[styles.badge, styles.badgeInfo]}>
              <Text style={[styles.badgeText, styles.badgeTextInfo]}>
                {RECORD_TYPE_LABEL[record.type].toUpperCase()}
              </Text>
            </View>
            {record.severity ? (
              <View
                style={[styles.badge, record.severity === 'high' ? styles.badgeDanger : styles.badgeAccent]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    record.severity === 'high' ? styles.badgeTextDanger : styles.badgeTextAccent,
                  ]}
                >
                  {record.severity.toUpperCase()}
                </Text>
              </View>
            ) : null}
            {record.tags.slice(0, 2).map(tag => (
              <View key={tag} style={[styles.badge, styles.badgeNeutral]}>
                <Text style={styles.badgeText}>{tag.toUpperCase()}</Text>
              </View>
            ))}
            {attachments ? <Text style={styles.attachments}>{`📎 ${attachments}`}</Text> : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FBFBFA',
  },
  sectionLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#5D665A',
  },
  sectionCount: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EAE6',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  glyphBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F4F5F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontSize: 17,
    lineHeight: 23,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: '#14170F',
  },
  date: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
  },
  summary: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeNeutral: {
    backgroundColor: '#E8EAE6',
  },
  badgeInfo: {
    backgroundColor: '#DCEBFB',
  },
  badgeAccent: {
    backgroundColor: '#FDF0D2',
  },
  badgeDanger: {
    backgroundColor: '#FBE3DE',
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#5D665A',
  },
  badgeTextInfo: {
    color: '#1B4F8A',
  },
  badgeTextAccent: {
    color: '#8A5A00',
  },
  badgeTextDanger: {
    color: '#8C2F1F',
  },
  attachments: {
    fontSize: 13,
    lineHeight: 18,
    color: '#5D665A',
  },
});
