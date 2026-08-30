import React, { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AttachmentThumb } from '@/components/AttachmentThumb';
import { ErrorState } from '@/components/ErrorState';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useHealthRecord } from '@/hooks/useHealthRecords';
import { RECORD_TYPE_GLYPH, RECORD_TYPE_LABEL } from '@/utils/timeline';
import { formatDateTime } from '@/utils';
import type { RootScreenProps } from '@/navigation/types';
import type { Attachment } from '@/types/healthRecords';

export function RecordDetailScreen({ route, navigation }: RootScreenProps<'RecordDetail'>) {
  const { recordId } = route.params;
  const record = useHealthRecord(recordId);
  const openAttachment = useCallback(
    (attachment: Attachment) =>
      navigation.navigate('AttachmentPreview', {
        recordId,
        attachmentId: attachment.id,
      }),
    [navigation, recordId],
  );
  if (record.isLoading) {
    return (
      <ScreenContainer testID="record-detail-loading">
        <ActivityIndicator size="large" color="#23684A" style={styles.loader} />
      </ScreenContainer>
    );
  }
  if (record.isError || !record.data) {
    return (
      <ScreenContainer testID="record-detail-error">
        <ErrorState error={record.error} onRetry={() => void record.refetch()} />
      </ScreenContainer>
    );
  }
  const item = record.data;
  return (
    <ScreenContainer testID="record-detail-screen">
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.stack}>
          <View style={styles.titleRow}>
            <Text style={styles.glyph} accessibilityElementsHidden>
              {RECORD_TYPE_GLYPH[item.type]}
            </Text>
            <View style={styles.grow}>
              <Text style={styles.title} accessibilityRole="header">
                {item.title}
              </Text>
              <Text style={styles.meta}>{`${RECORD_TYPE_LABEL[item.type]} · ${formatDateTime(
                item.recordedAt,
              )}`}</Text>
            </View>
          </View>
          <Text style={styles.meta}>{item.provider}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.summary}>{item.summary}</Text>
          {item.severity ? (
            <View style={[styles.badge, item.severity === 'high' ? styles.badgeDanger : styles.badgeAccent]}>
              <Text
                style={[
                  styles.badgeText,
                  item.severity === 'high' ? styles.badgeTextDanger : styles.badgeTextAccent,
                ]}
              >
                {`SEVERITY: ${item.severity.toUpperCase()}`}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.stack}>
          <Text style={styles.heading} accessibilityRole="header">
            TAGS
          </Text>
          <View style={styles.badges}>
            {item.tags.map(tag => (
              <View key={tag} style={[styles.badge, styles.badgeNeutral]}>
                <Text style={styles.badgeText}>{tag.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>

        {item.attachments.length > 0 ? (
          <View style={styles.stack}>
            <Text style={styles.heading} accessibilityRole="header">
              {`${item.attachments.length} ATTACHMENT(S)`}
            </Text>
            <View style={styles.attachments}>
              {item.attachments.map(attachment => (
                <AttachmentThumb
                  key={attachment.id}
                  attachment={attachment}
                  size={80}
                  onPress={openAttachment}
                />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 32 },
  scroll: {
    padding: 16,
    gap: 16,
  },
  stack: {
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  grow: {
    flex: 1,
  },
  glyph: {
    fontSize: 24,
    lineHeight: 30,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: '#14170F',
  },
  meta: {
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
    gap: 12,
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
    color: '#14170F',
  },
  heading: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#5D665A',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  attachments: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeNeutral: {
    backgroundColor: '#E8EAE6',
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
  badgeTextAccent: {
    color: '#8A5A00',
  },
  badgeTextDanger: {
    color: '#8C2F1F',
  },
});
